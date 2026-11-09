//! Google Fonts runtime loading for the native API.
//!
//! `?font=<slug>` resolves in three steps: the four bundled families render
//! from the embedded registry (no I/O), cataloged Google Fonts families are
//! fetched once from the Google Fonts CSS2 endpoint (which serves TTF files
//! to non-browser user agents — exactly what the takumi registry wants) and
//! cached process-wide, and anything else is a 400 `invalid-font` problem.
//!
//! This module is the only place fonts touch the network; the wasm worker
//! renders with the bundled registry only.

use std::collections::HashMap;
use std::sync::{Arc, LazyLock};
use std::time::Duration;

use tokio::sync::Mutex as AsyncMutex;

use vexillum_core::{Error, Result};

use crate::params::FontSelection;

/// Process-wide downloaded-font cache (family → face bytes).
static CACHE: LazyLock<AsyncMutex<Option<FontCache>>> = LazyLock::new(|| AsyncMutex::new(None));

struct FontCache {
    map: HashMap<String, Arc<dyn AsRef<[u8]> + Send + Sync>>,
    /// insertion order for FIFO eviction
    order: Vec<String>,
}

const MAX_CACHED_FONTS: usize = 64;
const CSS_TIMEOUT: Duration = Duration::from_secs(15);
const FONT_TIMEOUT: Duration = Duration::from_secs(30);

fn cache() -> &'static AsyncMutex<Option<FontCache>> {
    &CACHE
}

async fn cache_get(family: &str) -> Option<Arc<dyn AsRef<[u8]> + Send + Sync>> {
    let guard = cache().lock().await;
    guard.as_ref()?.map.get(family).cloned()
}

async fn cache_put(family: &str, bytes: Arc<dyn AsRef<[u8]> + Send + Sync>) {
    let mut guard = cache().lock().await;
    if guard.is_none() {
        *guard = Some(FontCache {
            map: HashMap::new(),
            order: Vec::new(),
        });
    }
    let cache = guard.as_mut().unwrap();
    if !cache.map.contains_key(family) {
        cache.order.push(family.to_string());
        while cache.order.len() > MAX_CACHED_FONTS {
            let evict = cache.order.remove(0);
            cache.map.remove(&evict);
        }
    }
    cache.map.insert(family.to_string(), bytes);
}

/// Resolves a font selection into face bytes, consulting the cache first.
/// Bundled families need no network; Google families are fetched once.
pub async fn load_font_bytes(selection: &FontSelection) -> Result<Option<FontFace>> {
    match selection {
        FontSelection::None => Ok(None),
        FontSelection::Bundled(_) => Ok(None),
        FontSelection::Google(family) => {
            if let Some(bytes) = cache_get(family).await {
                return Ok(Some(FontFace {
                    family: family.clone(),
                    bytes,
                }));
            }
            let bytes = fetch_google_font(family).await?;
            let face = FontFace {
                family: family.clone(),
                bytes: Arc::new(bytes),
            };
            cache_put(family, face.bytes.clone()).await;
            Ok(Some(face))
        }
    }
}

/// A resolved font face: family name + face bytes for the renderer.
pub struct FontFace {
    pub family: String,
    pub bytes: Arc<dyn AsRef<[u8]> + Send + Sync>,
}

fn client() -> Result<reqwest::Client> {
    reqwest::Client::builder()
        .timeout(FONT_TIMEOUT)
        .connect_timeout(CSS_TIMEOUT)
        // no browser UA: the CSS2 endpoint serves TTF to unknown agents,
        // which is the format the takumi registry needs
        .user_agent("vexillum-renderer/1.0")
        .build()
        .map_err(|e| Error::FontUnavailable(format!("http client: {e}")))
}

async fn fetch_google_font(family: &str) -> Result<Vec<u8>> {
    let http = client()?;
    let css_url = format!(
        "https://fonts.googleapis.com/css2?family={}&display=swap",
        urlencode_family(family)
    );
    let css = http
        .get(&css_url)
        .send()
        .await
        .and_then(|r| r.error_for_status())
        .map_err(|e| Error::FontUnavailable(format!("'{family}' css lookup failed: {e}")))?
        .text()
        .await
        .map_err(|e| Error::FontUnavailable(format!("'{family}' css read failed: {e}")))?;

    let urls = vexillum_render::google_fonts::parse_ttf_urls(&css);
    let url = urls.first().ok_or_else(|| {
        Error::FontUnavailable(format!("'{family}' css listed no truetype source"))
    })?;

    let bytes = http
        .get(url)
        .send()
        .await
        .and_then(|r| r.error_for_status())
        .map_err(|e| Error::FontUnavailable(format!("'{family}' download failed: {e}")))?
        .bytes()
        .await
        .map_err(|e| Error::FontUnavailable(format!("'{family}' read failed: {e}")))?
        .to_vec();

    if bytes.len() < 1_000 {
        return Err(Error::FontUnavailable(format!(
            "'{family}' face too small ({})",
            bytes.len()
        )));
    }
    Ok(bytes)
}

/// Encodes a family name for the css2 `family=` query parameter
/// (`Playfair Display` → `Playfair+Display`).
fn urlencode_family(family: &str) -> String {
    family
        .chars()
        .flat_map(|c| match c {
            ' ' => vec!['+'],
            c if c.is_ascii_alphanumeric() || "-._~".contains(c) => vec![c],
            c => format!("%{:02X}", c as u32).chars().collect(),
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn encodes_family_names() {
        assert_eq!(urlencode_family("Roboto"), "Roboto");
        assert_eq!(urlencode_family("Playfair Display"), "Playfair+Display");
        assert_eq!(urlencode_family("Noto Sans SC"), "Noto+Sans+SC");
    }

    #[test]
    fn bundled_selection_needs_no_bytes() {
        // bundled faces ship in the binary — no FontFace to fetch
        let rt = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .unwrap();
        rt.block_on(async {
            let face = load_font_bytes(&FontSelection::Bundled("Space Mono".into()))
                .await
                .unwrap();
            assert!(face.is_none());
        });
    }
}
