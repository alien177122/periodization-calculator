//! Catalog-free subset of `split-weight-readiness.ts`.
//! TS also requires `CATALOG_EXERCISES[key]`; that check stays in TypeScript.

#[derive(Debug, Clone)]
pub struct SavedExerciseLite {
    pub exercise_key: String,
    pub test_weight: f64,
    pub test_reps: f64,
    pub one_rm: f64,
}

pub fn are_calculation_weights_ready(keys: &[String], exercises: &[SavedExerciseLite]) -> bool {
    if keys.is_empty() {
        return false;
    }
    keys.iter().all(|key| {
        exercises.iter().any(|saved| {
            saved.exercise_key == *key
                && saved.test_weight > 0.0
                && saved.test_reps > 0.0
                && saved.one_rm > 0.0
        })
    })
}

pub fn missing_exercise_keys(keys: &[String], exercises: &[SavedExerciseLite]) -> Vec<String> {
    keys.iter()
        .filter(|key| {
            !exercises.iter().any(|saved| {
                saved.exercise_key == **key
                    && saved.test_weight > 0.0
                    && saved.test_reps > 0.0
                    && saved.one_rm > 0.0
            })
        })
        .cloned()
        .collect()
}

#[cfg(test)]
mod tests {
    use super::{are_calculation_weights_ready, SavedExerciseLite};

    #[test]
    fn requires_every_key() {
        let keys = vec!["bench".into(), "squat".into()];
        let mut exercises = vec![SavedExerciseLite {
            exercise_key: "bench".into(),
            test_weight: 100.0,
            test_reps: 6.0,
            one_rm: 120.0,
        }];
        assert!(!are_calculation_weights_ready(&keys, &exercises));
        exercises.push(SavedExerciseLite {
            exercise_key: "squat".into(),
            test_weight: 140.0,
            test_reps: 5.0,
            one_rm: 160.0,
        });
        assert!(are_calculation_weights_ready(&keys, &exercises));
    }
}
