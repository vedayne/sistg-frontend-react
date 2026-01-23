export interface Role {
  id: number
  name:
  | "ADMIN"
  | "UTIC"
  | "DOCENTETG"
  | "ESTUDIANTE"
  | "TUTOR"
  | "REVISOR"
  | "REVISOR1"
  | "REVISOR2"
  | "JEFECARRERA"
  | "DDE"
  | "SECRETARIA"
  | "INVITADO"
  // Legacy/Fallback just in case, but user seems strict
  | "ADMINISTRADOR"
  | "DOCENTE_TG"
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
  codAlumno?: string
  codDocente?: string
  idEspecialidad: string
  especialidad: string
  idUnidadAcademica: string
  unidadAcademica: string
  nivelAcad: string
  fuerza?: "Civil" | "Militar"
  inscrito?: number
  semestreActual?: string | { id: number; name: string; code: string } | null
  gestionActual?: "I" | "II" | null
  profesion?: string
  grado?: string
}

export interface User {
  id: string
  email: string
  status: "ACTIVE" | "INACTIVE"
  lastLoginAt: string | null
  roles: Role[]
  persona?: Persona
  academico?: AcademicoEstudiante
  docenteId?: number | null
  docente?: {
    id: number
    idSaga?: number
  }
  imageUrl?: string | null
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
  ci?: string
}

export interface DocenteBasicInfo {
  id: number
  idSaga: number
  codDocente: string
  nombreCompleto: string
  email: string
  especialidad?: string
  usuario?: {
    email: string
    usuarioDetalles?: {
      nombre: string
      apPaterno: string
      apMaterno: string
    }
  }
}

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED" | "MUST_CHANGE_PASSWORD"

export interface UserBasicInfo {
  id: string
  email: string
  status: UserStatus
  imageUrl?: string | null
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
  emailPersonal?: string
}

export interface UserFilters {
  page: number
  limit: number
  search?: string
  sortBy?: "id" | "email" | "status" | "createdAt"
  sortOrder?: "asc" | "desc"
  fields?: string
  // Note: status and role filters are not in official API docs
  // but implemented in case backend supports them
  status?: UserStatus | string
  role?: string
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
  idFase: number
  fase: string
  proyecto: {
    id: number
    titulo: string
  }
  estudiante: {
    id: number
    nombreCompleto: string
  }
  notaReferencial?: string | null
  observaciones?: string | null
  tribunal?: string | null
  createdAt: string
}

export interface UnidadAcademica {
  id: string
  nombre: string
  ubicacion: string
  telefono: string
  email: string
  web: string
}

export interface RoleInfo {
  id: number
  name: string
  description: string
  isActive: boolean
  usersCount?: number
}

export interface Phase {
  id: number
  name: string
  projectsCount: number
  defensesCount: number
}

export interface TypeDoc {
  id: number
  name: string
  description?: string | null
  createdAt?: string
}

export interface Gestion {
  id: number
  gestion: string
  typeGestion: "I" | "II"
  isActive: boolean
  createdAt: string
  updatedAt: string
  projectsCount?: number
}

export interface SpecialityInfo {
  idEspecialidad: number
  especialidad: string
  idNivelAcad: number
  nivelAcad: string
}

export interface ResearchLine {
  id: number
  name: string
  idAreaInvestigacion: number
  areaInvestigacion?: {
    id: number
    name: string
  }
}

export interface Semester {
  id: number
  code: string
  name: string
  createdAt: string
  updatedAt: string
}

export interface ProjectResponseDto {
  id: number
  titulo: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  estudiante: EstudianteBasicInfo
  docenteTG?: DocenteBasicInfo
  docenteTutor?: DocenteBasicInfo
  docenteRev1?: DocenteBasicInfo
  docenteRev2?: DocenteBasicInfo
  gestion?: { id: number; gestion: string }
  lineaInvestigacion?: { id: number; name: string }
  modalidad?: { id: number; name: string; description?: string }
  userJefeC?: {
    id: string
    email: string
    nombreCompleto?: string
    grado?: string
  }
}

export interface CreateProjectDto {
  idEstudiante: number
  titulo: string
  idDocTG: number
  idDocTutor: number
  idDocRev1: number
  idDocRev2?: number
  idUserJefeC?: string
  idGestion: number
  idLineaInv: number
  idModalidad: number
}

