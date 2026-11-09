//! Font registry for the badge renderer.
//!
//! Fonts are bundled (Inter, JetBrains Mono, Instrument Serif, Space Mono —
//! the families the source collections use) and registered explicitly, since
//! vexillum never loads system fonts.

use std::sync::OnceLock;

use takumi::prelude::{FontResource, Fonts};

const INTER: &[u8] = include_bytes!("../assets/fonts/Inter-Variable.ttf");
const JETBRAINS_MONO: &[u8] = include_bytes!("../assets/fonts/JetBrainsMono-Variable.ttf");
const JETBRAINS_MONO_ITALIC: &[u8] =
    include_bytes!("../assets/fonts/JetBrainsMono-Italic-Variable.ttf");
const INSTRUMENT_SERIF: &[u8] = include_bytes!("../assets/fonts/InstrumentSerif-Regular.ttf");
const INSTRUMENT_SERIF_ITALIC: &[u8] = include_bytes!("../assets/fonts/InstrumentSerif-Italic.ttf");
const SPACE_MONO: &[u8] = include_bytes!("../assets/fonts/SpaceMono-Regular.ttf");
const SPACE_MONO_BOLD: &[u8] = include_bytes!("../assets/fonts/SpaceMono-Bold.ttf");

/// Registers every bundled font into a fresh [`Fonts`] registry.
pub fn build_fonts() -> Result<Fonts, vexillum_core::Error> {
    let mut fonts = Fonts::default();
    for bytes in [
        INTER,
        JETBRAINS_MONO,
        JETBRAINS_MONO_ITALIC,
        INSTRUMENT_SERIF,
        INSTRUMENT_SERIF_ITALIC,
        SPACE_MONO,
        SPACE_MONO_BOLD,
    ] {
        fonts
            .register(FontResource::new(bytes))
            .map_err(|e| vexillum_core::Error::Render(format!("font registration failed: {e}")))?;
    }
    Ok(fonts)
}

/// The process-wide font registry (registration is idempotent).
pub fn global_fonts() -> &'static Fonts {
    static FONTS: OnceLock<Fonts> = OnceLock::new();
    FONTS.get_or_init(|| build_fonts().expect("bundled fonts must register"))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bundled_fonts_register() {
        let fonts = build_fonts().expect("fonts");
        // no public family listing API; success = no error
        let _ = fonts;
    }
}
