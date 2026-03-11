import { useEffect, useRef, useState, useCallback } from 'react'

// ---------------------------------------------------------------------------
// useBeforeUnload — warns user about unsaved changes when closing/refreshing
// ---------------------------------------------------------------------------

/**
 * Hook that listens for unsaved changes and warns the user on tab close/refresh.
 *
 * @param {boolean} isDirty — whether there are unsaved changes
 * @param {string}  [storageKey] — optional sessionStorage key to auto-save form data
 * @param {object}  [formData] — current form data to auto-save
 */
export function useBeforeUnload(isDirty, storageKey, formData) {
  // warn on browser close/refresh
  useEffect(() => {
    if (!isDirty) return

    const handler = (e) => {
      e.preventDefault()
      e.returnValue = '' // required for Chrome
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // auto-draft form data to sessionStorage
  useEffect(() => {
    if (!storageKey || !formData || !isDirty) return

    const timeout = setTimeout(() => {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(formData))
      } catch {
        // storage full — silently fail
      }
    }, 500) // debounce 500ms

    return () => clearTimeout(timeout)
  }, [isDirty, storageKey, formData])
}

/**
 * Retrieve auto-drafted form data from sessionStorage.
 *
 * @param {string} storageKey — the key used in useBeforeUnload
 * @returns {object|null} — the saved form data, or null
 */
export function getDraftData(storageKey) {
  try {
    const raw = sessionStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Clear the auto-draft from sessionStorage (e.g., after a successful save).
 *
 * @param {string} storageKey
 */
export function clearDraftData(storageKey) {
  try {
    sessionStorage.removeItem(storageKey)
  } catch {
    // silently fail
  }
}

// ---------------------------------------------------------------------------
// useSimulatedLoading — simulates async data loading for mock-data pages
// ---------------------------------------------------------------------------

/**
 * Returns a loading flag that starts true and becomes false after a short delay.
 * Used to simulate network latency so skeleton states are visible even with mock data.
 *
 * @param {number} [ms=600] — simulated load time in milliseconds
 * @returns {boolean} isLoading
 */
export function useSimulatedLoading(ms = 600) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms)
    return () => clearTimeout(t)
  }, [ms])

  return loading
}
