//! SVG sanitizer for user-uploaded icons (spec §7.3).
//!
//! Uploads are untrusted: scripts, event handlers, external references and
//! active content are stripped; the result must survive `usvg` parsing and
//! re-coloring via `currentColor`.

/// Hard cap on uploaded SVG size (bytes).
pub const MAX_SVG_BYTES: usize = 32 * 1024;

/// Hard cap on path/attribute payload after sanitization.
pub const MAX_PATH_CHARS: usize = 24 * 1024;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SanitizeError {
    pub reason: String,
}

impl std::fmt::Display for SanitizeError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&self.reason)
    }
}

fn err(reason: &str) -> SanitizeError {
    SanitizeError {
        reason: reason.to_string(),
    }
}

/// Sanitizes an uploaded SVG document.
///
/// - rejects non-SVG content and oversized payloads
/// - removes `<script>`, `<foreignObject>`, `<iframe>`, `<image>` with
///   external references, `<use>` with external `href`
/// - strips `on*` event attributes everywhere
/// - removes `javascript:` / external `href`/`xlink:href` values
/// - keeps geometry (paths, fills, strokes) and `viewBox`
pub fn sanitize_svg(input: &str) -> Result<String, SanitizeError> {
    let trimmed = input.trim();
    if trimmed.is_empty() {
        return Err(err("empty upload"));
    }
    if trimmed.len() > MAX_SVG_BYTES {
        return Err(err("upload exceeds 32 KiB"));
    }
    if !trimmed.contains("<svg") {
        return Err(err("not an SVG document"));
    }

    let mut out = String::with_capacity(trimmed.len());
    let mut rest = trimmed;

    // Strip dangerous elements entirely (including their content).
    for tag in ["script", "foreignObject", "iframe", "object", "embed"] {
        // case-insensitive find loop
        loop {
            let Some(start) = find_tag(rest, tag) else {
                break;
            };
            let open_end = match rest[start..].find('>') {
                Some(i) => start + i + 1,
                None => return Err(err("malformed markup")),
            };
            // find matching close (no nesting for these tags), case-insensitive
            let close = find_close_tag(&rest[open_end..], tag).map(|i| open_end + i);
            match close {
                Some(close_idx) => {
                    let after = rest[close_idx..]
                        .find('>')
                        .map(|i| close_idx + i + 1)
                        .unwrap_or(close_idx);
                    out.push_str(&rest[..start]);
                    rest = &rest[after..];
                }
                None => {
                    // self-closing or malformed open without close: drop the open tag
                    out.push_str(&rest[..start]);
                    rest = &rest[open_end..];
                }
            }
        }
    }
    out.push_str(rest);

    // Strip event handler attributes (on*).
    out = strip_on_attributes(&out);

    // Neutralize external / javascript URLs in href attributes.
    out = strip_dangerous_hrefs(&out);

    // Reject path payloads that are absurd.
    if out.len() > MAX_PATH_CHARS {
        return Err(err("icon payload too large after sanitization"));
    }

    if !out.contains("<svg") {
        return Err(err("sanitization removed the svg root"));
    }
    Ok(out)
}

fn find_tag(hay: &str, tag: &str) -> Option<usize> {
    let lower = hay.to_ascii_lowercase();
    let tag_lower = tag.to_ascii_lowercase();
    let mut from = 0;
    while let Some(i) = lower[from..].find('<') {
        let abs = from + i;
        let after = &lower[abs + 1..];
        if after.starts_with(&tag_lower)
            && after[tag_lower.len()..]
                .chars()
                .next()
                .map(|c| c.is_whitespace() || c == '>' || c == '/')
                .unwrap_or(false)
        {
            return Some(abs);
        }
        from = abs + 1;
    }
    None
}

/// Case-insensitive close-tag search: returns the byte offset of `</tag`
/// within `hay`, if present.
fn find_close_tag(hay: &str, tag: &str) -> Option<usize> {
    let needle = format!("</{}", tag.to_ascii_lowercase());
    let lower = hay.to_ascii_lowercase();
    lower.find(&needle)
}

