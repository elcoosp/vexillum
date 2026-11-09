//! `vexillum-worker` — Cloudflare Workers edge (spec §12.2): static badges only,
//! same templates + same render crate compiled to wasm32.

use worker::*;

#[event(fetch)]
async fn fetch(req: Request, _env: Env, _ctx: Context) -> Result<Response> {
    let url = req.url()?;
    let path = url.path().to_string();

    // The edge renders static badges as SVG only: any explicitly requested
    // non-SVG format (png/webp/gif/apng/jpeg) must be served by the origin,
    // which honors the full format matrix including tier gating. Previously
    // only gif/apng redirected, so e.g. ?format=webp silently returned SVG.
    let requested_format = url
        .query()
        .unwrap_or_default()
        .split('&')
        .find_map(|kv| kv.strip_prefix("format="))
        .unwrap_or("svg");
    if path.starts_with("/badge/github")
        || path.starts_with("/badge/npm")
        || path.starts_with("/badge/crates")
        || path.starts_with("/badge/docker")
        || path.starts_with("/badge/dynamic")
        || path.starts_with("/badge/endpoint")
        || (requested_format != "svg" && path.starts_with("/badge/"))
    {
        let origin = _env.var("ORIGIN_URL")?.to_string();
        let target = format!(
            "{origin}{path}{}",
            url.query().map(|q| format!("?{q}")).unwrap_or_default()
        );
        return Response::redirect(Url::parse(&target)?);
    }

    match handle_badge(&path) {
        Ok((bytes, content_type)) => {
            let mut res = Response::from_bytes(bytes)?;
            res.headers_mut()
                .set("Cache-Control", "public, max-age=86400, immutable")?;
            res.headers_mut().set("Content-Type", content_type)?;
            Ok(res)
        }
        Err(e) => {
            // worker-rs: status is set when constructing the response
            let mut res = Response::from_json(&serde_json::json!({
                "type": "https://vexillum.dev/errors/unknown-variant",
                "title": "Bad request",
                "status": 400,
                "detail": e,
            }))?
            .with_status(400);
            res.headers_mut()
                .set("Content-Type", "application/problem+json")?;
            Ok(res)
        }
    }
}

/// Parses `/badge/:collection/:variant/:label/:value` and renders SVG/PNG.
fn handle_badge(path: &str) -> Result<(Vec<u8>, &'static str), String> {
    let segments: Vec<&str> = path.split('/').filter(|s| !s.is_empty()).collect();
    let [_badge, collection, variant, label, value] = segments.as_slice() else {
        return Err("badge path must be /badge/:collection/:variant/:label/:value".into());
    };

    let manifest = vexillum_templates::manifest();
    let meta = manifest
        .variant(variant)
        .ok_or_else(|| format!("unknown variant '{variant}'"))?;
    if manifest.collection(collection).is_none() {
        return Err(format!("unknown collection '{collection}'"));
    }

    let data = vexillum_core::BadgeData::static_badge(*label, *value);
    let request =
        vexillum_render::RenderRequest::new(meta.id.clone(), data, vexillum_core::Format::Svg);
    let bytes = vexillum_render::render_static_bytes(&request).map_err(|e| e.to_string())?;
    Ok((bytes, "image/svg+xml"))
}
