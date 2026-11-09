//! WCAG 2.1 contrast measurement and the auto-correction guardrail.
//!
//! The guardrail is the product's "no atrocious colors" promise: any
//! foreground/background pair that fails AA (4.5:1) is nudged in OKLCH space
//! — never re-hued — until it passes, so user output stays tasteful by
//! construction.

use crate::color::Oklch;

/// WCAG 2.1 relative luminance of an sRGB 8-bit color.
pub fn relative_luminance(rgb: (u8, u8, u8)) -> f64 {
    let lin = |v: u8| {
        let v = v as f64 / 255.0;
        if v <= 0.04045 {
            v / 12.92
        } else {
            ((v + 0.055) / 1.055).powf(2.4)
        }
    };
    0.2126 * lin(rgb.0) + 0.7152 * lin(rgb.1) + 0.0722 * lin(rgb.2)
}

/// WCAG contrast ratio between two sRGB 8-bit colors, in 1..=21.
pub fn contrast_ratio(a: (u8, u8, u8), b: (u8, u8, u8)) -> f64 {
    let la = relative_luminance(a);
    let lb = relative_luminance(b);
    let (hi, lo) = if la > lb { (la, lb) } else { (lb, la) };
    (hi + 0.05) / (lo + 0.05)
}

/// Contrast ratio between an OKLCH foreground and background.
pub fn ratio(fg: Oklch, bg: Oklch) -> f64 {
    contrast_ratio(fg.to_rgb8(), bg.to_rgb8())
}

/// Picks white or near-black text for a background — whichever contrasts more.
pub fn contrast_text(bg: Oklch) -> Oklch {
    let white = Oklch::from_rgb8(255, 255, 255);
    let dark = Oklch::from_rgb8(17, 24, 39); // #111827, the collection's ink
    let rw = ratio(white, bg);
    let rd = ratio(dark, bg);
    if rw >= rd { white } else { dark }
}

/// WCAG AA threshold for normal-size text.
pub const AA: f64 = 4.5;

/// Adjusts `fg` against `bg` until the pair passes `min_ratio`.
///
/// The correction moves lightness only (hue and chroma character survive),
/// stepping toward whichever ink extreme has more headroom — how designers
/// fix contrast by hand. Returns the adjusted foreground.
pub fn ensure_contrast(fg: Oklch, bg: Oklch, min_ratio: f64) -> Oklch {
    if ratio(fg, bg) >= min_ratio {
        return fg;
    }
    let white = Oklch::from_rgb8(255, 255, 255);
    let dark = Oklch::from_rgb8(17, 24, 39); // #111827, the collection's ink
    let target = if ratio(white, bg) >= ratio(dark, bg) {
        white
    } else {
        dark
    };
    let mut adjusted = fg;
    let step = if target.l >= fg.l { 0.02 } else { -0.02 };
    for _ in 0..128 {
        let next = (adjusted.l + step).clamp(0.0, 1.0);
        if (next - adjusted.l).abs() < f64::EPSILON {
            break; // headroom exhausted
        }
        adjusted.l = next;
        if ratio(adjusted, bg) >= min_ratio {
            return adjusted;
        }
    }
    if ratio(target, bg) >= min_ratio {
        target
    } else {
        adjusted
    }
}

