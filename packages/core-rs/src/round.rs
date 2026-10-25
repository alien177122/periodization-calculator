use serde::{Deserialize, Serialize};
use ts_rs::TS;

/// Matches exercise `type` in shared calc (`A` | `B` | `C` | `D`).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, TS)]
#[ts(export, export_to = "../../core/src/generated/")]
pub enum EquipmentType {
    A,
    B,
    C,
    D,
}

impl EquipmentType {
    pub fn parse(value: &str) -> Self {
        match value {
            "B" => Self::B,
            "C" => Self::C,
            "D" => Self::D,
            _ => Self::A,
        }
    }
}

pub fn round_one_rm(value: f64) -> f64 {
    (value * 10.0).round() / 10.0
}

pub fn ceil_to_step(value: f64, step: f64) -> f64 {
    if step <= 0.0 {
        return value;
    }
    (value / step).ceil() * step
}

pub fn round_weight(value: f64, step: f64, equipment: EquipmentType) -> f64 {
    if equipment == EquipmentType::C {
        return (value / step).floor() * step;
    }
    (value / step).ceil() * step
}

pub fn calc_working_weight(one_rm: f64, pct: f64, step: f64, equipment: EquipmentType) -> f64 {
    round_weight(one_rm * (pct / 100.0), step, equipment)
}

#[cfg(test)]
mod tests {
    use super::{calc_working_weight, ceil_to_step, round_weight, EquipmentType};

    #[test]
    fn rounding_matches_ts_fixtures() {
        assert_eq!(ceil_to_step(81.1, 2.5), 82.5);
        assert_eq!(round_weight(81.1, 2.5, EquipmentType::A), 82.5);
        assert_eq!(round_weight(23.9, 2.0, EquipmentType::C), 22.0);
        assert_eq!(calc_working_weight(137.0, 73.0, 2.5, EquipmentType::A), 102.5);
    }
}
