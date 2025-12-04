"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

interface Session {
  id: string
  userId: string
  userAgent: string
  ip: string
  familyId: string
  expiresAt: string
  revokedAt: string | null
}
// </CHANGE>

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  sessions: Session[]
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  refreshProfile: () => Promise<void>
  fetchSessions: () => Promise<void>
  logoutAllDevices: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  // </CHANGE>

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = apiClient.getAccessToken()
        if (token) {
          console.log("[v0] Token encontrado, obteniendo perfil...")
          const profileResponse = await apiClient.profile.get()
          const profile = (profileResponse as any).data || profileResponse
          console.log("[v0] Perfil obtenido:", profile)
          setUser(profile)
        }
      } catch (err) {
        console.error("[v0] Error loading profile:", err)
        localStorage.removeItem("access_token")
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      console.log("[v0] Iniciando login para:", email)
      setError(null)
      const response = await apiClient.auth.login(email, password)
      console.log("[v0] Respuesta de login:", response)

      const authResponse = response as any
      if (!authResponse.access_token) {
        throw new Error("No access token received from server")
      }

      apiClient.setAccessToken(authResponse.access_token)
      console.log("[v0] Token almacenado, obteniendo perfil...")

      const profileResponse = await apiClient.profile.get()
      const profile = (profileResponse as any).data || profileResponse
      console.log("[v0] Perfil obtenido:", profile)

      const profileStatus = profile.status || "ACTIVE"
      console.log("[v0] Status del usuario:", profileStatus)

      const userData = {
        ...profile,
        mustChangePassword: profileStatus === "MUST_CHANGE_PASSWORD",
      }

      setUser(userData)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      console.error("[v0] Login error:", message)
      setError(message)
      throw err
    }
  }

  const logout = async () => {
    try {
      console.log("[v0] Cerrando sesión...")
      await apiClient.auth.logout()
    } catch (err) {
      console.error("[v0] Logout error:", err)
    } finally {
      localStorage.removeItem("access_token")
      setUser(null)
      setSessions([])
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setError(null)
      console.log("[v0] Actualizando contraseña...")
      await apiClient.profile.updatePassword(currentPassword, newPassword)
      if (user) {
        setUser({ ...user, mustChangePassword: false })
      }
      console.log("[v0] Contraseña actualizada exitosamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Password update failed"
      setError(message)
      throw err
    }
  }

  const refreshProfile = async () => {
    try {
      console.log("[v0] Refrescando perfil...")
      const profileResponse = await apiClient.profile.get()
      const profile = (profileResponse as any).data || profileResponse
      setUser(profile)
    } catch (err) {
      console.error("[v0] Error refreshing profile:", err)
    }
  }

  const fetchSessions = async () => {
    try {
      console.log("[v0] Obteniendo sesiones activas...")
      const response = await apiClient.auth.sessions()
      const sessionsList = Array.isArray(response) ? response : (response as any).data || []
      setSessions(sessionsList)
      console.log("[v0] Sesiones obtenidas:", sessionsList)
    } catch (err) {
      console.error("[v0] Error fetching sessions:", err)
    }
  }

  const logoutAllDevices = async () => {
    try {
      console.log("[v0] Cerrando todas las sesiones...")
      await apiClient.auth.logoutAll()
      setSessions([])
      localStorage.removeItem("access_token")
      setUser(null)
      console.log("[v0] Todas las sesiones cerradas")
    } catch (err) {
      console.error("[v0] Error logging out all devices:", err)
      throw err
    }
  }
  // </CHANGE>

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        sessions,
        login,
        logout,
        updatePassword,
        refreshProfile,
        fetchSessions,
        logoutAllDevices,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
