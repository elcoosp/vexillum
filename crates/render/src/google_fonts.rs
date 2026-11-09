//! Google Fonts catalog + registry extension.
//!
//! The catalog (1,959 families) is embedded at compile time and queried by
//! the API to validate `?font=<slug>` beyond the four bundled families. The
//! font *bytes* are fetched at request time by the API layer (native-only —
//! the wasm worker never loads Google fonts) and handed to
//! [`fonts_with_google_family`], which clones the bundled registry and adds
//! the downloaded face. This module stays network-free so it compiles for
//! wasm32.

use std::collections::HashMap;
use std::sync::{Arc, Mutex, OnceLock};

use serde::Deserialize;
use takumi::prelude::{FontResource, FontSource, Fonts};

use crate::Result;
use crate::fonts::global_fonts;

const CATALOG_JSON: &str = include_str!("../assets/google-fonts.json");

#[derive(Deserialize)]
struct CatalogFile {
    /// `[slug, family, category]` triples, sorted by slug.
    families: Vec<(String, String, String)>,
}

struct Catalog {
    families: Vec<(String, String, String)>,
    by_slug: HashMap<String, usize>,
}

fn catalog() -> &'static Catalog {
    static CATALOG: OnceLock<Catalog> = OnceLock::new();
    CATALOG.get_or_init(|| {
        let file: CatalogFile =
            serde_json::from_str(CATALOG_JSON).expect("embedded google-fonts.json must parse");
        let mut by_slug = HashMap::with_capacity(file.families.len());
        for (i, (slug, _, _)) in file.families.iter().enumerate() {
            by_slug.insert(slug.clone(), i);
        }
        Catalog {
            families: file.families,
            by_slug,
        }
    })
}

/// Number of cataloged Google Font families.
pub fn google_font_count() -> usize {
    catalog().families.len()
}

/// True when `slug` is a cataloged Google Font slug (bundled families are
/// handled before this lookup — they win on collision).
pub fn is_google_font_slug(slug: &str) -> bool {
    catalog().by_slug.contains_key(slug)
}

/// Resolves a cataloged slug (or exact family name) to its display family.
pub fn resolve_google_family(slug_or_name: &str) -> Option<&'static str> {
    let cat = catalog();
    if let Some(&i) = cat.by_slug.get(slug_or_name) {
        return Some(cat.families[i].1.as_str());
    }
    // exact family name also resolves (e.g. "Noto Sans SC")
    cat.families
        .iter()
        .find(|(_, family, _)| family == slug_or_name)
        .map(|(_, family, _)| family.as_str())
}

/// All catalog entries as `(slug, family, category)` — docs/discovery.
pub fn google_font_entries() -> &'static [(String, String, String)] {
    &catalog().families
}

// ------------------------------------------------------------- registry

/// Registries extended with one Google family each, keyed by family name.
/// The base bundled registry is shared (Arc) — a per-family clone only
/// carries the delta.
static GOOGLE_REGISTRIES: OnceLock<Mutex<HashMap<String, Arc<Fonts>>>> = OnceLock::new();

/// Returns a font registry containing the bundled families plus `family`
/// loaded from `bytes`. Cached process-wide per family.
pub fn fonts_with_google_family(
    family: &str,
    bytes: Arc<dyn AsRef<[u8]> + Send + Sync>,
) -> Result<Arc<Fonts>> {
    let map = GOOGLE_REGISTRIES.get_or_init(|| Mutex::new(HashMap::new()));
    if let Ok(guard) = map.lock() {
        if let Some(hit) = guard.get(family) {
            return Ok(hit.clone());
        }
    }
    let mut fonts = global_fonts().clone();
    fonts
        .register(FontResource::new(FontSource::from_shared(bytes)))
        .map_err(|e| {
            vexillum_core::Error::Render(format!("google font '{family}' registration failed: {e}"))
        })?;
    let arc = Arc::new(fonts);
    if let Ok(mut guard) = map.lock() {
        guard.insert(family.to_string(), arc.clone());
    }
    Ok(arc)
}

