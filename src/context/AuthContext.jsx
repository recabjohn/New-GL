import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Hardcoded users (no backend yet)
// ---------------------------------------------------------------------------
const USERS = [
  { username: 'admin',      password: 'admin',      displayName: 'John',          role: 'Underwriter' },
  { username: 'uiuxAdmin',  password: 'admin',      displayName: 'UX Admin',      role: 'Admin' },
  { username: 'jsmith',     password: 'password',    displayName: 'J. Smith',      role: 'Underwriter' },
  { username: 'adavis',     password: 'password',    displayName: 'A. Davis',      role: 'Underwriter' },
  { username: 'mrodriguez', password: 'password',    displayName: 'M. Rodriguez',  role: 'Senior UW' },
]

const STORAGE_KEY = 'gl_paas_user'
const REMEMBER_KEY = 'gl_paas_remember'
const LAST_ACTIVITY_KEY = 'gl_paas_last_activity'
const IDLE_TIMEOUT_MS = 15 * 60 * 1000      // 15 minutes
const IDLE_WARNING_MS = 2 * 60 * 1000       // 2 min warning before logout

const AuthContext = createContext(null)

// ---------------------------------------------------------------------------
// Resolve correct storage from "remember me" preference
// ---------------------------------------------------------------------------
function getStorage() {
  try {
    return localStorage.getItem(REMEMBER_KEY) === 'true' ? localStorage : sessionStorage
  } catch {
    return sessionStorage
  }
}

function loadUser() {
  try {
    // check both storages (in case user toggled remember me)
    const fromLocal   = localStorage.getItem(STORAGE_KEY)
    const fromSession = sessionStorage.getItem(STORAGE_KEY)
    const raw = fromLocal || fromSession
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// AuthProvider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser)
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false)
  const idleTimerRef = useRef(null)
  const warningTimerRef = useRef(null)

  const isAuthenticated = !!user

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback((username, password, rememberMe = false) => {
    const match = USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (!match) return { success: false, error: 'Invalid username or password.' }

    const userData = { username: match.username, displayName: match.displayName, role: match.role }
    setUser(userData)

    // persist remember-me preference
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, 'true')
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
      sessionStorage.removeItem(STORAGE_KEY)
    } else {
      localStorage.removeItem(REMEMBER_KEY)
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(userData))
    }

    // record activity timestamp
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
    return { success: true }
  }, [])

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    setUser(null)
    setShowTimeoutWarning(false)
    localStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(LAST_ACTIVITY_KEY)
    clearTimeout(idleTimerRef.current)
    clearTimeout(warningTimerRef.current)
  }, [])

  // ── Extend session (from timeout modal) ──────────────────────────────────
  const extendSession = useCallback(() => {
    setShowTimeoutWarning(false)
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
  }, [])

  // ── Idle timeout tracking ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return

    const resetIdleTimer = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString())
      setShowTimeoutWarning(false)

      clearTimeout(idleTimerRef.current)
      clearTimeout(warningTimerRef.current)

      // after (IDLE_TIMEOUT - WARNING) ms → show warning
      idleTimerRef.current = setTimeout(() => {
        setShowTimeoutWarning(true)

        // after WARNING ms → actually log out
        warningTimerRef.current = setTimeout(() => {
          logout()
        }, IDLE_WARNING_MS)
      }, IDLE_TIMEOUT_MS - IDLE_WARNING_MS)
    }

    // track user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetIdleTimer, { passive: true }))
    resetIdleTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdleTimer))
      clearTimeout(idleTimerRef.current)
      clearTimeout(warningTimerRef.current)
    }
  }, [isAuthenticated, logout])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      showTimeoutWarning,
      extendSession,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}

export default AuthContext
