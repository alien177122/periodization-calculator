//! Pure periodization calc core. Host tests use the rlib; wasm is `--features wasm`.

pub mod one_rm;
pub mod progression;
pub mod round;
pub mod split_weight_readiness;
pub mod volume;
pub mod volume_matrix;

pub use one_rm::{calc_1rm, OneRmMethod};
pub use round::{calc_working_weight, ceil_to_step, round_one_rm, round_weight, EquipmentType};
pub use split_weight_readiness::{
    are_calculation_weights_ready, missing_exercise_keys, SavedExerciseLite,
};
pub use volume::volume_class;

#[cfg(feature = "wasm")]
mod wasm;
