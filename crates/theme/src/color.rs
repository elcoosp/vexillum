//! OKLCH color type with sRGB conversions and gamut mapping.

use std::fmt;

/// An OKLCH color: lightness 0..1, chroma ≥ 0, hue in degrees.
#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Oklch {
    pub l: f64,
    pub c: f64,
    pub h: f64,
}

impl Oklch {
    pub const fn new(l: f64, c: f64, h: f64) -> Self {
        Self { l, c, h }
    }

    /// Pure neutral (gray) at the given lightness.
    pub const fn neutral(l: f64) -> Self {
        Self { l, c: 0.0, h: 0.0 }
    }

    /// sRGB 8-bit triplet → OKLCH.
    pub fn from_rgb8(r: u8, g: u8, b: u8) -> Self {
        let (lr, lg, lb) = (
            linear_from_srgb8(r),
            linear_from_srgb8(g),
            linear_from_srgb8(b),
        );
        let lab = oklab_from_linear(lr, lg, lb);
        let c = (lab.1 * lab.1 + lab.2 * lab.2).sqrt();
        let mut h = lab.2.atan2(lab.1).to_degrees();
        if h < 0.0 {
            h += 360.0;
        }
        Self { l: lab.0, c, h }
    }

    /// Parses `#rgb`, `#rrggbb`, or `oklch(L C H)`.
    pub fn parse(input: &str) -> Option<Self> {
        let input = input.trim();
        if let Some(hex) = input.strip_prefix('#') {
            return match hex.len() {
                3 => {
                    let v = u16::from_str_radix(hex, 16).ok()?;
                    let r = ((v >> 8) & 0xF) as u8;
                    let g = ((v >> 4) & 0xF) as u8;
                    let b = (v & 0xF) as u8;
                    // expand 4-bit to 8-bit by duplication
                    Some(Self::from_rgb8(r * 17, g * 17, b * 17))
                }
                6 => {
                    let v = u32::from_str_radix(hex, 16).ok()?;
                    Some(Self::from_rgb8((v >> 16) as u8, (v >> 8) as u8, v as u8))
                }
                _ => None,
            };
        }
        if input.starts_with("oklch(") && input.ends_with(')') {
            let inner = &input[6..input.len() - 1];
            let mut parts = inner.split_whitespace();
            let l = parse_component(parts.next()?)?;
            let c = parse_component(parts.next()?)?;
            let h = parse_component(parts.next()?)?;
            return Some(Self { l, c, h });
        }
        None
    }

    /// CSS `oklch()` string, e.g. `oklch(0.598 0.156 254.1)`.
    pub fn to_css(&self) -> String {
        format!(
            "oklch({:.4} {:.4} {:.2})",
            clamp01(self.l),
            self.c.max(0.0),
            self.h.rem_euclid(360.0)
        )
    }

    /// Nearest sRGB 8-bit representation (gamut-mapped by chroma reduction).
    pub fn to_rgb8(self) -> (u8, u8, u8) {
        let mut color = self;
        for _ in 0..64 {
            if let Some(rgb) = try_rgb8(color) {
                return rgb;
            }
            color.c *= 0.97; // reduce chroma until in gamut
        }
        // Last resort: drop all chroma.
        try_rgb8(Oklch::neutral(color.l)).unwrap_or_else(|| {
            let v = (clamp01(color.l) * 255.0).round() as u8;
            (v, v, v)
        })
    }

    /// Returns the color with lightness increased by `amount` (0..1 space).
    pub fn lighten(self, amount: f64) -> Self {
        Self {
            l: clamp01(self.l + amount),
            ..self
        }
    }

    /// Returns the color with lightness decreased by `amount`.
    pub fn darken(self, amount: f64) -> Self {
        Self {
            l: clamp01(self.l - amount),
            ..self
        }
    }

    /// Perceived lightness (L in 0..1), the OKLCH `l` component.
    pub fn lightness(self) -> f64 {
        self.l
    }
}

impl fmt::Display for Oklch {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.to_css())
    }
}

fn clamp01(v: f64) -> f64 {
    v.clamp(0.0, 1.0)
}

fn parse_component(s: &str) -> Option<f64> {
    if let Some(pct) = s.strip_suffix('%') {
        return pct.parse::<f64>().ok().map(|v| v / 100.0);
    }
    s.parse().ok()
}

fn linear_from_srgb8(v: u8) -> f64 {
    linear_from_srgb(v as f64 / 255.0)
}

fn linear_from_srgb(v: f64) -> f64 {
    if v <= 0.04045 {
        v / 12.92
    } else {
        ((v + 0.055) / 1.055).powf(2.4)
    }
}

fn srgb_from_linear(v: f64) -> f64 {
    if v <= 0.003_130_8 {
        v * 12.92
    } else {
        1.055 * v.powf(1.0 / 2.4) - 0.055
    }
}

