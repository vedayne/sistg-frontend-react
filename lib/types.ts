export interface Role {
  id: number
  name:
    | "ADMINISTRADOR"
    | "DOCENTE_TG"
    | "TUTOR"
    | "REVISOR"
    | "ESTUDIANTE"
    | "JEFE_CARRERA"
    | "SECRETARIA"
    | "DDE"
    | "UTIC"
  description: string
}

export interface Persona {
  nombre: string
  apPaterno: string
  apMaterno: string
  nombreCompleto: string
  ci?: string
  grado?: string
  sexo?: string
  telefono?: string
  celular?: string
  emailPersonal?: string
  emailInstitucional?: string
  fuerza?: "Civil" | "Militar"
}

export interface AcademicoEstudiante {
  idSaga: number
  codAlumno: string
  idEspecialidad: string
  especialidad: string
  idUnidadAcademica: string
  unidadAcademica: string
  nivelAcad: string
  fuerza: "Civil" | "Militar"
  inscrito: number
  semestreActual: string | null
}

export interface User {
  id: string
  email: string
  status: "ACTIVE" | "INACTIVE"
  lastLoginAt: string | null
  roles: Role[]
  persona: Persona
  academico: AcademicoEstudiante
  fotoPerfil?: {
    id: string
    remotepath: string
    mimetype: string
  }
  mustChangePassword?: boolean
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface EstudianteBasicInfo {
  id: number
  idSaga: number
  codEstudiante: string
  nombreCompleto: string
  email: string
  carrera?: string
  semestre?: string | null
}

export interface DocenteBasicInfo {
  id: number
  idSaga: number
  codDocente: string
  nombreCompleto: string
  email: string
  especialidad?: string
}

export interface UserBasicInfo {
  id: string
  email: string
  status: string
  nombres?: string
  apPaterno?: string
  apMaterno?: string
  fullName?: string
  grado?: string
  roles?: string[]
  tipo?: string
  cod?: string
  especialidad?: string
  idSaga?: number
}

export interface Entrega {
  id: number
  numeroEntrega: number
  nombreEntrega: string
  estudiante: string
  fase: string
  fechaEntrega: string
  gestion: string
  especialidad: string
}

export interface Defensa {
  id: number
  numero: number
  fase: string
  proyecto: string
  estudiante: string
  notaReferencial: number
  miembroTribunal: string
  observacion: string
}

export interface UnidadAcademica {
  id: string
  nombre: string
  ubicacion: string
  telefono: string
  email: string
  web: string
}