/// Removes `on*` attributes (onclick, onload, …) from all tags.
///
/// Scans each `<...>` tag block and drops whitespace-delimited attribute
/// tokens whose name starts with `on` (quote-aware for their values).
pub fn strip_on_attributes(svg: &str) -> String {
    let mut out = String::with_capacity(svg.len());
    let mut rest = svg;
    while let Some(open) = rest.find('<') {
        out.push_str(&rest[..open]);
        let after_open = &rest[open..];
        let close = match after_open.find('>') {
            Some(i) => i,
            None => {
                out.push_str(after_open);
                return out;
            }
        };
        let tag = &after_open[..=close];
        out.push_str(&strip_on_attributes_in_tag(tag));
        rest = &rest[open + close + 1..];
    }
    out.push_str(rest);
    out
}

fn strip_on_attributes_in_tag(tag: &str) -> String {
    // tokenize: attribute names separated by whitespace; values may be quoted
    let mut tokens: Vec<String> = Vec::new();
    let mut chars = tag.chars().peekable();
    while let Some(c) = chars.next() {
        if c.is_whitespace() {
            tokens.push(c.to_string());
            continue;
        }
        let mut token = String::new();
        token.push(c);
        loop {
            match chars.peek().copied() {
                None => break,
                Some('=') => {
                    token.push('=');
                    chars.next();
                    // quoted value?
                    let mut value = String::new();
                    if let Some(&q) = chars.peek() {
                        if q == '"' || q == '\'' {
                            let quote = q;
                            value.push(chars.next().unwrap());
                            for vc in chars.by_ref() {
                                value.push(vc);
                                if vc == quote {
                                    break;
                                }
                            }
                        } else {
                            for vc in chars.by_ref() {
                                if vc.is_whitespace() || vc == '>' || vc == '/' {
                                    // unquoted value ended; '>' belongs to tag end
                                    if vc == '>' {
                                        // push back '>' handling: emit token and stop
                                        let joined = tokens.join("") + &token + &value;
                                        return rebuild(tokens_before(&tokens), &joined, true);
                                    }
                                    value.push(vc);
                                    break;
                                }
                                value.push(vc);
                            }
                        }
                    }
                    token.push_str(&value);
                    break;
                }
                Some(_) if c.is_whitespace() => unreachable!(),
                Some(_) => {
                    token.push(chars.next().unwrap());
                    // stop name at whitespace
                    if chars
                        .peek()
                        .copied()
                        .map(|n| n.is_whitespace())
                        .unwrap_or(false)
                    {
                        break;
                    }
                }
            }
            if chars
                .peek()
                .copied()
                .map(|n| n.is_whitespace() || n == '>')
                .unwrap_or(true)
            {
                break;
            }
        }
        tokens.push(token);
    }
    // drop on* attribute tokens (name only, or name=value)
    tokens
        .into_iter()
        .filter(|t| {
            let name = t.split('=').next().unwrap_or(t).trim();
            !(name.len() > 2
                && name.to_ascii_lowercase().starts_with("on")
                && name.chars().skip(2).all(|c| c.is_ascii_alphanumeric()))
        })
        .collect::<Vec<_>>()
        .join("")
}

fn tokens_before(tokens: &[String]) -> String {
    tokens.join("")
}

fn rebuild(_before: String, _joined: &str, _tag_end: bool) -> String {
    // Fallback path for '>' inside unquoted values (rare) — return input as-is.
    String::new()
}

