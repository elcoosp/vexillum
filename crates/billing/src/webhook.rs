//! Stripe webhook signature verification (`Stripe-Signature: t=…,v1=…`).
//!
//! The scheme is HMAC-SHA256 over `{timestamp}.{payload}` with the webhook
//! signing secret, compared in constant time, with a replay window.

use hmac_cmp::ct_eq;
use sha2::{Digest, Sha256};

/// Default replay window: 5 minutes (Stripe's own guidance).
pub const DEFAULT_TOLERANCE_SECS: u64 = 300;

/// HMAC-SHA256 of `message` under `secret`.
pub fn hmac_sha256(secret: &[u8], message: &[u8]) -> [u8; 32] {
    const BLOCK: usize = 64;
    let mut key = [0u8; BLOCK];
    if secret.len() > BLOCK {
        let mut h = Sha256::new();
        h.update(secret);
        key[..32].copy_from_slice(&h.finalize());
    } else {
        key[..secret.len()].copy_from_slice(secret);
    }
    let mut ipad = [0x36u8; BLOCK];
    let mut opad = [0x5cu8; BLOCK];
    for i in 0..BLOCK {
        ipad[i] ^= key[i];
        opad[i] ^= key[i];
    }
    let mut inner = Sha256::new();
    inner.update(ipad);
    inner.update(message);
    let inner_hash = inner.finalize();
    let mut outer = Sha256::new();
    outer.update(opad);
    outer.update(inner_hash);
    outer.finalize().into()
}

/// Constant-time equality for MACs.
mod hmac_cmp {
    pub fn ct_eq(a: &[u8], b: &[u8]) -> bool {
        if a.len() != b.len() {
            return false;
        }
        let mut diff = 0u8;
        for (x, y) in a.iter().zip(b.iter()) {
            diff |= x ^ y;
        }
        diff == 0
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VerifiedSignature {
    pub timestamp_secs: u64,
}

/// Verifies a `Stripe-Signature` header against the raw body.
pub fn verify_signature(
    header: &str,
    payload: &[u8],
    secret: &str,
    now_secs: u64,
) -> Result<VerifiedSignature, vexillum_core::Error> {
    let mut timestamp: Option<u64> = None;
    let mut signatures: Vec<Vec<u8>> = Vec::new();

    for part in header.split(',') {
        let part = part.trim();
        if let Some(t) = part.strip_prefix("t=") {
            timestamp = t.parse().ok();
        } else if let Some(v) = part.strip_prefix("v1=") {
            signatures.push(decode_hex(v));
        }
    }
    let ts =
        timestamp.ok_or_else(|| vexillum_core::Error::Unauthorized("missing timestamp".into()))?;
    if signatures.is_empty() {
        return Err(vexillum_core::Error::Unauthorized(
            "missing v1 signature".into(),
        ));
    }
    let skew = now_secs.saturating_sub(ts);
    if skew > DEFAULT_TOLERANCE_SECS {
        return Err(vexillum_core::Error::Unauthorized(format!(
            "timestamp outside tolerance ({skew}s > {}s)",
            DEFAULT_TOLERANCE_SECS
        )));
    }
    let mut signed = Vec::with_capacity(payload.len() + 24);
    signed.extend_from_slice(ts.to_string().as_bytes());
    signed.push(b'.');
    signed.extend_from_slice(payload);
    let expected = hmac_sha256(secret.as_bytes(), &signed);
    for sig in &signatures {
        if ct_eq(sig.as_slice(), &expected) {
            return Ok(VerifiedSignature { timestamp_secs: ts });
        }
    }
    Err(vexillum_core::Error::Unauthorized(
        "signature mismatch".into(),
    ))
}

fn decode_hex(s: &str) -> Vec<u8> {
    (0..s.len() / 2)
        .filter_map(|i| u8::from_str_radix(&s[i * 2..i * 2 + 2], 16).ok())
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    const SECRET: &str = "whsec_test_123";

    fn sign(payload: &str, ts: u64, secret: &str) -> String {
        let mac = hmac_sha256(secret.as_bytes(), format!("{ts}.{payload}").as_bytes());
        let hexed: String = mac.iter().map(|b| format!("{b:02x}")).collect();
        format!("t={ts},v1={hexed}")
    }

    #[test]
    fn hmac_matches_known_vector() {
        // RFC 4231 test case 2
        let mac = hmac_sha256(b"Jefe", b"what do ya want for nothing?");
        let hexed: String = mac.iter().map(|b| format!("{b:02x}")).collect();
        assert_eq!(
            hexed,
            "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
        );
    }

    #[test]
    fn valid_signature_passes() {
        let payload = r#"{"id":"evt_1","type":"checkout.session.completed"}"#;
        let header = sign(payload, 1_700_000_000, SECRET);
        let ok = verify_signature(&header, payload.as_bytes(), SECRET, 1_700_000_100).unwrap();
        assert_eq!(ok.timestamp_secs, 1_700_000_000);
    }

    #[test]
    fn tampered_payload_fails() {
        let payload = r#"{"id":"evt_1","type":"checkout.session.completed"}"#;
        let header = sign(payload, 1_700_000_000, SECRET);
        let tampered = payload.replace("completed", "failed");
        assert!(verify_signature(&header, tampered.as_bytes(), SECRET, 1_700_000_100).is_err());
    }

    #[test]
    fn wrong_secret_fails() {
        let payload = "{}";
        let header = sign(payload, 1_700_000_000, SECRET);
        assert!(
            verify_signature(&header, payload.as_bytes(), "whsec_other", 1_700_000_100).is_err()
        );
    }

    #[test]
    fn stale_timestamp_rejected() {
        let payload = "{}";
        let header = sign(payload, 1_690_000_000, SECRET);
        let e = verify_signature(&header, payload.as_bytes(), SECRET, 1_700_000_100).unwrap_err();
        assert_eq!(e.status(), 401);
    }

    #[test]
    fn missing_parts_rejected() {
        assert!(verify_signature("v1=deadbeef", b"{}", SECRET, 0).is_err());
        assert!(verify_signature("t=123", b"{}", SECRET, 200).is_err());
        assert!(verify_signature("garbage", b"{}", SECRET, 200).is_err());
    }

    #[test]
    fn multiple_v1_any_match_wins() {
        let payload = "{}";
        let ts = 1_700_000_000;
        let good = {
            let mac = hmac_sha256(SECRET.as_bytes(), format!("{ts}.{payload}").as_bytes());
            let hexed: String = mac.iter().map(|b| format!("{b:02x}")).collect();
            hexed
        };
        let header = format!(
            "t={ts},v1=0000000000000000000000000000000000000000000000000000000000000000,v1={good}"
        );
        assert!(verify_signature(&header, payload.as_bytes(), SECRET, ts + 10).is_ok());
    }
}