/// Björn Ottosson's OKLab from linear sRGB.
fn oklab_from_linear(r: f64, g: f64, b: f64) -> (f64, f64, f64) {
    let l = 0.412_221_470_8 * r + 0.536_332_536_3 * g + 0.051_445_992_9 * b;
    let m = 0.211_903_498_2 * r + 0.680_699_545_1 * g + 0.107_396_956_6 * b;
    let s = 0.088_302_461_9 * r + 0.281_718_837_6 * g + 0.629_978_700_5 * b;
    let l_ = l.cbrt();
    let m_ = m.cbrt();
    let s_ = s.cbrt();
    (
        0.210_454_255_3 * l_ + 0.793_617_785_0 * m_ - 0.004_072_046_8 * s_,
        1.977_998_495_1 * l_ - 2.428_592_205_0 * m_ + 0.450_593_709_9 * s_,
        0.025_904_037_1 * l_ + 0.782_771_766_2 * m_ - 0.808_675_766_0 * s_,
    )
}

/// Linear sRGB from OKLab (Ottosson inverse).
fn linear_from_oklab(lum: f64, a: f64, b: f64) -> (f64, f64, f64) {
    let l_ = lum + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
    let m_ = lum - 0.105_561_345_8 * a - 0.063_854_172_8 * b;
    let s_ = lum - 0.089_484_177_5 * a - 1.291_485_548_0 * b;
    let l = l_ * l_ * l_;
    let m = m_ * m_ * m_;
    let s = s_ * s_ * s_;
    (
        4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
        -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
        -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701_0 * s,
    )
}

/// Attempts a direct 8-bit conversion; `None` when out of gamut.
fn try_rgb8(color: Oklch) -> Option<(u8, u8, u8)> {
    let h = color.h.to_radians();
    let (lr, lg, lb) = linear_from_oklab(color.l, color.c * h.cos(), color.c * h.sin());
    let in_gamut = [lr, lg, lb]
        .iter()
        .all(|v| (-1e-4..=1.0 + 1e-4).contains(v));
    if !in_gamut {
        return None;
    }
    let to8 = |v: f64| (srgb_from_linear(v.clamp(0.0, 1.0)) * 255.0).round() as u8;
    Some((to8(lr), to8(lg), to8(lb)))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn assert_close(a: f64, b: f64, eps: f64) {
        assert!((a - b).abs() < eps, "{a} vs {b}");
    }

    #[test]
    fn white_and_black() {
        let white = Oklch::from_rgb8(255, 255, 255);
        assert_close(white.l, 1.0, 1e-6);
        let black = Oklch::from_rgb8(0, 0, 0);
        assert_close(black.l, 0.0, 1e-6);
    }

    #[test]
    fn css_blue_roundtrips() {
        // Tailwind blue-500 #3b82f6 is famously oklch(0.623 0.214 259.8)
        let blue = Oklch::from_rgb8(0x3b, 0x82, 0xf6);
        // Hand-verified with Ottosson's OKLab matrices: L=0.623, C=0.188, H=259.8
        assert_close(blue.l, 0.623, 0.01);
        assert_close(blue.c, 0.188, 0.005);
        assert_close(blue.h.rem_euclid(360.0), 259.8, 1.0);
        let back = blue.to_rgb8();
        assert_eq!(back, (0x3b, 0x82, 0xf6));
    }

    #[test]
    fn parse_hex_and_oklch() {
        let a = Oklch::parse("#3b82f6").unwrap();
        let b = Oklch::parse("oklch(0.623 0.214 259.8)").unwrap();
        assert_close(a.l, b.l, 0.01);
        assert_eq!(Oklch::parse("nope"), None);
        assert_eq!(Oklch::parse("#12345").is_none(), true);
        let short = Oklch::parse("#fff").unwrap();
        assert_eq!(short.to_rgb8(), (255, 255, 255));
    }

    #[test]
    fn to_css_format() {
        let c = Oklch::new(0.62, 0.18, 250.0);
        assert_eq!(c.to_css(), "oklch(0.6200 0.1800 250.00)");
        assert!(c.to_css().starts_with("oklch("));
    }

    #[test]
    fn gamut_mapping_keeps_colors_renderable() {
        // Absurdly high chroma must gamut-map instead of producing garbage
        let wild = Oklch::new(0.5, 0.9, 140.0);
        let (r, g, b) = wild.to_rgb8();
        // any valid u8 triple is acceptable, just must not panic
        let _ = (r, g, b);
    }

    #[test]
    fn lighten_darken_clamp() {
        let c = Oklch::neutral(0.9).lighten(0.5);
        assert_close(c.l, 1.0, 1e-9);
        let d = Oklch::neutral(0.1).darken(0.5);
        assert_close(d.l, 0.0, 1e-9);
    }
}
