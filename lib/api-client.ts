import type {
  DocenteBasicInfo,
  EstudianteBasicInfo,
  PaginatedResponse,
  UserBasicInfo,
  RoleInfo,
  Phase,
  Gestion,
  SpecialityInfo,
  ResearchLine,
  Semester,
  ProjectResponseDto,
  CreateProjectDto,
  AdmEntrega,
  EntregaDetalle,
  StudentDocumentsResponse,
  DocumentInfo,
  Pagination,
} from "./types"

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
  _retryAttempted?: boolean
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
        console.log("[v0] Intentando refrescar token automáticamente...")
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // Incluir cookies para que envíe el refresh token
        })

        if (!refreshResponse.ok) {
          console.error("[v0] Refresh fallido:", refreshResponse.status)
          apiClient.clearAccessToken()
          return null
        }

        const refreshData = await refreshResponse.json()
        const token = (refreshData as any).access_token

        if (token) {
          console.log("[v0] Token refrescado exitosamente")
          apiClient.setAccessToken(token)
          return token
        }
      } catch (err) {
        console.error("[v0] Error en refresh token:", err)
        apiClient.clearAccessToken()
      } finally {
        refreshingPromise = null
      }
      return null
    })()

    return refreshingPromise
  },

  async request<T>(endpoint: string, options: RequestOptions & { _retryAttempted?: boolean } = {}): Promise<T> {
    const { skipAuth, _isRefreshRequest, _retryAttempted, ...requestInit } = options
    const headers = new Headers(requestInit.headers)
    const isFormData = typeof FormData !== "undefined" && requestInit.body instanceof FormData

    if (!skipAuth) {
      const token = apiClient.getAccessToken()
      if (token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
    }

    if (!isFormData && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json")
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...requestInit, headers })

    if (!response.ok) {
      const shouldAttemptRefresh = !skipAuth && !_isRefreshRequest && !_retryAttempted && response.status === 401

      if (shouldAttemptRefresh) {
        console.log("[v0] Detectado error 401, intentando refresh...")
        const refreshed = await apiClient.tryRefreshAccessToken()
        if (refreshed) {
          console.log("[v0] Token refrescado, reintentando solicitud original...")
          return apiClient.request<T>(endpoint, { ...options, _retryAttempted: true })
        }
      }

      if (response.status === 401) {
        apiClient.clearAccessToken()
      }

      const errorMessage = await parseErrorMessage(response)
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

    forgotPassword: async (email: string) =>
      apiClient.request("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        skipAuth: true,
      }),

    resetPassword: async (token: string, newPassword: string) =>
      apiClient.request("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
        skipAuth: true,
      }),
  },

  profile: {
    get: async () => apiClient.request("/profile", {}),

    updatePassword: async (currentPassword: string, newPassword: string) =>
      apiClient.request("/profile/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),

    uploadImage: async (image: File) => {
      const formData = new FormData()
      formData.append("image", image)
      return apiClient.request<{ message: string; archivo: { id: number; remotepath: string; mimetype: string } }>(
        "/profile/image",
        {
          method: "POST",
          body: formData,
        },
      )
    },
  },

  students: {
    list: async (params?: {
      page?: number
      limit?: number
      search?: string
      especialidad?: string
      idSaga?: string | number
      isActive?: boolean
      sortBy?: "id" | "idSaga"
      sortOrder?: "asc" | "desc"
      fields?: string
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.search) query.append("search", params.search)
      if (params?.especialidad) query.append("especialidad", params.especialidad)
      if (params?.idSaga) query.append("idSaga", params.idSaga.toString())
      if (typeof params?.isActive === "boolean") query.append("isActive", String(params.isActive))
      if (params?.sortBy) query.append("sortBy", params.sortBy)
      if (params?.sortOrder) query.append("sortOrder", params.sortOrder)
      if (params?.fields) query.append("fields", params.fields)
      return apiClient.request<PaginatedResponse<EstudianteBasicInfo>>(`/students?${query.toString()}`, {})
    },

    get: async (id: string, params?: { fields?: string }) => {
      const query = new URLSearchParams()
      if (params?.fields) query.append("fields", params.fields)
      return apiClient.request<EstudianteBasicInfo>(`/students/${id}${query.size ? `?${query}` : ""}`, {})
    },
  },

  teachers: {
    list: async (params?: {
      page?: number
      limit?: number
      search?: string
      especialidad?: string
      idSaga?: string | number
      isActive?: boolean
      sortBy?: "id" | "idSaga"
      sortOrder?: "asc" | "desc"
      fields?: string
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.search) query.append("search", params.search)
      if (params?.especialidad) query.append("especialidad", params.especialidad)
      if (params?.idSaga) query.append("idSaga", params.idSaga.toString())
      if (typeof params?.isActive === "boolean") query.append("isActive", String(params.isActive))
      if (params?.sortBy) query.append("sortBy", params.sortBy)
      if (params?.sortOrder) query.append("sortOrder", params.sortOrder)
      if (params?.fields) query.append("fields", params.fields)
      return apiClient.request<PaginatedResponse<DocenteBasicInfo>>(`/teachers?${query.toString()}`, {})
    },

    get: async (id: string, params?: { fields?: string }) => {
      const query = new URLSearchParams()
      if (params?.fields) query.append("fields", params.fields)
      return apiClient.request<DocenteBasicInfo>(`/teachers/${id}${query.size ? `?${query}` : ""}`, {})
    },
  },

  users: {
    list: async (params?: {
      page?: number
      limit?: number
      search?: string
      status?: string
      role?: string
      sortBy?: "id" | "email" | "status" | "createdAt"
      sortOrder?: "asc" | "desc"
      fields?: string
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.search) query.append("search", params.search)
      if (params?.status) query.append("status", params.status)
      if (params?.role) query.append("role", params.role)
      if (params?.sortBy) query.append("sortBy", params.sortBy)
      if (params?.sortOrder) query.append("sortOrder", params.sortOrder)
      if (params?.fields) query.append("fields", params.fields)
      return apiClient.request<PaginatedResponse<UserBasicInfo>>(`/users?${query.toString()}`, {})
    },

    create: async (data: {
      email: string
      password: string
      nombre: string
      apPaterno: string
      apMaterno: string
      ci: string
      grado?: string
      tipo?: string
      details?: Record<string, any>
    }) =>
      apiClient.request<{ data: UserBasicInfo; message?: string }>(`/users`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    get: async (id: string) => apiClient.request<UserBasicInfo>(`/users/${id}`, {}),

    update: async (id: string, data: { status?: string; password?: string }) =>
      apiClient.request(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    assignRole: async (id: string, roleId: number) =>
      apiClient.request(`/users/${id}/roles`, {
        method: "POST",
        body: JSON.stringify({ roleId }),
      }),
  },

  projects: {
    list: async () => apiClient.request<ProjectResponseDto[]>("/projects", {}),
    get: async (id: string | number) => apiClient.request<ProjectResponseDto>(`/projects/${id}`, {}),
    getByStudent: async (studentId: string | number) =>
      apiClient.request<ProjectResponseDto[]>(`/projects/student/${studentId}`, {}),
    create: async (data: CreateProjectDto) =>
      apiClient.request<{ message: string; data: ProjectResponseDto }>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: async (id: number, data: Partial<CreateProjectDto> & { isActive?: boolean }) =>
      apiClient.request<{ message: string; data: ProjectResponseDto }>(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: async (id: number) =>
      apiClient.request<{ message: string }>(`/projects/${id}`, {
        method: "DELETE",
      }),
  },

  semesters: {
    list: async () => apiClient.request<{ data: Semester[]; total: number }>("/semestres", {}),
    get: async (id: number) => apiClient.request<Semester>(`/semestres/${id}`, {}),
    create: async (data: { code: string; name: string }) =>
      apiClient.request<{ message: string; data: Semester }>("/semestres", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: async (id: number, data: { code?: string; name?: string }) =>
      apiClient.request<{ message: string; data: Semester }>(`/semestres/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
  },

  researchLines: {
    list: async () => apiClient.request<{ data: ResearchLine[]; total: number }>("/lineas-investigacion", {}),
    getByArea: async (areaId: number) =>
      apiClient.request<{ data: ResearchLine[]; total: number }>(`/lineas-investigacion/area/${areaId}`, {}),
    create: async (data: { name: string; idAreaInvestigacion: number }) =>
      apiClient.request<{ message: string; data: ResearchLine }>("/lineas-investigacion", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: async (id: number, data: { name?: string; idAreaInvestigacion?: number }) =>
      apiClient.request<{ message: string; data: ResearchLine }>(`/lineas-investigacion/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: async (id: number) =>
      apiClient.request<{ message: string }>(`/lineas-investigacion/${id}`, {
        method: "DELETE",
      }),
  },

  modalidades: {
    list: async () => apiClient.request<{ data: any[]; total: number }>("/modalidades", {}),
    create: async (data: { name: string; description?: string }) =>
      apiClient.request<{ message: string; data: any }>("/modalidades", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: async (id: number, data: { name?: string; description?: string }) =>
      apiClient.request<{ message: string; data: any }>(`/modalidades/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: async (id: number) =>
      apiClient.request<{ message: string }>(`/modalidades/${id}`, {
        method: "DELETE",
      }),
  },

  researchAreas: {
    list: async () => apiClient.request<{ data: any[]; total: number }>("/areas-investigacion", {}),
    create: async (name: string) =>
      apiClient.request<{ message: string; data: any }>("/areas-investigacion", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    update: async (id: number, name: string) =>
      apiClient.request<{ message: string; data: any }>(`/areas-investigacion/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
    delete: async (id: number) =>
      apiClient.request<{ message: string }>(`/areas-investigacion/${id}`, {
        method: "DELETE",
      }),
  },

  roles: {
    list: async () => apiClient.request<RoleInfo[]>("/roles", {}),
    updateStatus: async (id: number, isActive: boolean) =>
      apiClient.request<{ message: string }>(`/roles/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      }),
  },

  phases: {
    list: async () => apiClient.request<Phase[]>("/phases", {}),
    get: async (id: number) => apiClient.request<Phase>(`/phases/${id}`, {}),
    create: async (name: string) =>
      apiClient.request<{ message: string; data: Phase }>("/phases", {
        method: "POST",
        body: JSON.stringify({ name }),
      }),
    update: async (id: number, name: string) =>
      apiClient.request<{ message: string; data: Phase }>(`/phases/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),
  },

  specialities: {
    list: async (params?: {
      page?: number
      limit?: number
      search?: string
      nivelAcad?: string
      sortBy?: string
      sortOrder?: "asc" | "desc"
    }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.search) query.append("search", params.search)
      if (params?.nivelAcad) query.append("nivelAcad", params.nivelAcad)
      if (params?.sortBy) query.append("sortBy", params.sortBy)
      if (params?.sortOrder) query.append("sortOrder", params.sortOrder)
      return apiClient.request<PaginatedResponse<SpecialityInfo>>(`/specialities?${query.toString()}`, {})
    },
  },

  gestiones: {
    list: async () => apiClient.request<{ data: Gestion[]; total: number }>("/gestiones", {}),
    get: async (id: number) => apiClient.request<Gestion>(`/gestiones/${id}`, {}),
    create: async (data: { gestion: string; typeGestion?: "I" | "II"; isActive?: boolean }) =>
      apiClient.request<{ message: string; data: Gestion }>("/gestiones", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: async (id: number, data: { gestion?: string; typeGestion?: "I" | "II"; isActive?: boolean }) =>
      apiClient.request<{ message: string; data: Gestion }>(`/gestiones/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: async (id: number) =>
      apiClient.request<{ message: string }>(`/gestiones/${id}`, {
        method: "DELETE",
      }),
  },

  admEntregas: {
    list: async (params?: { page?: number; limit?: number; sortBy?: string; sortOrder?: "asc" | "desc" }) => {
      const query = new URLSearchParams()
      if (params?.page) query.append("page", params.page.toString())
      if (params?.limit) query.append("limit", params.limit.toString())
      if (params?.sortBy) query.append("sortBy", params.sortBy)
      if (params?.sortOrder) query.append("sortOrder", params.sortOrder)
      const response = await apiClient.request<{ data: AdmEntrega[]; meta: { page: number; limit: number; total: number; totalPages: number } }>(
        `/adm-entregas?${query.toString()}`,
        {},
      )

      const pagination: Pagination = {
        page: response.meta.page,
        limit: response.meta.limit,
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        hasNextPage: response.meta.page < response.meta.totalPages,
        hasPreviousPage: response.meta.page > 1,
      }

      return { data: response.data, pagination }
    },
    filter: async (params: {
      idDocente?: number
      idGestion?: number
      idSemestre?: number
      idEspecialidad?: number
      isActive?: boolean
    }) => {
      const query = new URLSearchParams()
      if (params.idDocente) query.append("idDocente", params.idDocente.toString())
      if (params.idGestion) query.append("idGestion", params.idGestion.toString())
      if (params.idSemestre) query.append("idSemestre", params.idSemestre.toString())
      if (params.idEspecialidad) query.append("idEspecialidad", params.idEspecialidad.toString())
      if (typeof params.isActive === "boolean") query.append("isActive", String(params.isActive))
      return apiClient.request<{ ok: boolean; data: AdmEntrega[] }>(`/adm-entregas/filtros?${query.toString()}`, {})
    },
    get: async (id: number) => apiClient.request<{ ok: boolean; data: AdmEntrega }>(`/adm-entregas/${id}`, {}),
    create: async (data: Omit<AdmEntrega, "id" | "createdAt" | "_count" | "estudiantes"> & { estudiantes: number[] }) =>
      apiClient.request<{ ok: boolean; message: string; data: AdmEntrega }>("/adm-entregas", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: async (id: number, data: Partial<AdmEntrega>) =>
      apiClient.request<{ ok: boolean; message: string; data: AdmEntrega }>(`/adm-entregas/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    delete: async (id: number) =>
      apiClient.request<{ ok: boolean; message: string }>(`/adm-entregas/${id}`, {
        method: "DELETE",
      }),
    assignStudents: async (id: number, estudiantes: number[]) =>
      apiClient.request<{ ok: boolean; message: string }>(`/adm-entregas/${id}/estudiantes`, {
        method: "POST",
        body: JSON.stringify({ estudiantes }),
      }),
    unassignStudent: async (idAdmEntrega: number, idEstudiante: number) =>
      apiClient.request<{ ok: boolean; message: string }>(
        `/adm-entregas/${idAdmEntrega}/estudiantes/${idEstudiante}`,
        {
          method: "DELETE",
        },
      ),
  },

  entregas: {
    upload: async (data: {
      idAdmEntrega: number
      idProyecto: number
      title: string
      descripcion?: string
      archWord: File
      archPdf: File
    }) => {
      const formData = new FormData()
      formData.append("idAdmEntrega", data.idAdmEntrega.toString())
      formData.append("idProyecto", data.idProyecto.toString())
      formData.append("title", data.title)
      if (data.descripcion) formData.append("descripcion", data.descripcion)
      formData.append("archWord", data.archWord)
      formData.append("archPdf", data.archPdf)

      return apiClient.request<{ ok: boolean; message: string; data: EntregaDetalle }>("/entregas/upload", {
        method: "POST",
        body: formData,
      })
    },
    getMySubmission: async (idAdmEntrega: number) =>
      apiClient.request<{ ok: boolean; data: EntregaDetalle }>(`/entregas/mis-entregas/${idAdmEntrega}`, {}),
    getPending: async () => apiClient.request<{ ok: boolean; data: EntregaDetalle[] }>("/entregas/pendientes", {}),
    getBySchedule: async (idAdmEntrega: number) =>
      apiClient.request<{ ok: boolean; data: EntregaDetalle[] }>(`/entregas/cronograma/${idAdmEntrega}`, {}),
    review: async (idEntrega: number, archPdf: File) => {
      const formData = new FormData()
      formData.append("archPdf", archPdf)
      return apiClient.request<{ ok: boolean; message: string; data: EntregaDetalle }>(
        `/entregas/${idEntrega}/revision`,
        {
          method: "POST",
          body: formData,
        },
      )
    },
    download: async (id: number, type: "word" | "pdf") => {
      const token = apiClient.getAccessToken()
      const response = await fetch(`${API_BASE_URL}/entregas/${id}/download/${type}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Error downloading file")
      return response.blob()
    },
  },

  documents: {
    getByStudent: async (idEstudiante: number) =>
      apiClient.request<{ ok: boolean; message: string; data: StudentDocumentsResponse }>(
        `/documents/student/${idEstudiante}`,
        {},
      ),
    getByProject: async (idProyecto: number) =>
      apiClient.request<any>(`/documents/project/${idProyecto}`, {}), // Updated in next iteration if types available
    download: async (idArchivo: number) => {
      const token = apiClient.getAccessToken()
      const response = await fetch(`${API_BASE_URL}/documents/download/${idArchivo}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) throw new Error("Error downloading document")
      return response.blob()
    },
  },
}
