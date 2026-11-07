use proptest::prelude::*;
use training_core::{calc_1rm, OneRmMethod};

proptest! {
    #[test]
    fn epley_is_finite_and_non_negative(weight in 0.5f64..500.0, reps in 1.0f64..30.0) {
        let value = calc_1rm(weight, reps, OneRmMethod::Epley);
        prop_assert!(value.is_finite());
        prop_assert!(value >= 0.0);
    }

    #[test]
    fn brzycki_is_finite_and_positive(weight in 0.5f64..500.0, reps in 1.0f64..30.0) {
        let value = calc_1rm(weight, reps, OneRmMethod::Brzycki);
        prop_assert!(value.is_finite());
        prop_assert!(value > 0.0);
    }

    #[test]
    fn epley_non_decreasing_with_reps(weight in 20.0f64..300.0, reps in 1u32..20) {
        let a = calc_1rm(weight, f64::from(reps), OneRmMethod::Epley);
        let b = calc_1rm(weight, f64::from(reps + 1), OneRmMethod::Epley);
        prop_assert!(b >= a);
    }

    #[test]
    fn invalid_inputs_are_zero(weight in -50.0f64..0.0, reps in -5.0f64..0.9999) {
        prop_assert_eq!(calc_1rm(weight, 5.0, OneRmMethod::Epley), 0.0);
        prop_assert_eq!(calc_1rm(100.0, reps, OneRmMethod::Brzycki), 0.0);
    }
}
