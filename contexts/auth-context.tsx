"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { User } from "@/lib/types"
import { apiClient } from "@/lib/api-client"

const normalizeProfile = (profileData: any): User => ({
  ...profileData,
  imageUrl: profileData?.imageUrl ?? profileData?.fotoPerfil?.remotepath ?? null,
})

interface Session {
  id: string
  userId: string
  userAgent: string
  ip: string
  familyId: string
  expiresAt: string
  revokedAt: string | null
}

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
  logoutDevice: (sessionId: string) => Promise<void>
  uploadProfileImage: (
    file: File,
  ) => Promise<{ message: string; archivo: { id: number; remotepath: string; mimetype: string } }>
  hasValidSession: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [hasValidSession, setHasValidSession] = useState(false)

  useEffect(() => {
    const initAuth = async () => {
      try {
        let token = apiClient.getAccessToken()

        if (!token) {
          try {
            const refreshed = await apiClient.auth.refresh()
            if ((refreshed as any).access_token) {
              token = (refreshed as any).access_token
              if ( !token ) throw new Error("No se pudo refrescar la sesión")
              apiClient.setAccessToken(token)
              setHasValidSession(true)
              console.log("[v0] Token refrescado desde cookie de sesión")
            }
          } catch (refreshError) {
            console.warn("[v0] No se pudo refrescar la sesión automáticamente", refreshError)
            setHasValidSession(false)
          }
        } else {
          setHasValidSession(true)
        }

        if (token) {
          console.log("[v0] Token encontrado, obteniendo perfil...")
          const profileResponse = await apiClient.profile.get()
          const profile = (profileResponse as any).data || profileResponse
          console.log("[v0] Perfil obtenido:", profile)
          setUser(normalizeProfile(profile))
        }
      } catch (err) {
        console.error("[v0] Error loading profile:", err)
        apiClient.clearAccessToken()
        setHasValidSession(false)
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

      const normalizedProfile = normalizeProfile(profile)

      const profileStatus = normalizedProfile.status || "ACTIVE"
      console.log("[v0] Status del usuario:", profileStatus)

      const userData = {
        ...normalizedProfile,
        mustChangePassword: profileStatus === "MUST_CHANGE_PASSWORD",
      }

      setUser(userData)
      setHasValidSession(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      console.error("[v0] Login error:", message)
      setError(message)
      setHasValidSession(false)
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
      apiClient.clearAccessToken()
      setUser(null)
      setSessions([])
      setHasValidSession(false)
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

  const refreshProfile = useCallback(async () => {
    try {
      console.log("[v0] Refrescando perfil...")
      const profileResponse = await apiClient.profile.get()
      const profile = (profileResponse as any).data || profileResponse
      setUser(normalizeProfile(profile))
    } catch (err) {
      console.error("[v0] Error refreshing profile:", err)
    }
  }, [])

  const fetchSessions = useCallback(async () => {
    try {
      console.log("[v0] Obteniendo sesiones activas...")
      const response = await apiClient.auth.sessions()
      const sessionsList = Array.isArray(response) ? response : (response as any).data || []
      setSessions(sessionsList)
      console.log("[v0] Sesiones obtenidas:", sessionsList)
    } catch (err) {
      console.error("[v0] Error fetching sesiones:", err)
    }
  }, [])

  const logoutAllDevices = useCallback(async () => {
    try {
      console.log("[v0] Cerrando todas las sesiones excepto la actual...")
      await apiClient.auth.logoutAll()
      await fetchSessions()
      console.log("[v0] Todas las sesiones remotas cerradas")
    } catch (err) {
      console.error("[v0] Error logging out all devices:", err)
      throw err
    }
  }, [fetchSessions])

  const logoutDevice = useCallback(
    async (sessionId: string) => {
      try {
        console.log("[v0] Cerrando sesión individual:", sessionId)
        await apiClient.auth.logoutSession(sessionId)
        await fetchSessions()
      } catch (err) {
        console.error("[v0] Error cerrando sesión específica:", err)
        throw err
      }
    },
    [fetchSessions],
  )

  const uploadProfileImage = useCallback(
    async (file: File) => {
      try {
        const response = await apiClient.profile.uploadImage(file)
        if (user) {
          setUser({
            ...user,
            imageUrl: response.archivo.remotepath || null,
            fotoPerfil: {
              id: response.archivo.id.toString(),
              remotepath: response.archivo.remotepath,
              mimetype: response.archivo.mimetype,
            },
          })
        }
        return response
      } catch (err) {
        console.error("[v0] Error subiendo foto de perfil:", err)
        throw err
      }
    },
    [user],
  )

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        sessions,
        hasValidSession,
        login,
        logout,
        updatePassword,
        refreshProfile,
        fetchSessions,
        logoutAllDevices,
        logoutDevice,
        uploadProfileImage,
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
