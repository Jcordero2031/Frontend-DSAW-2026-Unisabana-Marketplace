/* Global input validation and sanitization utilities (Ticket 19) */

// Strip HTML tags to prevent XSS
export const sanitize = (str) =>
  String(str).replace(/<[^>]*>/g, '').trim();

// Validators return null if valid, or an error string
export const validators = {
  required: (val, label = 'Este campo') =>
    !val || String(val).trim() === '' ? `${label} es obligatorio` : null,

  email: (val) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : 'Correo electrónico inválido',

  unisabanaEmail: (val) =>
    val?.endsWith('@unisabana.edu.co') ? null : 'Solo se permiten correos @unisabana.edu.co',

  minLength: (val, min, label = 'El campo') =>
    String(val).trim().length >= min ? null : `${label} debe tener al menos ${min} caracteres`,

  maxLength: (val, max, label = 'El campo') =>
    String(val).trim().length <= max ? null : `${label} no puede superar ${max} caracteres`,

  positiveNumber: (val, label = 'El valor') =>
    !isNaN(val) && Number(val) > 0 ? null : `${label} debe ser un número positivo`,

  nonNegativeInt: (val, label = 'El valor') =>
    Number.isInteger(Number(val)) && Number(val) >= 0 ? null : `${label} debe ser un entero mayor o igual a 0`,

  match: (val, other, label = 'Los valores') =>
    val === other ? null : `${label} no coinciden`,

  targetType: (val) =>
    ['product', 'user'].includes(val) ? null : 'targetType debe ser product o user',

  uuid: (val) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val)
      ? null
      : 'ID inválido',
};

// Validate a form object against a rules map.
// rules: { field: [(val) => errorOrNull, ...] }
// Returns { isValid, errors: { field: firstError } }
export const validateForm = (values, rules) => {
  const errors = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      const err = rule(values[field]);
      if (err) { errors[field] = err; break; }
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
};

// Sanitize all string fields of an object (shallow)
export const sanitizeObject = (obj) => {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    result[k] = typeof v === 'string' ? sanitize(v) : v;
  }
  return result;
};
