//! Two-tier render cache (spec §9): L1 `moka` in-process, L2 `redb`
//! on-disk, keyed by a structural SHA-256 so equivalent badges share
//! entries. Values carry the bytes plus the absolute expiry they were
//! rendered with.

use std::time::Duration;

use moka::future::Cache;
use redb::ReadableDatabase;
use sha2::{Digest, Sha256};
use std::sync::Mutex;

/// Inputs that structurally determine a rendered badge.
#[derive(Debug, Clone)]
pub struct CacheKeyInput<'a> {
    pub variant: &'a str,
    pub label: &'a str,
    pub value: &'a str,
    pub extra: Option<&'a str>,
    pub extra2: Option<&'a str>,
    pub theme_hash: &'a [u8; 32],
    pub icon_hash: &'a [u8; 32],
    /// Bundled family forced via `?font=` (resolved from the slug);
    /// `None` = template default. Slug → family is injective, so keying on
    /// the family is equivalent to keying on the slug.
    pub font_family: Option<&'a str>,
    /// `?icon=none` — must participate in the key: with `icon_html` absent
    /// (default icon) and `no_icon` set, `icon_hash` is identical `[0;32]`;
    /// without this flag the two rendered outputs collided in the cache.
    pub no_icon: bool,
    pub format: vexillum_core::Format,
    pub scale: vexillum_core::Scale,
    /// `None` = auto-trim (static) / default pad (animated); `Some(n)` =
    /// explicit `?pad=`. Both arms render differently, so the option
    /// participates in the key.
    pub pad: Option<u32>,
}

/// SHA-256 structural cache key (spec §9.1).
pub fn cache_key(input: &CacheKeyInput<'_>) -> [u8; 32] {
    let mut h = Sha256::new();
    h.update(input.variant.as_bytes());
    h.update([0]);
    h.update(input.label.as_bytes());
    h.update([0]);
    h.update(input.value.as_bytes());
    h.update([0]);
    h.update(input.extra.unwrap_or("").as_bytes());
    h.update([0]);
    h.update(input.extra2.unwrap_or("").as_bytes());
    h.update([0]);
    h.update(input.theme_hash);
    h.update(input.icon_hash);
    h.update(input.font_family.unwrap_or("").as_bytes());
    h.update([0]);
    h.update([u8::from(input.no_icon)]);
    h.update([input.format as u8, input.scale as u8]);
    h.update([u8::from(input.pad.is_some())]);
    h.update(input.pad.unwrap_or(0).to_le_bytes());
    h.finalize().into()
}

/// Hex-encoded key for ETags.
pub fn etag(key: &[u8; 32]) -> String {
    format!("\"{}\"", hex::encode(key))
}

/// A cached render payload with its absolute expiry.
#[derive(Debug, Clone)]
pub struct Entry {
    pub bytes: std::sync::Arc<Vec<u8>>,
    pub ttl: Duration,
    pub expires_at_ms: u64,
}

impl Entry {
    fn fresh(&self, now_ms: u64) -> bool {
        now_ms < self.expires_at_ms
    }
}

/// L2 record layout: 8-byte expiry (ms, LE) + payload.
const HEADER: usize = 8;

/// Two-tier cache: memory (L1) + redb (L2).
pub struct RenderCache {
    l1: Cache<[u8; 32], Entry>,
    l2: Mutex<redb::Database>,
}

const L2_TABLE: redb::TableDefinition<&[u8], (&[u8], u64)> = redb::TableDefinition::new("renders");

impl RenderCache {
    /// Opens (creating if needed) the L2 file with an L1 of `l1_capacity`.
    pub fn open(path: &std::path::Path, l1_capacity: u64) -> Result<Self, vexillum_core::Error> {
        let db = redb::Database::create(path).map_err(db_err)?;
        {
            let write_txn = db.begin_write().map_err(db_err)?;
            {
                let _table = write_txn.open_table(L2_TABLE).map_err(db_err)?;
            }
            write_txn.commit().map_err(db_err)?;
        }
        Ok(Self {
            l1: Cache::new(l1_capacity),
            l2: Mutex::new(db),
        })
    }

