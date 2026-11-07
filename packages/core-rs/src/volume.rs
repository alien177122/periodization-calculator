/// Volume class from weekly set count — same thresholds as `volumeClass` in calc.ts.
pub fn volume_class(sets: f64) -> &'static str {
    if sets >= 28.0 {
        "v-hi"
    } else if sets <= 16.0 {
        "v-lo"
    } else {
        "v-md"
    }
}

#[cfg(test)]
mod tests {
    use super::volume_class;

    #[test]
    fn thresholds() {
        assert_eq!(volume_class(28.0), "v-hi");
        assert_eq!(volume_class(20.0), "v-md");
        assert_eq!(volume_class(16.0), "v-lo");
    }
}
