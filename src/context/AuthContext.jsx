import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

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

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('gl_paas_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const isAuthenticated = !!user

  const login = useCallback((username, password) => {
    const match = USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (!match) return { success: false, error: 'Invalid username or password.' }

    const userData = { username: match.username, displayName: match.displayName, role: match.role }
    setUser(userData)
    sessionStorage.setItem('gl_paas_user', JSON.stringify(userData))
    return { success: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem('gl_paas_user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
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