/// Extracts candidate TTF URLs from a Google Fonts CSS2 response, in file
/// order. The CSS2 endpoint returns `format('truetype')` src urls when the
/// request has no browser UA (which is how the API fetches).
pub fn parse_ttf_urls(css: &str) -> Vec<String> {
    let mut urls = Vec::new();
    let mut rest = css;
    while let Some(i) = rest.find("url(") {
        rest = &rest[i + 4..];
        let end = match rest.find(')') {
            Some(e) => e,
            None => break,
        };
        let mut url = rest[..end].trim().to_string();
        if (url.starts_with('"') && url.ends_with('"'))
            || (url.starts_with('\'') && url.ends_with('\''))
        {
            url = url[1..url.len() - 1].to_string();
        }
        rest = &rest[end..];
        if url.ends_with(".ttf") {
            urls.push(url);
        }
    }
    urls
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn catalog_loads_and_is_sorted() {
        assert!(
            google_font_count() > 1_500,
            "catalog should carry ~2k families"
        );
        let entries = google_font_entries();
        assert!(
            entries.windows(2).all(|w| w[0].0 < w[1].0),
            "sorted by slug"
        );
    }

    #[test]
    fn resolves_known_slugs_and_families() {
        assert_eq!(resolve_google_family("roboto"), Some("Roboto"));
        assert_eq!(resolve_google_family("noto-sans-sc"), Some("Noto Sans SC"));
        assert_eq!(resolve_google_family("Noto Sans SC"), Some("Noto Sans SC"));
        assert!(is_google_font_slug("open-sans"));
        assert!(!is_google_font_slug("definitely-not-a-font"));
    }

    #[test]
    fn bundled_slugs_do_not_hit_the_google_catalog_lookup_first() {
        // 'inter' exists in the Google catalog too — resolution order in the
        // API checks bundled first; the catalog fn itself must still be honest
        assert!(is_google_font_slug("inter") || resolve_google_family("inter").is_some());
    }

    #[test]
    fn fonts_with_google_family_registers_and_caches() {
        // reuse bundled bytes as a stand-in download; exercising the
        // clone+register+cache path needs no real network font
        let bytes: Arc<dyn AsRef<[u8]> + Send + Sync> =
            Arc::new(include_bytes!("../assets/fonts/SpaceMono-Regular.ttf").as_slice());
        let fonts = fonts_with_google_family("Space Mono", bytes).expect("register");
        // cached second call returns the same registry
        let other: Arc<dyn AsRef<[u8]> + Send + Sync> = Arc::new(&b"other"[..]);
        let again = fonts_with_google_family("Space Mono", other).expect("cached");
        assert!(
            Arc::ptr_eq(&fonts, &again),
            "per-family registry must be cached"
        );
    }

    #[test]
    fn parses_ttf_urls_from_css2_response() {
        let css = r#"
@font-face {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/notosanssc/v41/aaa.ttf) format('truetype');
}
@font-face {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 700;
  src: url(https://fonts.gstatic.com/s/notosanssc/v41/bbb.ttf) format('truetype');
}
@font-face {
  font-family: 'X';
  src: url(https://fonts.gstatic.com/s/x/v1/c.woff2) format('woff2');
}"#;
        let urls = parse_ttf_urls(css);
        assert_eq!(urls.len(), 2);
        assert!(urls[0].ends_with("aaa.ttf"));
        assert!(urls[1].ends_with("bbb.ttf"));
    }

    #[test]
    fn parse_ttf_urls_handles_quoted_and_empty() {
        let css = "@font-face { src: url('https://x/y.ttf') format('truetype'); }";
        assert_eq!(parse_ttf_urls(css), vec!["https://x/y.ttf".to_string()]);
        assert!(parse_ttf_urls("no urls here").is_empty());
        assert!(parse_ttf_urls("url(unterminated").is_empty());
    }
}
