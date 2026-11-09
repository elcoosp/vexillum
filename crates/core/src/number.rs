//! Compact number formatting for data services (shields.io-style).

/// Formats a count the way README badges expect: `987`, `12.3k`, `1.2M`, `3.4B`.
///
/// Values below 1000 keep their integer form; each higher tier keeps three
/// significant digits with the trailing `.0` trimmed.
pub fn format_compact_number(value: f64) -> String {
    let abs = value.abs();
    let (divisor, suffix) = if abs >= 1_000_000_000.0 {
        (1_000_000_000.0, "B")
    } else if abs >= 1_000_000.0 {
        (1_000_000.0, "M")
    } else if abs >= 1_000.0 {
        (1_000.0, "k")
    } else {
        (1.0, "")
    };

    if divisor == 1.0 {
        return format!("{}", value.round() as i64);
    }

    let scaled = value / divisor;
    // Shields-style precision: two significant digits below 10 (1.2M),
    // three up to 100 (12.3k), integer beyond (123k).
    let decimals = if scaled >= 100.0 { 0 } else { 1 };
    let mut text = format!("{scaled:.decimals$}");
    if text.contains('.') {
        while text.ends_with('0') {
            text.pop();
        }
        if text.ends_with('.') {
            text.pop();
        }
    }
    format!("{text}{suffix}")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn small_numbers_stay_plain() {
        assert_eq!(format_compact_number(0.0), "0");
        assert_eq!(format_compact_number(42.0), "42");
        assert_eq!(format_compact_number(987.0), "987");
        assert_eq!(format_compact_number(999.0), "999");
    }

    #[test]
    fn thousands_compact_to_k() {
        assert_eq!(format_compact_number(1000.0), "1k");
        assert_eq!(format_compact_number(12_345.0), "12.3k");
        assert_eq!(format_compact_number(123_456.0), "123k");
        assert_eq!(format_compact_number(999_999.0), "1000k");
    }

    #[test]
    fn millions_compact_to_m() {
        assert_eq!(format_compact_number(1_000_000.0), "1M");
        assert_eq!(format_compact_number(1_234_567.0), "1.2M");
        assert_eq!(format_compact_number(15_700_000.0), "15.7M");
        assert_eq!(format_compact_number(428_000_000.0), "428M");
    }

    #[test]
    fn billions_compact_to_b() {
        assert_eq!(format_compact_number(1_000_000_000.0), "1B");
        assert_eq!(format_compact_number(3_400_000_000.0), "3.4B");
    }

    #[test]
    fn rounds_instead_of_truncating() {
        assert_eq!(format_compact_number(1999.0), "2k");
        assert_eq!(format_compact_number(1_999_999.0), "2M");
    }
}
