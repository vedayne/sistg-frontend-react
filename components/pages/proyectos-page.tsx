"use client"

import { useEffect, useState, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, Trash2, Eye, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type { ProjectResponseDto, CreateProjectDto, ResearchLine, Gestion, EstudianteBasicInfo, DocenteBasicInfo, UserBasicInfo, Phase } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

const buildControlDetalles = () =>
  Array.from({ length: 12 }, () => ({
    detalle: "",
    presentaObservacion: false,
    observacionSubsanada: false,
    conforme: false,
  }))

const buildControlCumple = () =>
  Array.from({ length: 4 }, () => ({
    cumple: false,
    noCumple: false,
  }))

const controlCumpleLabels = [
  "Cumplimiento de formato (Numeracion, Tipo de letra, Parrafo, Etc.)",
  "Redaccion, gramatica y ortografia del trabajo",
  "Relacion Titulo - Problematica - Objetivos",
  "Profundidad y Pertinencia del Trabajo",
]

export default function ProyectosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [proyectos, setProyectos] = useState<ProjectResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailSaving, setDetailSaving] = useState(false)
  const [detailProject, setDetailProject] = useState<ProjectResponseDto | null>(null)
  const [detailActive, setDetailActive] = useState<boolean>(true)
  const [detailNotaFecha, setDetailNotaFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [detailNotaFechaDefensa, setDetailNotaFechaDefensa] = useState(() => new Date().toISOString().slice(0, 10))
  const [detailNotaHoraDefensa, setDetailNotaHoraDefensa] = useState("12:00")
  const [detailNotaCite, setDetailNotaCite] = useState("")
  const [detailForm, setDetailForm] = useState({
    titulo: "",
    idLineaInv: 0,
    idGestion: 0,
    idModalidad: 0,
  })
  const [detailAssignTarget, setDetailAssignTarget] = useState<"tg" | "tutor" | "rev1" | "rev2">("tg")
  const [detailTeacherSearchTerm, setDetailTeacherSearchTerm] = useState("")
  const [detailTeacherResults, setDetailTeacherResults] = useState<DocenteBasicInfo[]>([])
  const [detailTeacherSearchLoading, setDetailTeacherSearchLoading] = useState(false)
  const [detailSelectedTeachers, setDetailSelectedTeachers] = useState<{
    tg: DocenteBasicInfo | null
    tutor: DocenteBasicInfo | null
    rev1: DocenteBasicInfo | null
    rev2: DocenteBasicInfo | null
  }>({ tg: null, tutor: null, rev1: null, rev2: null })
  const [detailJefeSearchTerm, setDetailJefeSearchTerm] = useState("")
  const [detailJefeResults, setDetailJefeResults] = useState<UserBasicInfo[]>([])
  const [detailJefeLoading, setDetailJefeLoading] = useState(false)
  const [detailSelectedJefe, setDetailSelectedJefe] = useState<UserBasicInfo | null>(null)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [showNotaEmpastadoModal, setShowNotaEmpastadoModal] = useState(false)
  const [notaEmpastadoCite, setNotaEmpastadoCite] = useState("")
  const [notaEmpastadoCiudad, setNotaEmpastadoCiudad] = useState("LA PAZ")
  const [notaEmpastadoFecha, setNotaEmpastadoFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [notaEmpastadoFechaPresentacion, setNotaEmpastadoFechaPresentacion] = useState(() => new Date().toISOString().slice(0, 10))
  const [showCartaPerfilModal, setShowCartaPerfilModal] = useState(false)
  const [cartaPerfilCite, setCartaPerfilCite] = useState("")
  const [cartaPerfilCiudad, setCartaPerfilCiudad] = useState("LA PAZ")
  const [cartaPerfilFecha, setCartaPerfilFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [cartaPerfilFase, setCartaPerfilFase] = useState("")
  const [cartaPerfilAnexos, setCartaPerfilAnexos] = useState("")
  const [showInformeRevisionModal, setShowInformeRevisionModal] = useState(false)
  const [informeRevisionCiudad, setInformeRevisionCiudad] = useState("LA PAZ")
  const [informeRevisionFecha, setInformeRevisionFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [informeRevisionFase, setInformeRevisionFase] = useState("")
  const [showControlModal, setShowControlModal] = useState(false)
  const [controlFase, setControlFase] = useState("")
  const [controlRevisionPor, setControlRevisionPor] = useState("")
  const [controlFechaDevolucion, setControlFechaDevolucion] = useState(() => new Date().toISOString().slice(0, 10))
  const [controlDetalles, setControlDetalles] = useState(buildControlDetalles)
  const [controlCumple, setControlCumple] = useState(buildControlCumple)
  const [controlObservaciones, setControlObservaciones] = useState("")
  const [phases, setPhases] = useState<Phase[]>([])
  const [phasesLoading, setPhasesLoading] = useState(false)
  const [faseSelected, setFaseSelected] = useState("")

  // Report Modals State
  const [showInvitacionModal, setShowInvitacionModal] = useState(false)
  const [invCite, setInvCite] = useState("")
  const [invFecha, setInvFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [invDestNombre, setInvDestNombre] = useState("")
  const [invDestCargo, setInvDestCargo] = useState("DOCENTE DE LA EMI")
  const [showAceptacionModal, setShowAceptacionModal] = useState(false)
  const [aceCite, setAceCite] = useState("")
  const [aceFecha, setAceFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [invGenerating, setInvGenerating] = useState(false)
  const [aceGenerating, setAceGenerating] = useState(false)

  const [showActaModal, setShowActaModal] = useState(false)
  const [actaCite, setActaCite] = useState("")
  const [actaFecha, setActaFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [actaHora, setActaHora] = useState("10:00")
  const [showMemoModal, setShowMemoModal] = useState(false)
  const [memoCite, setMemoCite] = useState("")
  const [memoCiudad, setMemoCiudad] = useState("LA PAZ")
  const [memoFecha, setMemoFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [memoFechaDefensa, setMemoFechaDefensa] = useState(() => new Date().toISOString().slice(0, 10))
  const [memoHoraDefensa, setMemoHoraDefensa] = useState("12:00")
  const [showMemoAsignacionModal, setShowMemoAsignacionModal] = useState(false)
  const [memoAsignacionCite, setMemoAsignacionCite] = useState("")
  const [memoAsignacionCiudad, setMemoAsignacionCiudad] = useState("LA PAZ")
  const [memoAsignacionFecha, setMemoAsignacionFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [notaGenerating, setNotaGenerating] = useState(false)
  const [notaEmpastadoGenerating, setNotaEmpastadoGenerating] = useState(false)
  const [cartaPerfilGenerating, setCartaPerfilGenerating] = useState(false)
  const [informeRevisionGenerating, setInformeRevisionGenerating] = useState(false)
  const [controlGenerating, setControlGenerating] = useState(false)
  const [actaGenerating, setActaGenerating] = useState(false)
  const [memoGenerating, setMemoGenerating] = useState(false)
  const [memoAsignacionGenerating, setMemoAsignacionGenerating] = useState(false)
  const [avalGenerating, setAvalGenerating] = useState(false)
  const [notaError, setNotaError] = useState("")
  const [notaEmpastadoError, setNotaEmpastadoError] = useState("")
  const [cartaPerfilError, setCartaPerfilError] = useState("")
  const [informeRevisionError, setInformeRevisionError] = useState("")
  const [controlError, setControlError] = useState("")
  const [invError, setInvError] = useState("")
  const [aceError, setAceError] = useState("")
  const [actaError, setActaError] = useState("")
  const [memoError, setMemoError] = useState("")
  const [memoAsignacionError, setMemoAsignacionError] = useState("")
  const [avalError, setAvalError] = useState("")
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const [showAvalModal, setShowAvalModal] = useState(false)
  const [avalFecha, setAvalFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [avalFase, setAvalFase] = useState("")
  const [avalFirmante, setAvalFirmante] = useState<"tg" | "tutor" | "rev1" | "rev2">("tg")

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<EstudianteBasicInfo | null>(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentSearchResults, setStudentSearchResults] = useState<EstudianteBasicInfo[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [studentSelfLoading, setStudentSelfLoading] = useState(false)

  // Dropdown Data
  const [researchLines, setResearchLines] = useState<ResearchLine[]>([])
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [teacherResults, setTeacherResults] = useState<DocenteBasicInfo[]>([])
  const [teacherSearchTerm, setTeacherSearchTerm] = useState("")
  const [teacherSearchLoading, setTeacherSearchLoading] = useState(false)
  const [assignTarget, setAssignTarget] = useState<"tg" | "tutor" | "rev1" | "rev2">("tg")
  const [selectedTeachers, setSelectedTeachers] = useState<{
    tg: DocenteBasicInfo | null
    tutor: DocenteBasicInfo | null
    rev1: DocenteBasicInfo | null
    rev2: DocenteBasicInfo | null
  }>({ tg: null, tutor: null, rev1: null, rev2: null })
  const [modalidades, setModalidades] = useState<{ id: number; name: string }[]>([])
  const [jefeSearchTerm, setJefeSearchTerm] = useState("")
  const [jefeResults, setJefeResults] = useState<UserBasicInfo[]>([])
  const [jefeLoading, setJefeLoading] = useState(false)
  const [selectedJefe, setSelectedJefe] = useState<UserBasicInfo | null>(null)
  const [formData, setFormData] = useState<Partial<CreateProjectDto> & { idEstudiante?: number }>({
    titulo: "",
    idLineaInv: 0,
    idGestion: 0,
    idDocTG: 0,
    idDocTutor: 0,
    idDocRev1: 0,
    idDocRev2: 0,
    idModalidad: 1, // Default to 1 for now if we don't have modalities API
    idUserJefeC: undefined,
    idEstudiante: undefined,
  })

  const triggerDownload = (url: string, filename: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const openPreview = async (archivoId: number, filename?: string, autoDownload = false) => {
    const blob = await apiClient.documents.download(archivoId)
    const url = URL.createObjectURL(blob)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    const resolvedName = filename || `reporte-${archivoId}.pdf`
    setPreviewUrl(url)
    setPreviewName(resolvedName)
    setShowPreview(true)
    if (autoDownload) triggerDownload(url, resolvedName)
  }

  const handlePreviewOpenChange = (open: boolean) => {
    setShowPreview(open)
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPreviewName("")
    }
  }

  const handleDownloadPreview = () => {
    if (!previewUrl) return
    const a = document.createElement("a")
    a.href = previewUrl
    a.download = previewName || "reporte.pdf"
    a.click()
  }

  // Form State

  // Role Checks
  const isAdmin = user?.roles?.some(r => r.name === "ADMINISTRADOR")
  const isStudent = user?.roles?.some(r => r.name === "ESTUDIANTE")
  const canCreate = isStudent || isAdmin || user?.roles?.some(r => ["DOCENTE_TG", "JEFE_CARRERA", "SECRETARIA"].includes(r.name))

  // Fetch Data
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      let data: ProjectResponseDto[] = []

      if (isStudent) {
        // If student, try to find "my" projects via some ID lookup or endpoint
        // For now, if we don't have the student ID in 'user', we might fail or list all if the API filters by token?
        // Let's try list() first -> usually this endpoints returns ALL for admins, but maybe filtered for others?

        if (user?.academico?.idSaga || user?.id) {
          // Ideally we call /students/me or similar. 
          // Let's try listing all for now as a fallback if specific ID is missing, or rely on backend token filtering.
          const response = await apiClient.projects.list()
          data = Array.isArray(response) ? response : (response as any).data || []
        } else {
          const response = await apiClient.projects.list()
          data = Array.isArray(response) ? response : (response as any).data || []
        }
      } else {
        // Admin / Others
        const response = await apiClient.projects.list()
        // Handle if response is array or paginated object
        data = Array.isArray(response) ? response : (response as any).data || []
      }

      setProyectos(data)
    } catch (err) {
      console.error("Error loading projects:", err)
    } finally {
      setLoading(false)
    }
  }, [isStudent, user])

  const openDetail = async (projectId: number) => {
    try {
      setDetailLoading(true)
      setDetailOpen(true)
      const res = await apiClient.projects.get(projectId)
      const proj = (res as any).data || res
      setDetailProject(proj)
      setDetailActive(!!proj?.isActive)
      setDetailForm({
        titulo: proj?.titulo || "",
        idLineaInv: proj?.lineaInvestigacion?.id || 0,
        idGestion: proj?.gestion?.id || 0,
        idModalidad: proj?.modalidad?.id || 0,
      })
      setDetailSelectedTeachers({
        tg: proj?.docenteTG || null,
        tutor: proj?.docenteTutor || null,
        rev1: proj?.docenteRev1 || null,
        rev2: proj?.docenteRev2 || null,
      })
      setDetailAssignTarget("tg")
      setDetailTeacherSearchTerm("")
      setDetailTeacherResults([])
      setDetailSelectedJefe(
        proj?.userJefeC
          ? {
            id: proj.userJefeC.id,
            email: proj.userJefeC.email,
            fullName: proj.userJefeC.nombreCompleto,
            status: "ACTIVE",
          }
          : null,
      )
      setDetailJefeSearchTerm("")
      setDetailJefeResults([])
      const today = new Date().toISOString().slice(0, 10)
      setDetailNotaFecha(today)
      setDetailNotaFechaDefensa(today)
      setDetailNotaHoraDefensa("12:00")
      setDetailNotaCite(`CITE-${proj?.id ?? projectId}-${new Date().getFullYear()}`)
      setFaseSelected(phases[0]?.name || "")
      setShowNotaModal(false)
    } catch (err: any) {
      console.error(err)
      toast({ variant: "destructive", title: "No se pudo cargar el proyecto", description: err?.message })
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleUpdateDetail = async () => {
    if (!detailProject) return
    try {
      if (!detailForm.titulo || detailForm.titulo.trim().length < 10) {
        toast({ variant: "destructive", title: "El título debe tener al menos 10 caracteres" })
        return
      }

      if (!detailForm.idLineaInv || !detailForm.idGestion || !detailForm.idModalidad) {
        toast({ variant: "destructive", title: "Línea, gestión y modalidad son obligatorias" })
        return
      }

      if (!detailSelectedTeachers.tg || !detailSelectedTeachers.tutor || !detailSelectedTeachers.rev1) {
        toast({ variant: "destructive", title: "Asigna Docente TG, Tutor y Revisor 1" })
        return
      }

      setDetailSaving(true)
      const payload = {
        titulo: detailForm.titulo.trim(),
        idLineaInv: Number(detailForm.idLineaInv),
        idGestion: Number(detailForm.idGestion),
        idModalidad: Number(detailForm.idModalidad),
        idDocTG: detailSelectedTeachers.tg.id,
        idDocTutor: detailSelectedTeachers.tutor.id,
        idDocRev1: detailSelectedTeachers.rev1.id,
        ...(detailSelectedTeachers.rev2 ? { idDocRev2: detailSelectedTeachers.rev2.id } : {}),
        ...(detailSelectedJefe ? { idUserJefeC: String(detailSelectedJefe.id) } : {}),
        isActive: detailActive,
      }
      const resp = await apiClient.projects.update(detailProject.id, payload)
      const updated = (resp as any).data || resp
      setDetailProject(updated)
      toast({ title: "Proyecto actualizado" })
      setDetailOpen(false)
      fetchData()
    } catch (err: any) {
      console.error(err)
      toast({ variant: "destructive", title: "No se pudo actualizar", description: err?.message })
    } finally {
      setDetailSaving(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Load dropdown data when opening modal
  useEffect(() => {
    if (showCreateModal || detailOpen) {
      const loadOptions = async () => {
        try {
          const [linesRes, gestionesRes, modRes] = await Promise.all([
            apiClient.researchLines.list(),
            apiClient.gestiones.list(),
            apiClient.modalidades.list(),
          ])

          setResearchLines(Array.isArray(linesRes) ? linesRes : (linesRes as any).data || [])

          // Gestiones: handle array/pagination
          const gestionesData = Array.isArray(gestionesRes) ? gestionesRes : (gestionesRes as any).data || []
          setGestiones(gestionesData.filter((g: any) => g.isActive)) // Only active gestiones

          const modData = Array.isArray(modRes) ? modRes : (modRes as any).data || []
          setModalidades(modData)
        } catch (e) {
          console.error("Error loading options", e)
        }
      }
      loadOptions()
    }
  }, [showCreateModal, detailOpen])

  useEffect(() => {
    if (showCreateModal) {
      if (isStudent && user?.academico?.idSaga) {
        const loadSelfStudent = async () => {
          try {
            setStudentSelfLoading(true)
            const res = await apiClient.students.list({
              idSaga: user.academico.idSaga,
              limit: 1,
              fields: "id,nombreCompleto,email,idSaga",
            })
            const data = (res as any).data || res || []
            const self = Array.isArray(data) ? data[0] : data
            if (self?.id) {
              setSelectedStudent({ ...self, id: Number(self.id) })
              setFormData((prev) => ({ ...prev, idEstudiante: Number(self.id) }))
            } else {
              toast({ variant: "destructive", title: "No se encontró tu registro de estudiante" })
            }
          } catch (err) {
            console.error(err)
            toast({ variant: "destructive", title: "No se pudo cargar tu registro de estudiante" })
          } finally {
            setStudentSelfLoading(false)
          }
        }
        loadSelfStudent()
      }
    }
  }, [showCreateModal, isStudent, user?.academico?.idSaga])

  useEffect(() => {
    if (
      (showNotaModal ||
        showActaModal ||
        showAvalModal ||
        showCartaPerfilModal ||
        showInformeRevisionModal ||
        showControlModal) &&
      phases.length === 0
    ) {
      const loadPhases = async () => {
        try {
          setPhasesLoading(true)
          const res = await apiClient.phases.list()
          setPhases(res as any)
          setFaseSelected((res as any)[0]?.name || "")
          setAvalFase((res as any)[0]?.name || "")
          setCartaPerfilFase((res as any)[0]?.name || "")
          setInformeRevisionFase((res as any)[0]?.name || "")
          setControlFase((res as any)[0]?.name || "")
        } catch (err) {
          console.error(err)
        } finally {
          setPhasesLoading(false)
        }
      }
      loadPhases()
    }
  }, [
    showNotaModal,
    showActaModal,
    showAvalModal,
    showCartaPerfilModal,
    showInformeRevisionModal,
    showControlModal,
    phases.length,
  ])

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este proyecto?")) return
    try {
      await apiClient.projects.delete(id)
      setProyectos(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      alert("Error al eliminar proyecto")
    }
  }

  const handleSearchStudent = async (term: string) => {
    setStudentSearchTerm(term)
    if (term.length < 2) {
      setStudentSearchResults([])
      return
    }
    setSearchLoading(true)
    try {
      const res = await apiClient.students.list({
        search: term,
        limit: 8,
        fields: "id,nombreCompleto,email,idSaga",
      })
      const data = (res as any).data || res || []
      const mapped = (Array.isArray(data) ? data : [data]).map((s: any) => ({ ...s, id: Number(s.id) }))
      setStudentSearchResults(mapped)
    } catch (err) {
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearchTeacher = async (term: string) => {
    setTeacherSearchTerm(term)
    if (term.length < 3) {
      setTeacherResults([])
      return
    }
    setTeacherSearchLoading(true)
    try {
      const res = await apiClient.teachers.list({ search: term, limit: 5 })
      setTeacherResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setTeacherSearchLoading(false)
    }
  }

  const handleSearchTeacherDetail = async (term: string) => {
    setDetailTeacherSearchTerm(term)
    if (term.length < 3) {
      setDetailTeacherResults([])
      return
    }
    setDetailTeacherSearchLoading(true)
    try {
      const res = await apiClient.teachers.list({ search: term, limit: 5 })
      setDetailTeacherResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailTeacherSearchLoading(false)
    }
  }

  const handleSearchJefe = async (term: string) => {
    setJefeSearchTerm(term)
    if (term.length < 2) {
      setJefeResults([])
      return
    }
    setJefeLoading(true)
    try {
      const res = await apiClient.users.list({ search: term, limit: 8, fields: "id,email,fullName,roles" })
      const list = ((res as any).data || res || []) as UserBasicInfo[]
      const filtered = list.filter((u) => u.roles?.some((r) => ["JEFECARRERA", "JEFE_CARRERA"].includes(r)))
      setJefeResults(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setJefeLoading(false)
    }
  }

  const handleSearchJefeDetail = async (term: string) => {
    setDetailJefeSearchTerm(term)
    if (term.length < 2) {
      setDetailJefeResults([])
      return
    }
    setDetailJefeLoading(true)
    try {
      const res = await apiClient.users.list({ search: term, limit: 8, fields: "id,email,fullName,roles" })
      const list = ((res as any).data || res || []) as UserBasicInfo[]
      const filtered = list.filter((u) => u.roles?.some((r) => ["JEFECARRERA", "JEFE_CARRERA"].includes(r)))
      setDetailJefeResults(filtered)
    } catch (err) {
      console.error(err)
    } finally {
      setDetailJefeLoading(false)
    }
  }

  const handleCreateRequest = async () => {
    // Validate
    if (!formData.titulo || !formData.idLineaInv || !formData.idGestion) {
      toast({ variant: "destructive", title: "Faltan campos obligatorios" })
      return
    }

    if (!formData.idDocTG || !formData.idDocTutor || !formData.idDocRev1) {
      toast({ variant: "destructive", title: "Asigna Docente TG, Tutor y Revisor 1" })
      return
    }

    if (!formData.idDocTG || !formData.idDocTutor) {
      alert("Selecciona Docente TG y Tutor")
      return
    }

    const jefeId = selectedJefe?.id

    // Determine Student ID (must be ID interno de Estudiantes)
    const studentIdNumber = Number(selectedStudent?.id || formData.idEstudiante)
    if (!studentIdNumber || Number.isNaN(studentIdNumber)) {
      toast({ variant: "destructive", title: "Debes seleccionar un estudiante válido" })
      return
    }

    setCreateLoading(true)
    try {
      await apiClient.projects.create({
        titulo: formData.titulo!,
        idEstudiante: studentIdNumber,
        idLineaInv: Number(formData.idLineaInv),
        idGestion: Number(formData.idGestion),
        idModalidad: Number(formData.idModalidad) || 1,
        idDocTG: Number(formData.idDocTG),
        idDocTutor: Number(formData.idDocTutor),
        idDocRev1: Number(formData.idDocRev1),
        idDocRev2: Number(formData.idDocRev2) || undefined,
        ...(jefeId ? { idUserJefeC: String(jefeId) } : {}),
      })
      setShowCreateModal(false)
      fetchData()
      setFormData({
        titulo: "",
        idLineaInv: 0,
        idGestion: 0,
        idDocTG: 0,
        idDocTutor: 0,
        idDocRev1: 0,
        idDocRev2: 0,
        idModalidad: 1,
        idUserJefeC: undefined,
        idEstudiante: undefined,
      })
      setSelectedStudent(null)
      setSelectedTeachers({ tg: null, tutor: null, rev1: null, rev2: null })
      setSelectedJefe(null)
      toast({ title: "Proyecto creado" })
    } catch (err: any) {
      console.error(err)
      const message = err instanceof Error ? err.message : err?.message || "Error al crear proyecto"
      toast({ variant: "destructive", title: "No se pudo crear", description: message })
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Proyectos de Grado</h1>
          <p className="text-muted-foreground">Listado y gestión de proyectos activos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading} className="gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Actualizar
          </Button>
          {canCreate && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Nuevo Proyecto
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="md:col-span-2">
          <Input
            placeholder="Buscar por título o estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left">
                    <th className="p-3 font-semibold">Proyecto</th>
                    <th className="p-3 font-semibold">Estudiante</th>
                    <th className="p-3 font-semibold">Investigación</th>
                    <th className="p-3 font-semibold">Gestión</th>
                    <th className="p-3 font-semibold">Estado</th>
                    <th className="p-3 font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proyectos.length > 0 ? (
                    proyectos
                      .filter((p) => {
                        if (!searchTerm) return true
                        const term = searchTerm.toLowerCase()
                        const title = p.titulo?.toLowerCase() || ""
                        const student = p.estudiante?.nombreCompleto?.toLowerCase() || ""
                        return title.includes(term) || student.includes(term)
                      })
                      .map((p) => (
                        <tr key={p.id} className="border-b hover:bg-muted/50">
                          <td className="p-3 font-medium">{p.titulo}</td>
                          <td className="p-3">{p.estudiante?.nombreCompleto || "-"}</td>
                          <td className="p-3">
                            <div className="flex flex-col text-xs">
                              <span>{p.lineaInvestigacion?.name || "-"}</span>
                            </div>
                          </td>
                          <td className="p-3"><Badge variant="outline">{p.gestion?.gestion}</Badge></td>
                          <td className="p-3">
                            {p.isActive ? <Badge className="bg-green-100 text-green-800">Activo</Badge> : <Badge variant="secondary">Inactivo</Badge>}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" title="Ver Detalles" onClick={() => openDetail(p.id)}>
                                <Eye className="w-4 h-4 text-primary" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} title="Eliminar">
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No se encontraron proyectos.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="!max-w-[58vw] !w-[58vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Proyecto</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
            </div>
          ) : detailProject ? (
            <div className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
                <div className="grid gap-2">
                  <Label>Título del proyecto</Label>
                  <Textarea
                    value={detailForm.titulo}
                    onChange={(e) => setDetailForm((prev) => ({ ...prev, titulo: e.target.value }))}
                    className="min-h-[120px] text-base"
                  />
                  <p className="text-xs text-muted-foreground">Mínimo 10 caracteres.</p>
                </div>
                <div className="grid gap-3">
                  <div className="rounded-lg border p-3 bg-muted/20">
                    <p className="text-xs text-muted-foreground">Estudiante</p>
                    <p className="font-medium">{detailProject.estudiante?.nombreCompleto || "-"}</p>
                    <p className="text-xs text-muted-foreground break-all">{detailProject.estudiante?.email || ""}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Estado</Label>
                    <Badge className={detailActive ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}>
                      {detailActive ? "Activo" : "Inactivo"}
                    </Badge>
                    <Select value={detailActive ? "1" : "0"} onValueChange={(v) => setDetailActive(v === "1")}>
                      <SelectTrigger className="w-32 h-8">
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Activo</SelectItem>
                        <SelectItem value="0">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label>Línea de Investigación</Label>
                  <Select
                    value={String(detailForm.idLineaInv || "")}
                    onValueChange={(v) =>
                      setDetailForm((prev) => ({ ...prev, idLineaInv: Number(v) }))
                    }
                  >
                    <SelectTrigger className="w-[200px] h-10 justify-start overflow-hidden">
                      <SelectValue asChild placeholder="Seleccione...">
                        <span className="w-full truncate whitespace-nowrap text-left">
                          {researchLines.find(l => l.id === detailForm.idLineaInv)?.name || "Seleccione..."}
                        </span>
                      </SelectValue>
                    </SelectTrigger>

                    <SelectContent className="w-[300px]">
                      {researchLines.map((line) => (
                        <SelectItem key={line.id} value={String(line.id)}>
                          {line.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Gestión</Label>
                  <Select
                    value={String(detailForm.idGestion || "")}
                    onValueChange={(v) => setDetailForm((prev) => ({ ...prev, idGestion: Number(v) }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent>
                      {gestiones.map((g) => (
                        <SelectItem key={g.id} value={String(g.id)}>
                          {g.gestion} {g.typeGestion ? `(${g.typeGestion})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Modalidad</Label>
                  <Select
                    value={String(detailForm.idModalidad || "")}
                    onValueChange={(v) => setDetailForm((prev) => ({ ...prev, idModalidad: Number(v) }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                    <SelectContent>
                      {modalidades.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Jefe de Carrera (opcional)</Label>
                {detailSelectedJefe ? (
                  <div className="flex justify-between items-center p-2 border rounded bg-muted/20">
                    <div className="text-sm">
                      <p className="font-medium">{detailSelectedJefe.fullName || detailSelectedJefe.email}</p>
                      <p className="text-xs text-muted-foreground break-all">{detailSelectedJefe.email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDetailSelectedJefe(null)
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar jefe de carrera..."
                      className="pl-8"
                      value={detailJefeSearchTerm}
                      onChange={(e) => handleSearchJefeDetail(e.target.value)}
                    />
                    {detailJefeLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                    {detailJefeResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-40 overflow-auto">
                        {detailJefeResults.map((j) => (
                          <div
                            key={j.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => {
                              setDetailSelectedJefe(j)
                              setDetailJefeResults([])
                              setDetailJefeSearchTerm("")
                            }}
                          >
                            <p className="font-medium">{j.fullName || j.email}</p>
                            <p className="text-xs text-muted-foreground break-all">{j.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Se muestran solo usuarios con rol JEFECARRERA.</p>
              </div>

              <div className="grid gap-3 border rounded-lg p-3">
                <p className="text-sm font-medium">Asignar docentes</p>
                <p className="text-xs text-muted-foreground">Docente TG, Tutor y Revisor 1 son obligatorios. Revisor 2 es opcional.</p>

                <div className="grid gap-2">
                  <div className="grid md:grid-cols-[200px,1fr] gap-3 items-center">
                    <div className="grid gap-1">
                      <Label className="text-xs text-muted-foreground">Asignar a</Label>
                      <Select value={detailAssignTarget} onValueChange={(v) => setDetailAssignTarget(v as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tg">Docente TG (obligatorio)</SelectItem>
                          <SelectItem value="tutor">Tutor (obligatorio)</SelectItem>
                          <SelectItem value="rev1">Revisor 1 (obligatorio)</SelectItem>
                          <SelectItem value="rev2">Revisor 2 (opcional)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nombre, correo o código..."
                        className="pl-8"
                        value={detailTeacherSearchTerm}
                        onChange={(e) => handleSearchTeacherDetail(e.target.value)}
                      />
                      {detailTeacherSearchLoading && (
                        <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                      )}
                      {detailTeacherResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
                          {detailTeacherResults.map((t) => (
                            <div
                              key={t.id}
                              className="p-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => {
                                setDetailSelectedTeachers((prev) => ({ ...prev, [detailAssignTarget]: t }))
                                setDetailTeacherResults([])
                                setDetailTeacherSearchTerm("")
                              }}
                            >
                              <p className="font-medium">{t.nombreCompleto}</p>
                              <p className="text-xs text-muted-foreground break-all">{t.email || t.codDocente || t.idSaga}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {detailTeacherSearchTerm && detailTeacherResults.length === 0 && !detailTeacherSearchLoading && (
                    <p className="text-xs text-muted-foreground">Sin resultados para “{detailTeacherSearchTerm}”.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {[
                    { label: "Docente TG", key: "tg" },
                    { label: "Tutor", key: "tutor" },
                    { label: "Revisor 1", key: "rev1" },
                    { label: "Revisor 2 (opcional)", key: "rev2" },
                  ].map(({ label, key }) => {
                    const selected = detailSelectedTeachers[key as keyof typeof detailSelectedTeachers]
                    return (
                      <div key={key} className="border rounded-md p-3 bg-muted/30 grid gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-muted-foreground">{label}</div>
                          {selected && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => {
                                setDetailSelectedTeachers((prev) => ({ ...prev, [key]: null }))
                              }}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                        <div className="text-sm font-medium leading-tight break-words">
                          {selected ? selected.nombreCompleto : <span className="text-xs text-muted-foreground">Sin asignar</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setDetailNotaFecha(today)
                      setDetailNotaFechaDefensa(today)
                      setDetailNotaHoraDefensa("12:00")
                      setDetailNotaCite(`CITE-${detailProject.id}-${new Date().getFullYear()}`)
                      setShowNotaModal(true)
                    }}
                  >
                    Nota de Servicio
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setNotaEmpastadoFecha(today)
                      setNotaEmpastadoFechaPresentacion(today)
                      setNotaEmpastadoCiudad("LA PAZ")
                      setNotaEmpastadoCite(`CITE-EMP-${detailProject.id}-${new Date().getFullYear()}`)
                      setShowNotaEmpastadoModal(true)
                    }}
                  >
                    Nota de Servicio Empastado
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setCartaPerfilFecha(today)
                      setCartaPerfilCiudad("LA PAZ")
                      setCartaPerfilCite(`CITE-PERFIL-${detailProject.id}-${new Date().getFullYear()}`)
                      setCartaPerfilFase(phases[0]?.name || "")
                      setCartaPerfilAnexos("")
                      setShowCartaPerfilModal(true)
                    }}
                  >
                    Carta Aprobación Perfil
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setInformeRevisionFecha(today)
                      setInformeRevisionCiudad("LA PAZ")
                      setInformeRevisionFase(phases[0]?.name || "")
                      setShowInformeRevisionModal(true)
                    }}
                  >
                    Informe Revision
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setControlFechaDevolucion(today)
                      setControlRevisionPor(user?.persona?.nombreCompleto || user?.email || "")
                      setControlFase(phases[0]?.name || "")
                      setControlDetalles(buildControlDetalles())
                      setControlCumple(buildControlCumple())
                      setControlObservaciones("")
                      setShowControlModal(true)
                    }}
                  >
                    Bitacora
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setInvFecha(today)
                      setInvCite("")
                      setInvDestNombre(detailProject.docenteTutor?.nombreCompleto || "")
                      setInvDestCargo("DOCENTE DE LA EMI")
                      setShowInvitacionModal(true)
                    }}
                  >
                    Carta Invitación
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setAceFecha(today)
                      setAceCite("")
                      setShowAceptacionModal(true)
                    }}
                  >
                    Carta Aceptación
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setActaCite(`ACTA-${detailProject.id}-${new Date().getFullYear()}`)
                      setActaFecha(new Date().toISOString().slice(0, 10))
                      setShowActaModal(true)
                    }}
                  >
                    Acta Aprobación
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setMemoCite(`MEMO-${detailProject.id}-${new Date().getFullYear()}`)
                      setMemoCiudad("LA PAZ")
                      setMemoFecha(today)
                      setMemoFechaDefensa(today)
                      setMemoHoraDefensa("12:00")
                      setShowMemoModal(true)
                    }}
                  >
                    Memorandum Aviso
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setMemoAsignacionCite(`MEMO-ASIG-${detailProject.id}-${new Date().getFullYear()}`)
                      setMemoAsignacionCiudad("LA PAZ")
                      setMemoAsignacionFecha(today)
                      setShowMemoAsignacionModal(true)
                    }}
                  >
                    Memorandum Asignacion Tutor
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setAvalFecha(today)
                      setAvalFase(phases[0]?.name || "")
                      setAvalFirmante("tg")
                      setShowAvalModal(true)
                    }}
                  >
                    Aval
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No se pudo cargar el proyecto.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            <Button onClick={handleUpdateDetail} disabled={detailSaving || !detailProject}>
              {detailSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Nota de Servicio desde detalle */}
      <Dialog open={showNotaModal} onOpenChange={setShowNotaModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generar Nota de Servicio</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label htmlFor="nota-cite">CITE</Label>
              <Input
                id="nota-cite"
                value={detailNotaCite}
                onChange={(e) => setDetailNotaCite(e.target.value)}
                placeholder="Ej. CITE-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nota-fecha">Fecha</Label>
              <Input
                id="nota-fecha"
                type="date"
                value={detailNotaFecha}
                onChange={(e) => setDetailNotaFecha(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nota-fecha-defensa">Fecha de defensa</Label>
              <Input
                id="nota-fecha-defensa"
                type="date"
                value={detailNotaFechaDefensa}
                onChange={(e) => setDetailNotaFechaDefensa(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nota-hora-defensa">Hora de defensa</Label>
              <Input
                id="nota-hora-defensa"
                type="time"
                value={detailNotaHoraDefensa}
                onChange={(e) => setDetailNotaHoraDefensa(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fase / Borrador</Label>
              <Select value={faseSelected} onValueChange={setFaseSelected}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowNotaModal(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!detailProject) return
                if (!detailNotaCite || !detailNotaFecha || !detailNotaFechaDefensa || !detailNotaHoraDefensa) {
                  toast({ variant: "destructive", title: "CITE, fecha y datos de defensa son obligatorios" })
                  return
                }
                try {
                  setNotaError("")
                  setNotaGenerating(true)
                  const fechaLegible = detailNotaFecha
                    ? new Date(detailNotaFecha).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
                    : ""
                  const fechaDefensaLegible = detailNotaFechaDefensa
                    ? new Date(detailNotaFechaDefensa).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
                    : ""
                  const resp = await apiClient.reportes.notaServicio({
                    idProyecto: detailProject.id,
                    cite: detailNotaCite,
                    fecha: fechaLegible,
                    fechaDefensa: fechaDefensaLegible,
                    horaDefensa: detailNotaHoraDefensa,
                    fase: faseSelected || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Nota generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowNotaModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Nota de Servicio"
                  setNotaError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setNotaGenerating(false)
                }
              }}
              disabled={!detailProject || notaGenerating}
            >
              {notaGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {notaError && <p className="text-xs text-red-600 mt-2">{notaError}</p>}
        </DialogContent>
      </Dialog>

      {/* Modal Nota de Servicio Empastado */}
      <Dialog open={showNotaEmpastadoModal} onOpenChange={setShowNotaEmpastadoModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Nota de Servicio Empastado</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={notaEmpastadoCite}
                onChange={(e) => setNotaEmpastadoCite(e.target.value)}
                placeholder="Ej. CITE-EMP-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={notaEmpastadoCiudad}
                onChange={(e) => setNotaEmpastadoCiudad(e.target.value)}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={notaEmpastadoFecha} onChange={(e) => setNotaEmpastadoFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha límite de presentación</Label>
              <Input
                type="date"
                value={notaEmpastadoFechaPresentacion}
                onChange={(e) => setNotaEmpastadoFechaPresentacion(e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El semestre y la gestión se obtienen del proyecto (solo 6to o 10mo semestre).
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowNotaEmpastadoModal(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!detailProject) return
                if (!notaEmpastadoCite || !notaEmpastadoCiudad || !notaEmpastadoFecha || !notaEmpastadoFechaPresentacion) {
                  toast({ variant: "destructive", title: "CITE, ciudad, fecha y fecha límite son obligatorios" })
                  return
                }
                try {
                  setNotaEmpastadoError("")
                  setNotaEmpastadoGenerating(true)
                  const fechaLegible = new Date(notaEmpastadoFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const fechaPresentacionLegible = new Date(notaEmpastadoFechaPresentacion).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.notaServicioEmpastado({
                    idProyecto: detailProject.id,
                    cite: notaEmpastadoCite,
                    ciudad: notaEmpastadoCiudad,
                    fecha: fechaLegible,
                    fechaPresentacion: fechaPresentacionLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Nota generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowNotaEmpastadoModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Nota de Servicio Empastado"
                  setNotaEmpastadoError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setNotaEmpastadoGenerating(false)
                }
              }}
              disabled={!detailProject || notaEmpastadoGenerating}
            >
              {notaEmpastadoGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {notaEmpastadoError && <p className="text-xs text-red-600 mt-2">{notaEmpastadoError}</p>}
        </DialogContent>
      </Dialog>

      {/* Carta Aprobación de Perfil */}
      <Dialog open={showCartaPerfilModal} onOpenChange={setShowCartaPerfilModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Carta Aprobación de Perfil</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={cartaPerfilCite}
                onChange={(e) => setCartaPerfilCite(e.target.value)}
                placeholder="Ej. CITE-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={cartaPerfilCiudad}
                onChange={(e) => setCartaPerfilCiudad(e.target.value)}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={cartaPerfilFecha} onChange={(e) => setCartaPerfilFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select value={cartaPerfilFase} onValueChange={setCartaPerfilFase}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Anexos (opcional)</Label>
              <Input value={cartaPerfilAnexos} onChange={(e) => setCartaPerfilAnexos(e.target.value)} placeholder="S/A" />
            </div>
            <p className="text-xs text-muted-foreground">
              El estudiante, semestre y docente TG se obtienen del proyecto.
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowCartaPerfilModal(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!detailProject) return
                if (!cartaPerfilCite || !cartaPerfilCiudad || !cartaPerfilFecha || !cartaPerfilFase) {
                  toast({ variant: "destructive", title: "CITE, ciudad, fecha y fase son obligatorios" })
                  return
                }
                try {
                  setCartaPerfilError("")
                  setCartaPerfilGenerating(true)
                  const fechaLegible = new Date(cartaPerfilFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.cartaAprobacionPerfil({
                    idProyecto: detailProject.id,
                    cite: cartaPerfilCite,
                    ciudad: cartaPerfilCiudad,
                    fecha: fechaLegible,
                    fase: cartaPerfilFase,
                    anexos: cartaPerfilAnexos || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Carta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowCartaPerfilModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Carta de Aprobación"
                  setCartaPerfilError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setCartaPerfilGenerating(false)
                }
              }}
              disabled={!detailProject || cartaPerfilGenerating}
            >
              {cartaPerfilGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {cartaPerfilError && <p className="text-xs text-red-600 mt-2">{cartaPerfilError}</p>}
        </DialogContent>
      </Dialog>

      {/* Informe Revision */}
      <Dialog open={showInformeRevisionModal} onOpenChange={setShowInformeRevisionModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Informe de Revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={informeRevisionCiudad}
                onChange={(e) => setInformeRevisionCiudad(e.target.value)}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={informeRevisionFecha} onChange={(e) => setInformeRevisionFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select value={informeRevisionFase} onValueChange={setInformeRevisionFase}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              El resto de datos se obtiene del proyecto en el backend.
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowInformeRevisionModal(false)}>Cancelar</Button>
            <Button
              onClick={async () => {
                if (!detailProject) return
                if (!informeRevisionCiudad || !informeRevisionFecha || !informeRevisionFase) {
                  toast({ variant: "destructive", title: "Ciudad, fecha y fase son obligatorios" })
                  return
                }
                try {
                  setInformeRevisionError("")
                  setInformeRevisionGenerating(true)
                  const fechaLegible = new Date(informeRevisionFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.informeRevision({
                    idProyecto: detailProject.id,
                    ciudad: informeRevisionCiudad,
                    fecha: fechaLegible,
                    fase: informeRevisionFase,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Informe generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowInformeRevisionModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Informe"
                  setInformeRevisionError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setInformeRevisionGenerating(false)
                }
              }}
              disabled={!detailProject || informeRevisionGenerating}
            >
              {informeRevisionGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {informeRevisionError && <p className="text-xs text-red-600 mt-2">{informeRevisionError}</p>}
        </DialogContent>
      </Dialog>

      {/* Bitacora */}
      <Dialog open={showControlModal} onOpenChange={setShowControlModal}>
        <DialogContent className="!max-w-[58vw] !w-[58vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bitacora</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>Fase</Label>
                <Select value={controlFase} onValueChange={setControlFase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona fase" />
                  </SelectTrigger>
                  <SelectContent>
                    {phases.map((f) => (
                      <SelectItem key={f.id} value={f.name}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fecha de devolucion</Label>
                <Input
                  type="date"
                  value={controlFechaDevolucion}
                  onChange={(e) => setControlFechaDevolucion(e.target.value)}
                />
              </div>
              <div className="grid gap-2 md:col-span-2">
                <Label>Revision por</Label>
                <Input
                  value={controlRevisionPor}
                  onChange={(e) => setControlRevisionPor(e.target.value)}
                  placeholder="Nombre del revisor"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Detalle de observaciones</div>
              <div className="rounded-lg border">
                <div className="grid grid-cols-[44px_minmax(0,1fr)_120px_140px_100px] gap-2 bg-muted px-2 py-2 text-[11px] font-semibold uppercase">
                  <div className="text-center">Nº</div>
                  <div>Detalle</div>
                  <div className="text-center">Presenta</div>
                  <div className="text-center">Subsanada</div>
                  <div className="text-center">Conforme</div>
                </div>
                {controlDetalles.map((row, index) => (
                  <div
                    key={`detail-control-${index}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_120px_140px_100px] gap-2 border-t text-sm items-center"
                  >
                    <div className="text-center">{index + 1}</div>
                    <Input
                      value={row.detalle}
                      onChange={(e) => {
                        const value = e.target.value
                        setControlDetalles((prev) => {
                          const next = [...prev]
                          next[index] = { ...next[index], detalle: value }
                          return next
                        })
                      }}
                      placeholder=""
                      className="h-8 border-0"
                    />
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={row.presentaObservacion}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlDetalles((prev) => {
                            const next = [...prev]
                            next[index] = { ...next[index], presentaObservacion: value }
                            return next
                          })
                        }}
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={row.observacionSubsanada}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlDetalles((prev) => {
                            const next = [...prev]
                            next[index] = { ...next[index], observacionSubsanada: value }
                            return next
                          })
                        }}
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={row.conforme}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlDetalles((prev) => {
                            const next = [...prev]
                            next[index] = { ...next[index], conforme: value }
                            return next
                          })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Verificacion de cumplimiento</div>
              <div className="rounded-lg border">
                <div className="grid grid-cols-[44px_minmax(0,1fr)_120px_120px] gap-2 bg-muted px-2 py-2 text-[11px] font-semibold uppercase">
                  <div className="text-center">Nº</div>
                  <div>Detalle</div>
                  <div className="text-center">Cumple</div>
                  <div className="text-center">No cumple</div>
                </div>
                {controlCumpleLabels.map((label, index) => (
                  <div
                    key={`control-cumple-${index}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_120px_120px] gap-2 border-t px-2 py-2 text-sm items-start"
                  >
                    <div className="text-center">{index + 1}</div>
                    <div className="text-sm leading-snug">{label}</div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={controlCumple[index]?.cumple}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlCumple((prev) => {
                            const next = [...prev]
                            next[index] = { ...next[index], cumple: value }
                            return next
                          })
                        }}
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={controlCumple[index]?.noCumple}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlCumple((prev) => {
                            const next = [...prev]
                            next[index] = { ...next[index], noCumple: value }
                            return next
                          })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Observaciones</Label>
              <Textarea
                value={controlObservaciones}
                onChange={(e) => setControlObservaciones(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowControlModal(false)}>Cancelar</Button>
            <Button
              disabled={controlGenerating}
              onClick={async () => {
                if (!detailProject) return
                if (!controlFase || !controlRevisionPor || !controlFechaDevolucion) {
                  toast({ variant: "destructive", title: "Fase, revisor y fecha son obligatorios" })
                  return
                }
                try {
                  setControlError("")
                  setControlGenerating(true)
                  const fechaLegible = new Date(controlFechaDevolucion).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.bitacora({
                    idProyecto: detailProject.id,
                    fase: controlFase,
                    revisionPor: controlRevisionPor,
                    fechaDevolucion: fechaLegible,
                    detalles: controlDetalles,
                    cumple: controlCumple,
                    observaciones: controlObservaciones || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Bitacora generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowControlModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Bitacora"
                  setControlError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setControlGenerating(false)
                }
              }}
            >
              {controlGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {controlError && <p className="text-xs text-red-600 mt-2">{controlError}</p>}
        </DialogContent>
      </Dialog>

      {/* Carta de Invitación */}
      <Dialog open={showInvitacionModal} onOpenChange={setShowInvitacionModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generar Carta de Invitación</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>CITE (opcional)</Label>
              <Input value={invCite} onChange={(e) => setInvCite(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={invFecha} onChange={(e) => setInvFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Destinatario (nombre)</Label>
              <Input value={invDestNombre} onChange={(e) => setInvDestNombre(e.target.value)} placeholder="Tutor asignado" />
            </div>
            <div className="grid gap-2">
              <Label>Destinatario (cargo)</Label>
              <Input value={invDestCargo} onChange={(e) => setInvDestCargo(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Usa el proyecto cargado en detalle para tomar estudiante y título.
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowInvitacionModal(false)}>Cancelar</Button>
            <Button
              disabled={!detailProject || invGenerating}
              onClick={async () => {
                if (!detailProject) return
                if (!invFecha) {
                  toast({ variant: "destructive", title: "Fecha es obligatoria" })
                  return
                }
                try {
                  setInvError("")
                  setInvGenerating(true)
                  const fechaLegible = new Date(invFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.cartaInvitacionTutor({
                    idProyecto: detailProject.id,
                    cite: invCite || undefined,
                    fecha: fechaLegible,
                    destinatarioNombre: invDestNombre || detailProject.docenteTutor?.nombreCompleto || undefined,
                    destinatarioCargo: invDestCargo || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Carta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowInvitacionModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Carta de Invitación"
                  setInvError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setInvGenerating(false)
                }
              }}
            >
              {invGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {invError && <p className="text-xs text-red-600 mt-2">{invError}</p>}
        </DialogContent>
      </Dialog>

      {/* Carta de Aceptación */}
      <Dialog open={showAceptacionModal} onOpenChange={setShowAceptacionModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Generar Carta de Aceptación</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-2">
              <Label>CITE (opcional)</Label>
              <Input value={aceCite} onChange={(e) => setAceCite(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={aceFecha} onChange={(e) => setAceFecha(e.target.value)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Usa el proyecto cargado para traer estudiante, tutor y jefe de carrera.
            </p>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowAceptacionModal(false)}>Cancelar</Button>
            <Button
              disabled={!detailProject || aceGenerating}
              onClick={async () => {
                if (!detailProject) return
                if (!aceFecha) {
                  toast({ variant: "destructive", title: "Fecha es obligatoria" })
                  return
                }
                try {
                  setAceError("")
                  setAceGenerating(true)
                  const fechaLegible = new Date(aceFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.cartaAceptacionTutor({
                    idProyecto: detailProject.id,
                    cite: aceCite || undefined,
                    fecha: fechaLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Carta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowAceptacionModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Carta de Aceptación"
                  setAceError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setAceGenerating(false)
                }
              }}
            >
              {aceGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {aceError && <p className="text-xs text-red-600 mt-2">{aceError}</p>}
        </DialogContent>
      </Dialog>

      {/* Acta de Aprobación */}
      <Dialog open={showActaModal} onOpenChange={setShowActaModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Acta de Aprobación</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input value={actaCite} onChange={(e) => setActaCite(e.target.value)} placeholder="Ej. ACTA-001" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={actaFecha} onChange={(e) => setActaFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Hora</Label>
              <Input type="time" value={actaHora} onChange={(e) => setActaHora(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select value={faseSelected} onValueChange={setFaseSelected}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowActaModal(false)}>Cancelar</Button>
            <Button
              disabled={!detailProject || actaGenerating}
              onClick={async () => {
                if (!detailProject) {
                  toast({ variant: "destructive", title: "Sin proyecto cargado" })
                  return
                }
                if (!actaCite || !actaFecha) {
                  toast({ variant: "destructive", title: "CITE y fecha son obligatorios" })
                  return
                }
                try {
                  setActaError("")
                  setActaGenerating(true)
                  const fechaLarga = new Date(actaFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.actaAprobacion({
                    idProyecto: detailProject.id,
                    cite: actaCite,
                    ciudad: "LA PAZ",
                    hora: actaHora,
                    fechaLarga: fechaLarga || "S/F",
                    fase: faseSelected || "BORRADOR FINAL",
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Acta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowActaModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Acta de Aprobación"
                  setActaError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setActaGenerating(false)
                }
              }}
            >
              {actaGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar Acta
            </Button>
          </DialogFooter>
          {actaError && <p className="text-xs text-red-600 mt-2">{actaError}</p>}
        </DialogContent>
      </Dialog>

      {/* Memorandum Aviso de Defensa */}
      <Dialog open={showMemoModal} onOpenChange={setShowMemoModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Memorandum Aviso de Defensa</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input value={memoCite} onChange={(e) => setMemoCite(e.target.value)} placeholder="Ej. MEMO-001" />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input value={memoCiudad} onChange={(e) => setMemoCiudad(e.target.value)} placeholder="Ej. LA PAZ" />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={memoFecha} onChange={(e) => setMemoFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha de defensa</Label>
              <Input type="date" value={memoFechaDefensa} onChange={(e) => setMemoFechaDefensa(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Hora de defensa</Label>
              <Input type="time" value={memoHoraDefensa} onChange={(e) => setMemoHoraDefensa(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowMemoModal(false)}>Cancelar</Button>
            <Button
              disabled={!detailProject || memoGenerating}
              onClick={async () => {
                if (!detailProject) {
                  toast({ variant: "destructive", title: "Sin proyecto cargado" })
                  return
                }
                if (!memoCite || !memoCiudad || !memoFecha || !memoFechaDefensa || !memoHoraDefensa) {
                  toast({ variant: "destructive", title: "CITE, ciudad, fecha y datos de defensa son obligatorios" })
                  return
                }
                try {
                  setMemoError("")
                  setMemoGenerating(true)
                  const fechaLegible = new Date(memoFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const fechaDefensaLegible = new Date(memoFechaDefensa).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.memoAvisoDefensa({
                    idProyecto: detailProject.id,
                    cite: memoCite,
                    ciudad: memoCiudad,
                    fecha: fechaLegible,
                    fechaDefensa: fechaDefensaLegible,
                    horaDefensa: memoHoraDefensa,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Memorandum generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowMemoModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Memorandum"
                  setMemoError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setMemoGenerating(false)
                }
              }}
            >
              {memoGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {memoError && <p className="text-xs text-red-600 mt-2">{memoError}</p>}
        </DialogContent>
      </Dialog>

      {/* Memorandum Asignacion Tutor */}
      <Dialog open={showMemoAsignacionModal} onOpenChange={setShowMemoAsignacionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Memorandum Asignacion Tutor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={memoAsignacionCite}
                onChange={(e) => setMemoAsignacionCite(e.target.value)}
                placeholder="Ej. MEMO-001"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={memoAsignacionCiudad}
                onChange={(e) => setMemoAsignacionCiudad(e.target.value)}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={memoAsignacionFecha} onChange={(e) => setMemoAsignacionFecha(e.target.value)} />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowMemoAsignacionModal(false)}>Cancelar</Button>
            <Button
              disabled={!detailProject || memoAsignacionGenerating}
              onClick={async () => {
                if (!detailProject) {
                  toast({ variant: "destructive", title: "Sin proyecto cargado" })
                  return
                }
                if (!memoAsignacionCite || !memoAsignacionCiudad || !memoAsignacionFecha) {
                  toast({ variant: "destructive", title: "CITE, ciudad y fecha son obligatorios" })
                  return
                }
                try {
                  setMemoAsignacionError("")
                  setMemoAsignacionGenerating(true)
                  const fechaLegible = new Date(memoAsignacionFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.memoAsignacionTutor({
                    idProyecto: detailProject.id,
                    cite: memoAsignacionCite,
                    ciudad: memoAsignacionCiudad,
                    fecha: fechaLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Memorandum generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowMemoAsignacionModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Memorandum"
                  setMemoAsignacionError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setMemoAsignacionGenerating(false)
                }
              }}
            >
              {memoAsignacionGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {memoAsignacionError && <p className="text-xs text-red-600 mt-2">{memoAsignacionError}</p>}
        </DialogContent>
      </Dialog>

      {/* Aval */}
      <Dialog open={showAvalModal} onOpenChange={setShowAvalModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Generar Aval</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input type="date" value={avalFecha} onChange={(e) => setAvalFecha(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select value={avalFase} onValueChange={setAvalFase}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona fase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((f) => (
                    <SelectItem key={f.id} value={f.name}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Firmante</Label>
              <Select value={avalFirmante} onValueChange={(v) => setAvalFirmante(v as typeof avalFirmante)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona firmante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tg">Docente TG</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="rev1">Revisor 1</SelectItem>
                  <SelectItem value="rev2">Revisor 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowAvalModal(false)}>Cancelar</Button>
            <Button
              disabled={!detailProject || avalGenerating}
              onClick={async () => {
                if (!detailProject) {
                  toast({ variant: "destructive", title: "Sin proyecto cargado" })
                  return
                }
                if (!avalFecha || !avalFase) {
                  toast({ variant: "destructive", title: "Fecha y fase son obligatorias" })
                  return
                }
                try {
                  setAvalError("")
                  setAvalGenerating(true)
                  const fechaLegible = new Date(avalFecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.aval({
                    idProyecto: detailProject.id,
                    fecha: fechaLegible,
                    fase: avalFase,
                    firmante: avalFirmante,
                  })
                  await openPreview(resp.archivoId, resp.filename, true)
                  toast({ title: "Aval generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowAvalModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Aval"
                  setAvalError(msg)
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setAvalGenerating(false)
                }
              }}
            >
              {avalGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
          {avalError && <p className="text-xs text-red-600 mt-2">{avalError}</p>}
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={handlePreviewOpenChange}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Vista previa del documento</DialogTitle>
          </DialogHeader>
          {previewUrl ? (
            <iframe title={previewName || "Documento"} src={previewUrl} className="w-full h-[70vh] border rounded-md" />
          ) : (
            <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleDownloadPreview} disabled={!previewUrl}>
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE MODAL */}
      <Dialog
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open)
          if (!open) {
            setSelectedStudent(null)
            setStudentSearchResults([])
            setTeacherResults([])
            setSelectedTeachers({ tg: null, tutor: null, rev1: null, rev2: null })
            setAssignTarget("tg")
            setSelectedJefe(null)
            setJefeResults([])
            setJefeSearchTerm("")
            setFormData({
              titulo: "",
              idLineaInv: 0,
              idGestion: 0,
              idDocTG: 0,
              idDocTutor: 0,
              idDocRev1: 0,
              idDocRev2: 0,
              idModalidad: 1,
              idUserJefeC: undefined,
              idEstudiante: undefined,
            })
          }
        }}
      >
        <DialogContent className="w-[95vw] max-w-[95vw] md:max-w-6xl lg:max-w-7xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">

            {/* Estudiante (obligatorio) */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Estudiante (obligatorio)</label>
                {isStudent && <Badge variant="secondary" className="text-[10px]">Usaremos tu sesión</Badge>}
              </div>
              {isStudent && selectedStudent ? (
                <div className="p-2 border rounded bg-muted/20 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{user?.persona?.nombreCompleto || "Tu usuario"}</p>
                      <p className="text-xs text-muted-foreground break-all">{user?.email}</p>
                    </div>
                    {studentSelfLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">ID estudiante: {formData.idEstudiante}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSelectedStudent(null)
                      setFormData((prev) => ({ ...prev, idEstudiante: undefined }))
                    }}
                  >
                    Usar otro estudiante
                  </Button>
                </div>
              ) : selectedStudent ? (
                <div className="flex justify-between items-center p-2 border rounded bg-muted/20">
                  <div className="text-sm">
                    <p className="font-medium">{selectedStudent.nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground break-all">
                      {selectedStudent.email || `ID SAGA: ${selectedStudent.idSaga ?? "-"}`}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedStudent(null)
                      setFormData((prev) => ({ ...prev, idEstudiante: undefined }))
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar estudiante por nombre, correo o ID SAGA..."
                    className="pl-8"
                    value={studentSearchTerm}
                    onChange={e => handleSearchStudent(e.target.value)}
                  />
                  {searchLoading && (
                    <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {studentSearchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
                      {studentSearchResults.map(s => (
                        <div key={s.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedStudent(s)
                            setFormData((prev) => ({ ...prev, idEstudiante: s.id }))
                            setStudentSearchResults([])
                            setStudentSearchTerm("")
                          }}
                        >
                          <p className="font-medium">{s.nombreCompleto}</p>
                          <p className="text-xs text-muted-foreground break-all">
                            {s.email || `ID SAGA: ${s.idSaga ?? "-"}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {studentSearchTerm.length >= 2 && !searchLoading && studentSearchResults.length === 0 && (
                    <p className="text-xs text-muted-foreground mt-1">Sin resultados para “{studentSearchTerm}”.</p>
                  )}
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Jefe de Carrera (opcional)</label>
              {selectedJefe ? (
                <div className="flex justify-between items-center p-2 border rounded bg-muted/20">
                  <div className="text-sm">
                    <p className="font-medium">{selectedJefe.fullName || selectedJefe.email}</p>
                    <p className="text-xs text-muted-foreground break-all">{selectedJefe.email}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedJefe(null)
                      setFormData((prev) => ({ ...prev, idUserJefeC: undefined }))
                    }}
                  >
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar jefe de carrera..."
                    className="pl-8"
                    value={jefeSearchTerm}
                    onChange={(e) => handleSearchJefe(e.target.value)}
                  />
                  {jefeLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                  {jefeResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-40 overflow-auto">
                      {jefeResults.map((j) => (
                        <div
                          key={j.id}
                          className="p-2 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            setSelectedJefe(j)
                            setFormData((prev) => ({ ...prev, idUserJefeC: String(j.id) }))
                            setJefeResults([])
                            setJefeSearchTerm("")
                          }}
                        >
                          <p className="font-medium">{j.fullName || j.email}</p>
                          <p className="text-xs text-muted-foreground break-all">{j.email}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground">Se muestran solo usuarios con rol JEFECARRERA.</p>
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-medium">Título del Proyecto</label>
              <Textarea
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ingrese el título..."
                className="min-h-[120px] text-base"
              />
              <p className="text-[11px] text-muted-foreground">Debe ser descriptivo; mínimo 5 caracteres.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Línea de Investigación</label>
                <Select
                  value={String(formData.idLineaInv || "")}
                  onValueChange={v => setFormData({ ...formData, idLineaInv: Number(v) })}
                >
                  <SelectTrigger className="whitespace-normal min-h-[46px]">
                    <SelectValue placeholder="Seleccione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {researchLines.map(line => (
                      <SelectItem key={line.id} value={String(line.id)}>
                        <span className="block whitespace-normal break-words">{line.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Gestión</label>
                <Select
                  value={String(formData.idGestion || "")}
                  onValueChange={v => setFormData({ ...formData, idGestion: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>
                    {gestiones.map(g => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {g.gestion} {g.typeGestion ? `(${g.typeGestion})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Modalidad</label>
                <Select
                  value={String(formData.idModalidad || "")}
                  onValueChange={v => setFormData({ ...formData, idModalidad: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>
                    {modalidades.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-3 border rounded-lg p-3">
              <p className="text-sm font-medium">Asignar docentes</p>
              <p className="text-xs text-muted-foreground">Docente TG, Tutor y Revisor 1 son obligatorios. Revisor 2 es opcional.</p>

              <div className="grid gap-2">
                <div className="grid md:grid-cols-[200px,1fr] gap-3 items-center">
                  <div className="grid gap-1">
                    <label className="text-xs text-muted-foreground">Asignar a</label>
                    <Select value={assignTarget} onValueChange={(v) => setAssignTarget(v as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tg">Docente TG (obligatorio)</SelectItem>
                        <SelectItem value="tutor">Tutor (obligatorio)</SelectItem>
                        <SelectItem value="rev1">Revisor 1 (obligatorio)</SelectItem>
                        <SelectItem value="rev2">Revisor 2 (opcional)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre, correo o código..."
                      className="pl-8"
                      value={teacherSearchTerm}
                      onChange={(e) => handleSearchTeacher(e.target.value)}
                    />
                    {teacherSearchLoading && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                    {teacherResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-auto">
                        {teacherResults.map((t) => (
                          <div
                            key={t.id}
                            className="p-2 hover:bg-muted cursor-pointer text-sm"
                            onClick={() => {
                              setSelectedTeachers((prev) => ({ ...prev, [assignTarget]: t }))
                              setFormData((prev) => ({
                                ...prev,
                                idDocTG: assignTarget === "tg" ? t.id : prev.idDocTG,
                                idDocTutor: assignTarget === "tutor" ? t.id : prev.idDocTutor,
                                idDocRev1: assignTarget === "rev1" ? t.id : prev.idDocRev1,
                                idDocRev2: assignTarget === "rev2" ? t.id : prev.idDocRev2,
                              }))
                              setTeacherResults([])
                              setTeacherSearchTerm("")
                            }}
                          >
                            <p className="font-medium">{t.nombreCompleto}</p>
                            <p className="text-xs text-muted-foreground break-all">{t.email || t.codDocente || t.idSaga}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {teacherSearchTerm && teacherResults.length === 0 && !teacherSearchLoading && (
                  <p className="text-xs text-muted-foreground">Sin resultados para “{teacherSearchTerm}”.</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { label: "Docente TG", key: "tg", field: "idDocTG" },
                  { label: "Tutor", key: "tutor", field: "idDocTutor" },
                  { label: "Revisor 1", key: "rev1", field: "idDocRev1" },
                  { label: "Revisor 2 (opcional)", key: "rev2", field: "idDocRev2" },
                ].map(({ label, key, field }) => {
                  const selected = selectedTeachers[key as keyof typeof selectedTeachers]
                  return (
                    <div key={key} className="border rounded-md p-3 bg-muted/30 grid gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        {selected && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => {
                              setSelectedTeachers((prev) => ({ ...prev, [key]: null }))
                              setFormData((prev) => ({ ...prev, [field]: 0 }))
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                      <div className="text-sm font-medium leading-tight break-words">
                        {selected ? selected.nombreCompleto : <span className="text-xs text-muted-foreground">Sin asignar</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateRequest} disabled={createLoading}>
              {createLoading ? <Loader2 className="animate-spin mr-2" /> : null}
              Crear Proyecto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
