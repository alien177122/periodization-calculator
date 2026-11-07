use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Matches `OneRMMethod` in `packages/shared/src/utils/calc.ts`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../core/src/generated/")]
#[serde(rename_all = "lowercase")]
pub enum OneRmMethod {
    Epley,
    Brzycki,
}

impl OneRmMethod {
    pub fn parse(value: &str) -> Self {
        match value {
            "brzycki" => Self::Brzycki,
            _ => Self::Epley,
        }
    }
}

/// Port of `calc1RMTs` — same branches and literals as calc.ts.
pub fn calc_1rm(weight: f64, reps: f64, method: OneRmMethod) -> f64 {
    if weight <= 0.0 || reps < 1.0 {
        return 0.0;
    }
    match method {
        OneRmMethod::Brzycki => (100.0 * weight) / (101.3 - 2.67123 * reps),
        OneRmMethod::Epley => {
            if reps < 5.0 {
                weight / (1.0278 - 0.0278 * reps * 1.3)
            } else if reps <= 8.0 {
                weight / (1.0278 - 0.0278 * reps * 1.2)
            } else {
                weight * (1.0 + 0.0333 * reps * 1.1)
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::{calc_1rm, OneRmMethod};

    fn round1(value: f64) -> String {
        format!("{:.1}", (value * 10.0).round() / 10.0)
    }

    #[test]
    fn epley_fixtures() {
        assert_eq!(round1(calc_1rm(100.0, 6.0, OneRmMethod::Epley)), "120.8");
        assert_eq!(round1(calc_1rm(80.0, 10.0, OneRmMethod::Epley)), "109.3");
    }

    #[test]
    fn brzycki_fixtures() {
        assert_eq!(round1(calc_1rm(100.0, 5.0, OneRmMethod::Brzycki)), "113.7");
        assert_eq!(round1(calc_1rm(80.0, 8.0, OneRmMethod::Brzycki)), "100.1");
    }

    #[test]
    fn rejects_non_positive() {
        assert_eq!(calc_1rm(0.0, 5.0, OneRmMethod::Epley), 0.0);
        assert_eq!(calc_1rm(100.0, 0.0, OneRmMethod::Epley), 0.0);
        assert_eq!(calc_1rm(-10.0, 5.0, OneRmMethod::Brzycki), 0.0);
    }
}
