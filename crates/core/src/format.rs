//! Output formats and their HTTP metadata.

use std::str::FromStr;

use crate::Error;

/// Render output formats, in URL (`?format=`) and HTTP representation.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Format {
    Svg,
    Png,
    WebP,
    Gif,
    Apng,
    Jpeg,
}

impl Format {
    /// IANA media type for the response body.
    pub const fn content_type(self) -> &'static str {
        match self {
            Self::Svg => "image/svg+xml",
            Self::Png => "image/png",
            Self::WebP => "image/webp",
            Self::Gif => "image/gif",
            Self::Apng => "image/apng",
            Self::Jpeg => "image/jpeg",
        }
    }

    /// Canonical file extension used by the path-style routes.
    pub const fn extension(self) -> &'static str {
        match self {
            Self::Svg => "svg",
            Self::Png => "png",
            Self::WebP => "webp",
            Self::Gif => "gif",
            Self::Apng => "apng",
            Self::Jpeg => "jpg",
        }
    }

    /// Whether the format supports animation (multi-frame timelines).
    pub const fn is_animated(self) -> bool {
        matches!(self, Self::Gif | Self::Apng | Self::WebP)
    }

    /// All formats exposed on `GET /v1/variants` and the docs page.
    pub const fn all() -> [Self; 6] {
        [
            Self::Svg,
            Self::Png,
            Self::WebP,
            Self::Gif,
            Self::Apng,
            Self::Jpeg,
        ]
    }
}

impl FromStr for Format {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_ascii_lowercase().as_str() {
            "svg" => Ok(Self::Svg),
            "png" => Ok(Self::Png),
            "webp" => Ok(Self::WebP),
            "gif" => Ok(Self::Gif),
            "apng" => Ok(Self::Apng),
            "jpg" | "jpeg" => Ok(Self::Jpeg),
            other => Err(Error::UnknownFormat(other.into())),
        }
    }
}

/// Integer render scale for raster formats (1x, 2x, 3x device pixel ratio).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, serde::Serialize, serde::Deserialize)]
pub enum Scale {
    One,
    Two,
    Three,
}

impl Scale {
    pub const fn as_f32(self) -> f32 {
        match self {
            Self::One => 1.0,
            Self::Two => 2.0,
            Self::Three => 3.0,
        }
    }
}

impl FromStr for Scale {
    type Err = Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "1" | "" => Ok(Self::One),
            "2" => Ok(Self::Two),
            "3" => Ok(Self::Three),
            other => Err(Error::UnknownScale(other.into())),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_all_formats() {
        for f in Format::all() {
            let s = f.extension();
            assert_eq!(Format::from_str(s).unwrap(), f, "extension of {s}");
        }
        assert_eq!(Format::from_str("JPG").unwrap(), Format::Jpeg);
        assert_eq!(Format::from_str("SVG").unwrap(), Format::Svg);
    }

    #[test]
    fn rejects_unknown_format() {
        assert!(Format::from_str("bmp").is_err());
        assert!(Format::from_str("").is_err());
    }

    #[test]
    fn content_types_are_correct() {
        assert_eq!(Format::Svg.content_type(), "image/svg+xml");
        assert_eq!(Format::Gif.content_type(), "image/gif");
        assert_eq!(Format::Apng.content_type(), "image/apng");
    }

    #[test]
    fn animation_support_matrix() {
        assert!(Format::Gif.is_animated());
        assert!(Format::Apng.is_animated());
        assert!(Format::WebP.is_animated());
        assert!(!Format::Png.is_animated());
        assert!(!Format::Svg.is_animated());
    }

    #[test]
    fn scales() {
        assert_eq!("2".parse::<Scale>().unwrap().as_f32(), 2.0);
        assert!("9".parse::<Scale>().is_err());
    }
}
