const API_BASE_URL = "https://sistg-backend.onrender.com/rtg"

interface ApiResponse<T> {
  data: T
  message?: string
}

interface AuthResponse {
  access_token: string
  user?: {
    id: string
    email: string
    status?: string
    roles?: any[]
  }
}

let accessToken: string | null = null
let refreshingPromise: Promise<string | null> | null = null

type RequestOptions = RequestInit & {
  skipAuth?: boolean
  /** internal flag to avoid loops when reintentando */
  _isRefreshRequest?: boolean
}

const parseErrorMessage = async (response: Response) => {
  try {
    const error = await response.json()
    return (error as any).message || (error as any).error || response.statusText
  } catch {
    try {
      const text = await response.text()
      return text || response.statusText
    } catch {
      return response.statusText
    }
  }
}

export const apiClient = {
  setAccessToken: (token: string) => {
    accessToken = token
    localStorage.setItem("access_token", token)
  },

  clearAccessToken: () => {
    accessToken = null
    localStorage.removeItem("access_token")
  },

  getAccessToken: () => accessToken || localStorage.getItem("access_token"),

  async tryRefreshAccessToken(): Promise<string | null> {
    if (refreshingPromise) return refreshingPromise

    refreshingPromise = (async () => {
      try {
        const refreshResponse = await apiClient.request<AuthResponse>("/auth/refresh", {
          method: "POST",
          skipAuth: true,
          _isRefreshRequest: true,
        })
        const token = (refreshResponse as AuthResponse).access_token
        if (token) {
          apiClient.setAccessToken(token)
          return token
        }
      } catch (err) {
        console.error("[v0] Error refreshing token:", err)
        apiClient.clearAccessToken()
      } finally {
        refreshingPromise = null
      }
      return null
    })()

    return refreshingPromise
  },

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { skipAuth, _isRefreshRequest, ...requestInit } = options
    const headers = new Headers(requestInit.headers)

    if (!skipAuth) {
      const token = apiClient.getAccessToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    }

    headers.set("Content-Type", "application/json")

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...requestInit, headers })

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(response)
      const shouldAttemptRefresh = !_isRefreshRequest && !skipAuth && response.status === 401

      if (shouldAttemptRefresh) {
        const refreshed = await apiClient.tryRefreshAccessToken()
        if (refreshed) {
          return apiClient.request<T>(endpoint, { ...options, _isRefreshRequest: false })
        }
      }

      if (response.status === 401) {
        apiClient.clearAccessToken()
      }
      throw new Error(errorMessage || `API Error: ${response.statusText}`)
    }

    return response.json()
  },

  auth: {
    login: async (email: string, password: string) => {
      console.log("[v0] Attempting login with email:", email)
      return apiClient.request<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        skipAuth: true,
      })
    },

    refresh: async () =>
      apiClient.request<{ access_token: string }>("/auth/refresh", {
        method: "POST",
        skipAuth: true,
        _isRefreshRequest: true,
      }),

    logout: async () => apiClient.request("/auth/logout", { method: "POST" }),

    sessions: async () => apiClient.request("/auth/sessions", {}),

    logoutAll: async () =>
      apiClient.request("/auth/logout-all", {
        method: "POST",
      }),

    logoutSession: async (sessionId: string) =>
      apiClient.request(`/auth/sessions/${sessionId}`, {
        method: "POST",
      }),

    me: async () => apiClient.request("/auth/me", {}),
  },

  profile: {
    get: async () => apiClient.request("/profile", {}),

    updatePassword: async (currentPassword: string, newPassword: string) =>
      apiClient.request("/profile/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  students: {
    list: async (params?: {
      page?: number
      limit?: number
      search?: string
      especialidad?: string
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.search) query.append("search", params.search)
      if (params?.especialidad) query.append("especialidad", params.especialidad)
      return apiClient.request(`/students?${query}`, {})
    },

    get: async (id: string) => apiClient.request(`/students/${id}`, {}),
  },

  teachers: {
    list: async (params?: {
      page?: number
      limit?: number
      search?: string
      especialidad?: string
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.search) query.append("search", params.search)
      if (params?.especialidad) query.append("especialidad", params.especialidad)
      return apiClient.request(`/teachers?${query}`, {})
    },

    get: async (id: string) => apiClient.request(`/teachers/${id}`, {}),
  },

  projects: {
    list: async () => apiClient.request("/projects", {}),
    get: async (id: string) => apiClient.request(`/projects/${id}`, {}),
    getByStudent: async (studentId: string) => apiClient.request(`/projects/student/${studentId}`, {}),
  },

  semesters: {
    list: async () => apiClient.request("/semestres", {}),
  },

  researchLines: {
    list: async () => apiClient.request("/lineas-investigacion", {}),
  },
}
