//! SSRF guards for user-supplied fetch URLs (`?url=`, endpoint schema).
//!
//! The badge server fetches attacker-controlled URLs server-side, so the
//! fetch path must never become a tunnel into the deployment's private
//! network (cloud metadata endpoints, internal admin panels, …). Two layers:
//!
//! 1. **URL host check** (`assert_url_host_is_public`) — rejects requests
//!    whose host is an IP literal inside a private/reserved range before any
//!    I/O. Hostnames pass here and are caught by layer 2.
//! 2. **DNS resolver** (`PublicHostDns`) — plugged into the shared reqwest
//!    client. Every hostname resolution happens ONCE through it and the
//!    resolved addresses are the exact ones the connection uses (no
//!    check-then-connect gap, so no DNS-rebinding window). Any address that
//!    is not globally routable unicast fails the whole fetch.
//!
//! Debug builds allow loopback (the integration tests fetch wiremock on
//! 127.0.0.1); release builds never do — mirroring `allow_insecure_loopback`.

use std::net::{IpAddr, Ipv4Addr, Ipv6Addr, SocketAddr};

use vexillum_core::{Error, Result};

/// True when `ip` is safe for a server-side fetch: globally routable
/// unicast. Everything else — loopback, RFC1918, link-local, ULA,
/// multicast, documentation/benchmark ranges, NAT64/v4-mapped embeds — is
/// rejected. Debug builds additionally allow loopback (the wiremock
/// integration tests fetch 127.0.0.1); use [`is_public_ip_strict`] to
/// bypass that allowance in tests.
pub fn is_public_ip(ip: IpAddr) -> bool {
    if loopback_allowed() {
        if let IpAddr::V4(v4) = ip {
            if v4.is_loopback() {
                return true;
            }
        }
        if let IpAddr::V6(v6) = ip {
            if v6.is_loopback() {
                return true;
            }
        }
    }
    is_public_ip_strict(ip)
}

/// The allowance-free check: loopback is never public here.
pub fn is_public_ip_strict(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(v4) => is_public_v4(v4),
        IpAddr::V6(v6) => {
            // ::ffff:0:0/96 embeds an IPv4 the host may treat as v4 — the
            // embedded address decides
            if let Some(v4) = v6.to_ipv4_mapped() {
                return is_public_v4(v4);
            }
            is_public_v6(v6)
        }
    }
}

fn is_public_v4(v4: Ipv4Addr) -> bool {
    let o = v4.octets();
    !(v4.is_unspecified()
        || v4.is_loopback()
        || v4.is_private()
        || v4.is_link_local()
        || v4.is_broadcast()
        || v4.is_multicast()
        || v4.is_documentation()
        // RFC 1112 reserved 240.0.0.0/4 (std is_reserved is still unstable)
        || o[0] >= 240
        // RFC 6598 CGNAT 100.64.0.0/10 (shared address space)
        || (o[0] == 100 && (64..=127).contains(&o[1]))
        // RFC 2544 benchmark range 198.18.0.0/15
        || (o[0] == 198 && matches!(o[1], 18 | 19)))
}

fn is_public_v6(v6: Ipv6Addr) -> bool {
    // NAT64 64:ff9b::/96 embeds an IPv4 in the last 32 bits — the embedded
    // address decides
    let s = v6.segments();
    if s[0] == 0x64 && s[1] == 0xff9b && s[2..6] == [0, 0, 0, 0] {
        let v4 = Ipv4Addr::new(
            (s[6] >> 8) as u8,
            (s[6] & 0xff) as u8,
            (s[7] >> 8) as u8,
            (s[7] & 0xff) as u8,
        );
        return is_public_v4(v4);
    }
    !(v6.is_unspecified()
        || v6.is_loopback()
        || v6.is_unique_local()
        || v6.is_unicast_link_local()
        || v6.is_multicast()
        // RFC 3849 documentation 2001:db8::/32 (std is_documentation unstable)
        || (s[0] == 0x2001 && s[1] == 0x0db8))
}

/// Debug builds allow loopback (wiremock integration tests fetch
/// `127.0.0.1`); release builds never do.
fn loopback_allowed() -> bool {
    cfg!(debug_assertions)
}

/// Rejects an IP that `is_public_ip` refuses, with a user-facing message.
pub fn assert_ip_allowed(ip: IpAddr) -> Result<()> {
    if is_public_ip(ip) {
        Ok(())
    } else {
        Err(Error::BadRequest(format!(
            "url host '{ip}' is a private or reserved address and cannot be fetched"
        )))
    }
}