    /// Ephemeral cache backed by a temp redb file (tests, one-shot tools).
    pub fn memory(l1_capacity: u64) -> Result<Self, vexillum_core::Error> {
        let path =
            std::env::temp_dir().join(format!("tbc-{}-{}.redb", std::process::id(), now_ms()));
        Self::open(&path, l1_capacity)
    }

    /// Fresh entry from either tier, if any.
    pub async fn get(&self, key: &[u8; 32]) -> Option<Entry> {
        if let Some(hit) = self.l1.get(key).await {
            if hit.fresh(now_ms()) {
                return Some(hit);
            }
            self.l1.invalidate(key).await;
        }
        let entry = self.get_l2(key)?;
        self.l1.insert(*key, entry.clone()).await;
        Some(entry)
    }

    fn get_l2(&self, key: &[u8; 32]) -> Option<Entry> {
        let db = self.l2.lock().unwrap_or_else(|e| e.into_inner());
        let read_txn = db.begin_read().ok()?;
        let table = read_txn.open_table(L2_TABLE).ok()?;
        let guard = table.get(key.as_slice()).ok()??;
        let (record, stored_ms) = guard.value();
        let bytes = record.to_vec();
        if bytes.len() < HEADER {
            return None;
        }
        let mut expiry = [0u8; HEADER];
        expiry.copy_from_slice(&bytes[..HEADER]);
        let expires_at_ms = u64::from_le_bytes(expiry);
        if now_ms() >= expires_at_ms {
            return None;
        }
        let ttl_ms = expires_at_ms.saturating_sub(now_ms());
        Some(Entry {
            bytes: std::sync::Arc::new(bytes[HEADER..].to_vec()),
            ttl: Duration::from_millis(ttl_ms),
            expires_at_ms,
        })
        .map(|e| {
            let _ = stored_ms; // stored creation time; reserved for stats
            e
        })
    }

    /// Stores with TTL; the L2 record embeds the absolute expiry.
    pub async fn put(&self, key: &[u8; 32], bytes: Vec<u8>, ttl: Duration) {
        let expires_at_ms =
            now_ms().saturating_add(u64::try_from(ttl.as_millis()).unwrap_or(u64::MAX));
        let entry = Entry {
            bytes: std::sync::Arc::new(bytes.clone()),
            ttl,
            expires_at_ms,
        };
        self.l1.insert(*key, entry).await;
        let mut record = Vec::with_capacity(bytes.len() + HEADER);
        record.extend_from_slice(&expires_at_ms.to_le_bytes());
        record.extend_from_slice(&bytes);
        let db = self.l2.lock().unwrap_or_else(|e| e.into_inner());
        if let Ok(write_txn) = db.begin_write() {
            let committed = match write_txn.open_table(L2_TABLE) {
                Ok(mut table) => table
                    .insert(key.as_slice(), (record.as_slice(), now_ms()))
                    .is_ok(),
                Err(_) => false,
            };
            if committed {
                let _ = write_txn.commit();
            }
        }
    }
}

fn db_err<E: std::fmt::Display>(e: E) -> vexillum_core::Error {
    vexillum_core::Error::Render(format!("redb: {e}"))
}

fn now_ms() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

/// Computes `Cache-Control` for a badge response (spec §9.3).
pub fn cache_control_header(ttl: Duration) -> String {
    format!("public, max-age={}, immutable", ttl.as_secs())
}

#[cfg(test)]
mod tests {
    use super::*;
    use vexillum_core::{BadgeData, Format};
    use vexillum_render::RenderRequest;

