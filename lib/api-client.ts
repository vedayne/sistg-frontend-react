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

export const apiClient = {
  setAccessToken: (token: string) => {
    accessToken = token
    localStorage.setItem("access_token", token)
  },

  getAccessToken: () => accessToken || localStorage.getItem("access_token"),

  async request<T>(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
    const { skipAuth, ...requestInit } = options
    const headers = new Headers(requestInit.headers)

    if (!skipAuth) {
      const token = apiClient.getAccessToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    }

    headers.set("Content-Type", "application/json")

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...requestInit,
      headers,
    })

    if (!response.ok) {
      let errorMessage = `API Error: ${response.statusText}`
      try {
        const error = await response.json()
        console.log("[v0] API Error Response:", { status: response.status, error })
        errorMessage = error.message || error.error || errorMessage
      } catch {
        const text = await response.text()
        console.log("[v0] API Error Text:", { status: response.status, text })
        errorMessage = text || errorMessage
      }

      if (response.status === 401) {
        localStorage.removeItem("access_token")
        accessToken = null
      }
      throw new Error(errorMessage)
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
      }),

    logout: async () => apiClient.request("/auth/logout", { method: "POST" }),

    sessions: async () => apiClient.request("/auth/sessions", {}),

    logoutAll: async () =>
      apiClient.request("/auth/logout-all", {
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