/// Guarantees a *readable pair*: corrects the foreground first; when the
/// background sits in the "no accessible ink" mid band (white and dark both
/// fail), it nudges the background lightness — darker for white ink, lighter
/// for dark ink — until an accessible pair exists.
///
/// Returns `(foreground, background)`. This is the product's promise that a
/// user can never ship an unreadable value segment.
pub fn ensure_readable_pair(fg: Oklch, bg: Oklch, min_ratio: f64) -> (Oklch, Oklch) {
    let white = Oklch::from_rgb8(255, 255, 255);
    let dark = Oklch::from_rgb8(17, 24, 39);

    let fixed_fg = ensure_contrast(fg, bg, min_ratio);
    if ratio(fixed_fg, bg) >= min_ratio {
        return (fixed_fg, bg);
    }

    // No ink passes: the background itself must move.
    let use_white = ratio(white, bg) >= ratio(dark, bg);
    let ink = if use_white { white } else { dark };
    let dir = if use_white { -0.02 } else { 0.02 };
    let mut bg2 = bg;
    for _ in 0..64 {
        let next = (bg2.l + dir).clamp(0.0, 1.0);
        if (next - bg2.l).abs() < f64::EPSILON {
            break;
        }
        bg2.l = next;
        if ratio(ink, bg2) >= min_ratio {
            return (ensure_contrast(fg, bg2, min_ratio), bg2);
        }
    }
    (ink, bg2)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn assert_close(a: f64, b: f64, eps: f64) {
        assert!((a - b).abs() < eps, "{a} vs {b}");
    }

    #[test]
    fn black_white_extremes() {
        assert_close(relative_luminance((0, 0, 0)), 0.0, 1e-9);
        assert_close(relative_luminance((255, 255, 255)), 1.0, 1e-9);
        assert_close(contrast_ratio((0, 0, 0), (255, 255, 255)), 21.0, 1e-6);
    }

    #[test]
    fn known_contrast_value() {
        // #767676 on white is the classic "just passes AA" gray (4.54:1)
        let r = contrast_ratio((0x76, 0x76, 0x76), (0xff, 0xff, 0xff));
        assert_close(r, 4.54, 0.03);
    }

    #[test]
    fn contrast_is_symmetric() {
        let a = contrast_ratio((0x3b, 0x82, 0xf6), (0xff, 0xff, 0xff));
        let b = contrast_ratio((0xff, 0xff, 0xff), (0x3b, 0x82, 0xf6));
        assert_close(a, b, 1e-9);
    }

    #[test]
    fn ensure_contrast_fixes_failing_pair() {
        // #94a3b8 (slate-400) on white fails AA badly
        let fg = Oklch::from_rgb8(0x94, 0xa3, 0xb8);
        let bg = Oklch::from_rgb8(0xff, 0xff, 0xff);
        assert!(ratio(fg, bg) < AA);
        let fixed = ensure_contrast(fg, bg, AA);
        assert!(ratio(fixed, bg) >= AA, "fixed ratio {}", ratio(fixed, bg));
        // Lightness-only correction: hue stays
        assert!((fixed.h - fg.h).abs() < 0.5 || fixed.c < 0.02);
    }

    #[test]
    fn ensure_contrast_leaves_passing_pair_alone() {
        let fg = Oklch::from_rgb8(0x11, 0x18, 0x27);
        let bg = Oklch::from_rgb8(0xff, 0xff, 0xff);
        let fixed = ensure_contrast(fg, bg, AA);
        assert_eq!(fixed.to_rgb8(), fg.to_rgb8());
    }

    #[test]
    fn contrast_text_picks_sensible_ink() {
        let white_bg = Oklch::from_rgb8(0xff, 0xff, 0xff);
        let picked = contrast_text(white_bg);
        assert_eq!(picked.to_rgb8(), (17, 24, 39));
        let dark_bg = Oklch::from_rgb8(0x11, 0x18, 0x27);
        let picked = contrast_text(dark_bg);
        assert_eq!(picked.to_rgb8(), (255, 255, 255));
    }

    #[test]
    fn readable_pair_rescues_mid_gray_background() {
        // slate-500-ish: neither white nor dark ink passes AA on it
        let bg = Oklch::new(0.58, 0.03, 250.0);
        let fg = Oklch::from_rgb8(0xff, 0xff, 0xff);
        assert!(ratio(fg, bg) < AA);
        let (fg2, bg2) = ensure_readable_pair(fg, bg, AA);
        assert!(ratio(fg2, bg2) >= AA, "pair ratio {}", ratio(fg2, bg2));
        // background moved only in lightness, barely: hue preserved
        assert!((bg2.h - bg.h).abs() < 0.5);
        assert!((bg2.l - bg.l).abs() < 0.15);
    }

    #[test]
    fn guardrail_rescues_neon_on_neon() {
        // Yellow text on white-ish yellow: the kind of atrocity users ship
        let fg = Oklch::from_rgb8(0xfd, 0xe0, 0x48); // yellow
        let bg = Oklch::from_rgb8(0xfe, 0xf3, 0xc7); // pale yellow
        let fixed = ensure_contrast(fg, bg, AA);
        assert!(ratio(fixed, bg) >= AA, "rescued ratio {}", ratio(fixed, bg));
    }
}