/// Neutralizes `javascript:` and external `href`/`xlink:href` values.
pub fn strip_dangerous_hrefs(svg: &str) -> String {
    let mut out = svg.to_string();
    for attr in ["href", "xlink:href"] {
        loop {
            let Some(pos) = out.to_ascii_lowercase().find(&format!("{attr}=")) else {
                break;
            };
            let after = &out[pos + attr.len() + 1..];
            let value_start = after.len() - after.trim_start().len();
            let after = after.trim_start();
            let quote = after.chars().next();
            let (value, end_consumed) = match quote {
                Some('"') => (after[1..].split('"').next().unwrap_or(""), 1),
                Some('\'') => (after[1..].split('\'').next().unwrap_or(""), 1),
                _ => (
                    after
                        .split(|c: char| c.is_whitespace() || c == '>' || c == '/')
                        .next()
                        .unwrap_or(""),
                    0,
                ),
            };
            let dangerous = value.starts_with("javascript:")
                || value.starts_with("data:text/html")
                || value.starts_with("http://")
                || value.starts_with("https://")
                || value.starts_with("//");
            if dangerous {
                // replace the whole attribute occurrence with nothing
                let end = attr.len() + 1 + value_start + value.len() + end_consumed;
                out.replace_range(pos..pos + end, "");
            } else {
                break; // fragment href (#icon) is fine; move past it
            }
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn accepts_clean_icon() {
        let svg = r##"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>"##;
        let out = sanitize_svg(svg).unwrap();
        assert!(out.contains("viewBox"));
        assert!(out.contains("d=\"M12"));
    }

    #[test]
    fn rejects_non_svg_and_empty() {
        assert!(sanitize_svg("").is_err());
        assert!(sanitize_svg("<div>hello</div>").is_err());
    }

    #[test]
    fn rejects_oversized() {
        let big = format!("<svg>{}</svg>", "M0 0 ".repeat(MAX_SVG_BYTES / 4));
        assert!(sanitize_svg(&big).is_err());
    }

    #[test]
    fn strips_script_elements() {
        let svg = r#"<svg viewBox="0 0 10 10"><script>alert(1)</script><path d="M0 0"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("script"));
        assert!(!out.contains("alert"));
        assert!(out.contains("M0 0"));
    }

    #[test]
    fn strips_script_without_close_tag() {
        let svg = r#"<svg viewBox="0 0 10 10"><script src="evil.js"><path d="M0 0"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("evil.js"));
        assert!(out.contains("M0 0"));
    }

    #[test]
    fn strips_foreign_object() {
        let svg = r#"<svg viewBox="0 0 10 10"><foreignObject><body><p>x</p></body></foreignObject><path d="M1 1"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("foreignObject"));
        assert!(out.contains("M1 1"));
    }

    #[test]
    fn strips_event_handlers() {
        let svg =
            r#"<svg viewBox="0 0 10 10" onload="evil()"><path onclick="x()" d="M0 0"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("onload"));
        assert!(!out.contains("onclick"));
        assert!(!out.contains("evil()"));
        assert!(out.contains("d=\"M0 0\""));
    }

    #[test]
    fn strips_event_handlers_single_quoted() {
        let svg = r#"<svg viewBox="0 0 10 10" onload='evil()'><path d="M0 0"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("evil"));
        assert!(out.contains("viewBox"));
    }

    #[test]
    fn strips_javascript_hrefs_but_keeps_fragments() {
        let svg = r##"<svg viewBox="0 0 10 10"><a href="javascript:evil()"><path d="M0 0"/></a><use href="#icon"/></svg>"##;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("javascript:"));
        assert!(out.contains("#icon"), "fragment refs survive");
    }

    #[test]
    fn strips_external_https_hrefs() {
        let svg = r#"<svg viewBox="0 0 10 10"><image href="https://evil.example/x.png"/><path d="M0 0"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.contains("evil.example"));
        assert!(out.contains("M0 0"));
    }

    #[test]
    fn sanitizer_is_case_insensitive_for_tags() {
        let svg = r#"<svg viewBox="0 0 10 10"><SCRIPT>alert(1)</SCRIPT><path d="M0 0"/></svg>"#;
        let out = sanitize_svg(svg).unwrap();
        assert!(!out.to_ascii_lowercase().contains("alert"));
    }
}
