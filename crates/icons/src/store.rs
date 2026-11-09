//! Uploaded icon store: SHA-256-keyed, sanitized-before-write, size-capped.
//! Backed by a filesystem directory (R2 in production — same interface).

use std::path::{Path, PathBuf};

use sha2::{Digest, Sha256};

use crate::sanitize::{MAX_SVG_BYTES, sanitize_svg};
use vexillum_core::Error;

/// A stored upload's coordinates.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct StoredIcon {
    pub hash: String,
    pub bytes: usize,
}

/// Filesystem-backed store (S3-compatible in production).
pub struct IconStore {
    root: PathBuf,
}

impl IconStore {
    /// Creates (or opens) the store rooted at `root`.
    pub fn open(root: &Path) -> Result<Self, Error> {
        std::fs::create_dir_all(root).map_err(|e| store_err(&e))?;
        Ok(Self {
            root: root.to_path_buf(),
        })
    }

    /// Sanitizes and stores an SVG upload; returns its coordinates.
    pub fn put(&self, svg: &str) -> Result<StoredIcon, Error> {
        if svg.len() > MAX_SVG_BYTES {
            return Err(Error::InvalidIcon("upload exceeds 32 KiB".into()));
        }
        let clean = sanitize_svg(svg).map_err(|e| Error::InvalidIcon(e.reason))?;
        let hash = hex::encode(Sha256::digest(clean.as_bytes()));
        let path = self.path_for(&hash);
        std::fs::write(&path, &clean).map_err(|e| store_err(&e))?;
        Ok(StoredIcon {
            hash,
            bytes: clean.len(),
        })
    }

    /// Fetches a stored icon by hash.
    pub fn get(&self, hash: &str) -> Result<Option<String>, Error> {
        if !is_sha256(hash) {
            return Err(Error::BadRequest("icon hash must be sha256 hex".into()));
        }
        match std::fs::read_to_string(self.path_for(hash)) {
            Ok(svg) => Ok(Some(svg)),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(None),
            Err(e) => Err(store_err(&e)),
        }
    }

    /// Deletes a stored icon (org cleanup).
    pub fn delete(&self, hash: &str) -> Result<bool, Error> {
        if !is_sha256(hash) {
            return Err(Error::BadRequest("icon hash must be sha256 hex".into()));
        }
        match std::fs::remove_file(self.path_for(hash)) {
            Ok(()) => Ok(true),
            Err(e) if e.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(e) => Err(store_err(&e)),
        }
    }

    fn path_for(&self, hash: &str) -> PathBuf {
        self.root.join(format!("{hash}.svg"))
    }
}

fn is_sha256(s: &str) -> bool {
    s.len() == 64
        && s.bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
}

fn store_err(e: &std::io::Error) -> Error {
    Error::Render(format!("icon store: {e}"))
}

#[cfg(test)]
mod tests {
    use super::*;

    const CLEAN: &str = r#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l3 7h7z"/></svg>"#;

    #[test]
    fn put_get_roundtrip_is_content_addressed() {
        let dir = tempfile::tempdir().unwrap();
        let store = IconStore::open(dir.path()).unwrap();
        let stored = store.put(CLEAN).unwrap();
        assert_eq!(stored.hash.len(), 64);
        let fetched = store.get(&stored.hash).unwrap().unwrap();
        // sanitized output is deterministic → same hash on re-upload
        let again = store.put(CLEAN).unwrap();
        assert_eq!(stored.hash, again.hash);
        assert_eq!(fetched, CLEAN);
    }

    #[test]
    fn rejects_malicious_uploads() {
        let dir = tempfile::tempdir().unwrap();
        let store = IconStore::open(dir.path()).unwrap();
        let evil = r#"<svg viewBox="0 0 10 10"><script>alert(1)</script><path d="M0 0"/></svg>"#;
        let stored = store.put(evil).unwrap(); // sanitizes instead of failing
        let fetched = store.get(&stored.hash).unwrap().unwrap();
        assert!(!fetched.contains("script"));
    }

    #[test]
    fn rejects_oversized_uploads() {
        let dir = tempfile::tempdir().unwrap();
        let store = IconStore::open(dir.path()).unwrap();
        let big = format!("<svg>{}</svg>", "M0 0 ".repeat(MAX_SVG_BYTES / 4));
        let e = store.put(&big).unwrap_err();
        assert_eq!(e.status(), 400);
    }

    #[test]
    fn delete_removes_and_reports_missing() {
        let dir = tempfile::tempdir().unwrap();
        let store = IconStore::open(dir.path()).unwrap();
        let stored = store.put(CLEAN).unwrap();
        assert!(store.delete(&stored.hash).unwrap());
        assert!(!store.delete(&stored.hash).unwrap());
    }

    #[test]
    fn rejects_bad_hashes() {
        let dir = tempfile::tempdir().unwrap();
        let store = IconStore::open(dir.path()).unwrap();
        assert!(store.get("not-a-hash").is_err());
        assert!(store.delete(&"A".repeat(64)).is_err());
    }

    #[test]
    fn missing_hash_returns_none_not_error() {
        let dir = tempfile::tempdir().unwrap();
        let store = IconStore::open(dir.path()).unwrap();
        let missing = "0".repeat(64);
        assert!(store.get(&missing).unwrap().is_none());
    }
}
