import { createContext, useEffect, useState, useCallback } from 'react'
import { authService } from '../services/authService'
import { saveAccount } from '../utils/savedAccounts'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    authService.getSession().then((current) => {
      if (!cancelled) {
        setSession(current)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (identifier, password) => {
    const nextSession = await authService.login(identifier, password)
    setSession(nextSession)
    saveAccount(nextSession.user)
    return nextSession
  }, [])

  const register = useCallback(async (payload) => {
    const nextSession = await authService.register(payload)
    setSession(nextSession)
    saveAccount(nextSession.user)
    return nextSession
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setSession(null)
  }, [])

  const value = {
    user: session?.user || null,
    token: session?.token || null,
    isAuthenticated: Boolean(session),
    loading,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