export interface AdmEntrega {
  id: number
  title: string
  descripcion: string | null
  idDocente: number
  docente?: DocenteBasicInfo
  idGestion: number
  gestion?: Gestion
  idEspecialidad: number
  especialidad?: string
  idSemestre: number
  semestre?: Semester
  startAt: string
  endAt: string
  isActive: boolean
  createdAt: string
  estudiantes?: {
    id: number
    idEstudiante: number
    estudiante?: EstudianteBasicInfo
  }[]
  entregas?: EntregaDetalle[]
  _count?: {
    entregas: number
    estudiantes?: number
  }
}

export interface SubmissionFile {
  id: number
  originalName: string
  remotepath: string
  mimetype: string
  size: number
  createdAt: string
}

export interface EntregaDetalle {
  id: number
  idAdmEntrega: number
  idEstudiante: number
  idProyecto: number
  idDocTG?: number
  idDocTutor?: number
  idDocRev1?: number
  idDocRev2?: number
  title: string
  descripcion: string | null
  entregaEstAt: string
  archWordId: number
  archWord?: SubmissionFile
  archPdfId: number
  archPdf?: SubmissionFile
  archEstWordId?: number | null
  archEstPdfId?: number | null
  archEstWord?: SubmissionFile
  archEstPdf?: SubmissionFile

  // DocTG
  estadoDocTG: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  estadoRevDocTG?: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  descargaDocTGAt: string | null
  revDocTGAt: string | null
  archRevDocTGId: number | null
  archRevDocTG?: SubmissionFile

  // DocTutor
  estadoDocTutor: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  estadoRevDocTutor?: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  descargaDocTutorAt: string | null
  revDocTutorAt: string | null
  archRevDocTutorId: number | null
  archRevDocTutor?: SubmissionFile

  // DocRev1
  estadoDocRev1: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  estadoRevDocRev1?: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  descargaDocRev1At: string | null
  revDocRev1At: string | null
  archRevDocRev1Id: number | null
  archRevDocRev1?: SubmissionFile

  // DocRev2
  estadoDocRev2: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  estadoRevDocRev2?: "PENDIENTE" | "EN_REVISION" | "REVISADO"
  descargaDocRev2At: string | null
  revDocRev2At: string | null
  archRevDocRev2Id: number | null
  archRevDocRev2?: SubmissionFile

  estudiante?: EstudianteBasicInfo
  estudianteInfo?: EstudianteBasicInfo
  proyecto?: ProjectResponseDto
  admEntrega?: AdmEntrega
}

export interface DocumentInfo {
  id: number
  originalName: string
  remotepath: string
  mimetype: string
  size: number
  createdAt: string
  tipoDocumento: string
  tipoDocumentoId: number
  origen: "CARGADO" | "GENERADO"
}

export interface DocumentTypeGroup {
  tipoDocumentoId: number
  tipoDocumento: string
  descripcion: string
  cantidad: number
  archivos: DocumentInfo[]
}

export interface ResearchArea {
  id: number
  name: string
}

export interface MemberType {
  id: number
  name: string
  description: string
  editable?: boolean // Optional, based on original mock data
}

export interface DocumentType {
  id: number
  name: string
  description?: string
  slug?: string
}

export interface StudentDocumentsResponse {
  idEstudiante: string
  nombreCompleto: string
  idProyecto: number
  tituloProyecto: string
  totalDocumentos: number
  documentosPorTipo: DocumentTypeGroup[]
}

export interface DocumentTypeSummary {
  tipoDocumentoId: number
  tipoDocumento: string
  descripcion?: string
  cantidadArchivos: number
}

export interface DocumentTypeSummaryResponse {
  totalTipos: number
  totalArchivos: number
  tipos: DocumentTypeSummary[]
}

export interface DocumentFileRecord {
  id: number
  originalName: string
  remotepath: string
  mimetype: string
  size: number
  createdAt: string
  usuario?: {
    id: string
    nombreCompleto: string
  }
  downloadUrl: string
}

export interface FilesByTypeResponse {
  tipoDocumento: {
    id: number
    nombre: string
    descripcion?: string
  }
  totalArchivos: number
  archivos: DocumentFileRecord[]
}
