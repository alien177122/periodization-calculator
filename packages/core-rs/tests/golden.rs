use serde::Deserialize;
use std::fs;
use std::path::PathBuf;
use training_core::{
    calc_1rm, ceil_to_step, round_one_rm, round_weight, volume_class, EquipmentType, OneRmMethod,
};

fn golden(name: &str) -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .join("golden")
        .join(name)
}

#[derive(Debug, Deserialize)]
struct OneRmCase {
    weight: f64,
    reps: f64,
    method: String,
    expected: f64,
    rounded: f64,
}

#[derive(Debug, Deserialize)]
struct CeilCase {
    value: f64,
    step: f64,
    expected: f64,
}

#[derive(Debug, Deserialize)]
struct RoundWeightCase {
    value: f64,
    step: f64,
    #[serde(rename = "type")]
    equipment: String,
    expected: f64,
}

#[derive(Debug, Deserialize)]
struct VolumeCase {
    t: f64,
    expected: String,
}

#[derive(Debug, Deserialize)]
struct Helpers {
    #[serde(rename = "ceilToStep")]
    ceil_to_step: Vec<CeilCase>,
    #[serde(rename = "roundWeight")]
    round_weight: Vec<RoundWeightCase>,
    #[serde(rename = "volumeClass")]
    volume_class: Vec<VolumeCase>,
}

fn assert_bits(actual: f64, expected: f64, label: &str) {
    if actual == expected {
        return;
    }
    let err = (actual - expected).abs();
    let tol = 1e-12 * expected.abs().max(1.0);
    assert!(
        err <= tol,
        "{label}: rust={actual} ts={expected} err={err} tol={tol}"
    );
}

#[test]
fn one_rm_matches_ts_golden() {
    let raw = fs::read_to_string(golden("one_rm.json")).unwrap();
    let cases: Vec<OneRmCase> = serde_json::from_str(&raw).unwrap();
    assert!(cases.len() >= 30);
    for case in cases {
        let method = OneRmMethod::parse(&case.method);
        let actual = calc_1rm(case.weight, case.reps, method);
        assert_bits(
            actual,
            case.expected,
            &format!("{} {}x{}", case.method, case.weight, case.reps),
        );
        assert_bits(
            round_one_rm(actual),
            case.rounded,
            &format!("rounded {} {}x{}", case.method, case.weight, case.reps),
        );
    }
}

#[test]
fn helpers_match_ts_golden() {
    let raw = fs::read_to_string(golden("helpers.json")).unwrap();
    let helpers: Helpers = serde_json::from_str(&raw).unwrap();
    for case in helpers.ceil_to_step {
        assert_bits(
            ceil_to_step(case.value, case.step),
            case.expected,
            &format!("ceilToStep {}/{}", case.value, case.step),
        );
    }
    for case in helpers.round_weight {
        assert_bits(
            round_weight(case.value, case.step, EquipmentType::parse(&case.equipment)),
            case.expected,
            &format!("roundWeight {} {} {}", case.value, case.step, case.equipment),
        );
    }
    for case in helpers.volume_class {
        assert_eq!(volume_class(case.t), case.expected, "volumeClass {}", case.t);
    }
}
