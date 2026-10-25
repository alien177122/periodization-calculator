use wasm_bindgen::prelude::wasm_bindgen;

use crate::{
    calc_1rm, calc_working_weight, ceil_to_step, round_one_rm, round_weight, volume_class,
    EquipmentType, OneRmMethod,
};

#[wasm_bindgen(js_name = calc1RM)]
pub fn calc_1rm_js(weight: f64, reps: f64, method: &str) -> f64 {
    calc_1rm(weight, reps, OneRmMethod::parse(method))
}

#[wasm_bindgen(js_name = roundOneRm)]
pub fn round_one_rm_js(value: f64) -> f64 {
    round_one_rm(value)
}

#[wasm_bindgen(js_name = ceilToStep)]
pub fn ceil_to_step_js(value: f64, step: f64) -> f64 {
    ceil_to_step(value, step)
}

#[wasm_bindgen(js_name = roundWeight)]
pub fn round_weight_js(value: f64, step: f64, equipment: &str) -> f64 {
    round_weight(value, step, EquipmentType::parse(equipment))
}

#[wasm_bindgen(js_name = calcWorkingWeight)]
pub fn calc_working_weight_js(one_rm: f64, pct: f64, step: f64, equipment: &str) -> f64 {
    calc_working_weight(one_rm, pct, step, EquipmentType::parse(equipment))
}

#[wasm_bindgen(js_name = volumeClass)]
pub fn volume_class_js(sets: f64) -> String {
    volume_class(sets).to_string()
}