/// Layer 1: when `url`'s host is an IP literal, it must be fetchable.
/// Hostnames return `Ok(())` here — `PublicHostDns` guards them at
/// resolution time (and no DNS was done for an IP literal, so the resolver
/// never runs for one).
pub fn assert_url_host_is_public(url: &url::Url) -> Result<()> {
    let Some(host) = url.host_str() else {
        return Err(Error::BadRequest("url has no host".into()));
    };
    match host.trim_start_matches('[').trim_end_matches(']').parse::<IpAddr>() {
        Ok(ip) => assert_ip_allowed(ip),
        // a real hostname — the DNS resolver layer covers it
        Err(_) => Ok(()),
    }
}

/// reqwest DNS resolver that resolves once and yields ONLY verified-public
/// addresses. Plugged into the shared data client, this is layer 2: the
/// connection uses exactly the addresses checked here, so a hostname cannot
/// smuggle a private network past the URL check (and rebinding cannot race
/// the check — there is no second resolution).
pub struct PublicHostDns;

impl reqwest::dns::Resolve for PublicHostDns {
    fn resolve(&self, name: reqwest::dns::Name) -> reqwest::dns::Resolving {
        Box::pin(async move {
            let host = name.as_str().to_string();
            let addrs: Vec<SocketAddr> = tokio::net::lookup_host((host.as_str(), 0u16))
                .await
                .map_err(|e| -> Box<dyn std::error::Error + Send + Sync> { Box::new(e) })?
                .collect();
            if addrs.is_empty() {
                return Err("dns returned no addresses".into());
            }
            for addr in &addrs {
                if !is_public_ip(addr.ip()) {
                    return Err(format!(
                        "host '{host}' resolves to a private or reserved address ({})",
                        addr.ip()
                    )
                    .into());
                }
            }
            Ok(Box::new(addrs.into_iter()) as reqwest::dns::Addrs)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    fn v4(o: [u8; 4]) -> IpAddr {
        IpAddr::V4(Ipv4Addr::from(o))
    }
    fn v6(s: &str) -> IpAddr {
        IpAddr::V6(s.parse().unwrap())
    }

    #[test]
    fn loopback_and_private_ranges_are_blocked() {
        for ip in [
            v4([127, 0, 0, 1]),
            v4([10, 0, 0, 5]),
            v4([172, 16, 3, 9]),
            v4([172, 31, 255, 1]),
            v4([192, 168, 1, 1]),
            v4([169, 254, 169, 254]), // cloud metadata
            v4([0, 0, 0, 0]),
            v4([100, 64, 1, 2]),   // CGNAT shared address space
            v4([100, 127, 255, 1]),
            v4([198, 18, 0, 1]),   // benchmark
            v4([192, 0, 2, 9]),    // documentation
            v4([224, 0, 0, 1]),    // multicast
            v4([240, 0, 0, 1]),    // reserved
            v6("::1"),
            v6("fe80::1"),
            v6("fc00::5"),
            v6("fd12:3456::1"),
            v6("2001:db8::1"),
            v6("ff02::1"),
            v6("::ffff:169.254.169.254"), // v4-mapped metadata
            v6("64:ff9b::a9fe:a9fe"),     // NAT64-embedded metadata
        ] {
            assert!(!is_public_ip_strict(ip), "{ip} must be blocked");
        }
        // the runtime check allows loopback ONLY in debug builds (wiremock)
        assert_eq!(is_public_ip(v4([127, 0, 0, 1])), cfg!(debug_assertions));
        assert_eq!(is_public_ip(v6("::1")), cfg!(debug_assertions));
    }

    #[test]
    fn routable_public_addresses_pass() {
        for ip in [
            v4([1, 1, 1, 1]),
            v4([8, 8, 8, 8]),
            v4([93, 184, 216, 34]),
            v6("2606:4700::1111"),
            v6("2a00:1450:4001:81b::200e"),
        ] {
            assert!(is_public_ip(ip), "{ip} must be allowed");
        }
    }

    #[test]
    fn url_ip_literal_hosts_are_checked() {
        // strict check mirrors the release posture regardless of build mode
        for raw in [
            "https://169.254.169.254/x",
            "https://10.1.2.3/x",
            "https://[::1]/x",
            "https://[::ffff:10.0.0.1]/x",
            "http://127.0.0.1/x",
        ] {
            let parsed = url::Url::parse(raw).unwrap();
            let host = parsed.host_str().unwrap().trim_start_matches('[').trim_end_matches(']');
            let ip: IpAddr = host.parse().unwrap();
            assert!(!is_public_ip_strict(ip), "{raw} must be blocked strictly");
        }
        // hostnames pass layer 1 (the DNS resolver guards them)
        assert!(assert_url_host_is_public(&url::Url::parse("https://example.com/x").unwrap())
            .is_ok());
        // the runtime posture in this (debug) build allows loopback — the
        // wiremock integration tests depend on that
        if cfg!(debug_assertions) {
            assert!(assert_url_host_is_public(&url::Url::parse("http://127.0.0.1:1/x").unwrap())
                .is_ok());
        }
    }
}
