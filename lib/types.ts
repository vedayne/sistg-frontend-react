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
