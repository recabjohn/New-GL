import { useState, useCallback } from 'react'

// ── Validation rules ──────────────────────────────────────────────────────────
const RULES = {
  required:  (v) => (!v || !v.toString().trim()) ? 'This field is required' : null,
  email:     (v) => v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? 'Enter a valid email address' : null,
  phone:     (v) => v && !/^[\d\s\-().+]{7,20}$/.test(v) ? 'Enter a valid phone number' : null,
  fein:      (v) => v && !/^\d{2}-?\d{7}$/.test(v.replace(/\s/g, '')) ? 'Format: XX-XXXXXXX' : null,
  zip:       (v) => v && !/^\d{5}(-\d{4})?$/.test(v) ? 'Enter a valid 5-digit ZIP' : null,
  date:      (v) => v && isNaN(Date.parse(v)) ? 'Enter a valid date' : null,
  minLength: (n) => (v) => v && v.length < n ? `Minimum ${n} characters` : null,
}

/**
 * useFieldValidation — real-time inline form validation
 *
 * @param {Object} schema  - field name → array of rule keys or custom fns
 *   e.g. { accountName: ['required'], fein: ['fein'], phone: ['phone'] }
 *
 * @returns {{ errors, touched, validate, validateAll, touchField, resetErrors }}
 */
export default function useFieldValidation(schema) {
  const [errors, setErrors]   = useState({})
  const [touched, setTouched] = useState({})

  // Validate a single field value against its rules
  const validate = useCallback((field, value) => {
    const rules = schema[field]
    if (!rules) return null
    for (const rule of rules) {
      const fn = typeof rule === 'function' ? rule : RULES[rule]
      if (!fn) continue
      const msg = fn(value)
      if (msg) {
        setErrors(prev => ({ ...prev, [field]: msg }))
        return msg
      }
    }
    setErrors(prev => { const next = { ...prev }; delete next[field]; return next })
    return null
  }, [schema])

  // Mark a field as touched (show errors only after first blur)
  const touchField = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  // Validate all fields at once — returns true if all pass
  const validateAll = useCallback((values) => {
    let allValid = true
    const newErrors = {}
    for (const [field, rules] of Object.entries(schema)) {
      for (const rule of rules) {
        const fn = typeof rule === 'function' ? rule : RULES[rule]
        if (!fn) continue
        const msg = fn(values[field])
        if (msg) { newErrors[field] = msg; allValid = false; break }
      }
    }
    setErrors(newErrors)
    // mark all fields as touched
    const allTouched = {}
    for (const f of Object.keys(schema)) allTouched[f] = true
    setTouched(allTouched)
    return allValid
  }, [schema])

  const resetErrors = useCallback(() => {
    setErrors({})
    setTouched({})
  }, [])

  // Only show error if field has been touched
  const fieldError = useCallback((field) => {
    return touched[field] ? errors[field] : undefined
  }, [errors, touched])

  return { errors, touched, validate, validateAll, touchField, resetErrors, fieldError }
}
