const SPECIAL_CHARS = /[!@#$%^&*(),.?":{}|<>~`_+\-=[\]\\|;/']/;

export function validatePassword(pw) {
  if (!pw) {
    return {
      criteria: {
        minLength: false,
        hasUppercase: false,
        hasLowercase: false,
        hasDigit: false,
        hasSpecial: false,
      },
      score: 0,
      label: 'weak',
      isValid: false,
    };
  }

  const criteria = {
    minLength: pw.length >= 8,
    hasUppercase: /[A-Z]/.test(pw),
    hasLowercase: /[a-z]/.test(pw),
    hasDigit: /\d/.test(pw),
    hasSpecial: SPECIAL_CHARS.test(pw),
  };

  const met = Object.values(criteria).filter(Boolean).length;
  const score = Math.min(met, 4);
  const labels = {0: 'weak', 1: 'weak', 2: 'fair', 3: 'good', 4: 'strong'};
  const withinBcryptLimit = pw.length <= 72;

  return {
    criteria,
    score,
    label: labels[score],
    isValid: criteria.minLength && withinBcryptLimit && score >= 3,
  };
}

export function passwordPolicyError(pw) {
  const result = validatePassword(pw);
  if (result.isValid) return null;
  if (pw && pw.length > 72) {
    return 'Пароль не длиннее 72 символов';
  }
  if (!result.criteria.minLength) {
    return 'Пароль минимум 8 символов';
  }
  return 'Пароль слабый. Добавь заглавную и строчную буквы, цифру или спецсимвол';
}
