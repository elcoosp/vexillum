//! Theme engine: OKLCH color space, WCAG guardrail, token vocabulary, presets,
//! and the seed-driven semantic ramp (surfaces/borders/text/accents).

pub mod color;
pub mod contrast;
pub mod semantic;
pub mod theme;

pub use color::Oklch;
pub use contrast::{AA, contrast_ratio, contrast_text, ensure_contrast, ratio};
pub use semantic::{
    DEFAULT_SEED, Mode, PRESET_SEEDS, overlay_value_seed, parse_seed, preset_seed, resolve_ramp,
    semantic_theme, semantic_theme_duo,
};
pub use theme::{Preset, ResolvedTheme, TOKENS, preset_names, preset_theme};

pub use vexillum_core::Error;