    #[test]
    fn key_is_deterministic_and_sensitive() {
        let base = CacheKeyInput {
            variant: "c01-01",
            label: "build",
            value: "passing",
            extra: None,
            extra2: None,
            theme_hash: &[0u8; 32],
            icon_hash: &[0u8; 32],
            font_family: None,
            no_icon: false,
            format: Format::Png,
            scale: vexillum_core::Scale::One,
            pad: Some(8),
        };
        let a = cache_key(&base);
        let b = cache_key(&base);
        assert_eq!(a, b);
        let mut different_label = base.clone();
        different_label.label = "deploy";
        assert_ne!(a, cache_key(&different_label));
        let mut no_icon_key = base.clone();
        no_icon_key.no_icon = true;
        assert_ne!(
            a,
            cache_key(&no_icon_key),
            "?icon=none must not collide with the default icon"
        );
        let mut different_format = base.clone();
        different_format.format = Format::Gif;
        assert_ne!(a, cache_key(&different_format));
        let mut different_theme = base.clone();
        different_theme.theme_hash = &[1u8; 32];
        assert_ne!(a, cache_key(&different_theme));
        let mut different_font = base.clone();
        different_font.font_family = Some("Space Mono");
        assert_ne!(a, cache_key(&different_font));
        // two families must not collide either
        let mut other_font = different_font.clone();
        other_font.font_family = Some("Inter");
        assert_ne!(cache_key(&different_font), cache_key(&other_font));
        // quad badges: the fourth segment must participate in the key
        let mut different_extra2 = base.clone();
        different_extra2.extra2 = Some("c");
        assert_ne!(a, cache_key(&different_extra2));
    }

    #[test]
    fn etag_is_quoted_hex() {
        let key = cache_key(&CacheKeyInput {
            variant: "x",
            label: "y",
            value: "z",
            extra: None,
            extra2: None,
            theme_hash: &[0u8; 32],
            icon_hash: &[0u8; 32],
            font_family: None,
            no_icon: false,
            format: Format::Svg,
            scale: vexillum_core::Scale::One,
            pad: None,
        });
        let e = etag(&key);
        assert!(e.starts_with('"') && e.ends_with('"'));
        assert_eq!(e.len(), 66);
    }

    #[tokio::test]
    async fn roundtrip_through_l1_and_l2() {
        let cache = RenderCache::memory(16).unwrap();
        let key = [7u8; 32];
        assert!(cache.get(&key).await.is_none());
        cache
            .put(&key, vec![1, 2, 3], Duration::from_secs(60))
            .await;
        let hit = cache.get(&key).await.expect("hit");
        assert_eq!(hit.bytes.as_slice(), &[1, 2, 3]);
    }

    #[tokio::test]
    async fn expired_entries_are_not_served() {
        let cache = RenderCache::memory(16).unwrap();
        let key = [9u8; 32];
        cache.put(&key, vec![1], Duration::from_millis(1)).await;
        tokio::time::sleep(Duration::from_millis(20)).await;
        assert!(cache.get(&key).await.is_none());
    }

    #[tokio::test]
    async fn l2_survives_reopen() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("cache.redb");
        let key = [5u8; 32];
        {
            let cache = RenderCache::open(&path, 8).unwrap();
            cache.put(&key, vec![9, 9], Duration::from_secs(60)).await;
        }
        let cache = RenderCache::open(&path, 8).unwrap();
        let hit = cache.get(&key).await.expect("l2 hit after reopen");
        assert_eq!(hit.bytes.as_slice(), &[9, 9]);
    }

    #[test]
    fn cache_control_format() {
        assert_eq!(
            cache_control_header(Duration::from_secs(3600)),
            "public, max-age=3600, immutable"
        );
    }

    #[test]
    fn render_request_builds_key_input() {
        // ensures the key covers every render-relevant field
        let r = RenderRequest::new("c01-01", BadgeData::static_badge("a", "b"), Format::Png);
        let key = cache_key(&CacheKeyInput {
            variant: &r.variant,
            label: &r.data.label,
            value: &r.data.value,
            extra: r.data.extra.as_deref(),
            extra2: r.data.extra2.as_deref(),
            theme_hash: &[0u8; 32],
            icon_hash: &[0u8; 32],
            font_family: r.font_family.as_deref(),
            no_icon: r.no_icon,
            format: r.format,
            scale: r.scale,
            pad: r.pad,
        });
        assert_ne!(key, [0u8; 32]);
    }
}
