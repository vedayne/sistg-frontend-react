"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2, RefreshCw, Plus, UserCheck, Upload } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import type {
  AdmEntrega,
  DocenteBasicInfo,
  EstudianteBasicInfo,
  Gestion,
  Pagination,
  Phase,
  ProjectResponseDto,
  Semester,
  SpecialityInfo,
} from "@/lib/types"

type WindowStatus = "NO_INICIADA" | "EN_CURSO" | "CERRADA"

export default function EntregasPage() {
  const { user } = useAuth()
  const [entregas, setEntregas] = useState<AdmEntrega[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const isStudent = (user?.roles ?? []).some((role) => role.name === "ESTUDIANTE")
  const [studentProject, setStudentProject] = useState<ProjectResponseDto | null>(null)
  const [mySchedules, setMySchedules] = useState<AdmEntrega[]>([])
  const [mySchedulesLoading, setMySchedulesLoading] = useState(false)
  const [mySchedulesError, setMySchedulesError] = useState<string | null>(null)
  const [showCronogramasModal, setShowCronogramasModal] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const wordInputRef = useRef<HTMLInputElement | null>(null)
  const pdfInputRef = useRef<HTMLInputElement | null>(null)
  const [wordDragActive, setWordDragActive] = useState(false)
  const [pdfDragActive, setPdfDragActive] = useState(false)
  const [uploadForm, setUploadForm] = useState<{
    title: string
    fase: string
    archWord: File | null
    archPdf: File | null
  }>({
    title: "",
    fase: "",
    archWord: null,
    archPdf: null,
  })

  const [docenteSearch, setDocenteSearch] = useState("")
  const [docenteResults, setDocenteResults] = useState<DocenteBasicInfo[]>([])
  const [docenteLoading, setDocenteLoading] = useState(false)
  const [selectedDocente, setSelectedDocente] = useState<DocenteBasicInfo | null>(null)

  const [autoStudentsLoading, setAutoStudentsLoading] = useState(false)
  const [autoStudentsError, setAutoStudentsError] = useState("")
  const [selectedStudents, setSelectedStudents] = useState<EstudianteBasicInfo[]>([])
  const [studentSearch, setStudentSearch] = useState("")
  const [studentResults, setStudentResults] = useState<EstudianteBasicInfo[]>([])
  const [studentLoading, setStudentLoading] = useState(false)

  // Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Crear cronograma
  const canCreate = (user?.roles ?? []).some((role) => role.name === "DOCENTETG")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createMessage, setCreateMessage] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [semestres, setSemestres] = useState<Semester[]>([])
  const [especialidades, setEspecialidades] = useState<SpecialityInfo[]>([])
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<SpecialityInfo | null>(null)
  const [phases, setPhases] = useState<Phase[]>([])
  const [phasesLoading, setPhasesLoading] = useState(false)
  const [phasesError, setPhasesError] = useState("")
  const [form, setForm] = useState({
    title: "",
    descripcion: "",
    startAt: "",
    endAt: "",
    idGestion: "",
    idSemestre: "",
    idEspecialidad: "",
    idDocente: user?.docenteId ? String(user.docenteId) : "",
    isActive: true,
  })

  useEffect(() => {
    if (user?.docenteId) {
      setForm((prev) => ({ ...prev, idDocente: String(user.docenteId ?? "") }))
    }
  }, [user?.docenteId])

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true)
    try {
      const [gestRes, semRes, espRes] = await Promise.all([
        apiClient.gestiones.list(),
        apiClient.semesters.list(),
        apiClient.specialities.list({ limit: 100 }),
      ])
      setGestiones(gestRes?.data ?? [])
      setSemestres(semRes?.data ?? [])
      setEspecialidades((espRes as any)?.data ?? [])
    } catch (err) {
      console.error("Error cargando catálogos de entregas:", err)
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  const loadPhases = useCallback(async () => {
    setPhasesLoading(true)
    setPhasesError("")
    try {
      const response = await apiClient.phases.list()
      setPhases(response ?? [])
    } catch (err) {
      console.error("Error cargando fases:", err)
      setPhasesError("No se pudieron cargar las fases.")
    } finally {
      setPhasesLoading(false)
    }
  }, [])

  const fetchEntregas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.admEntregas.list({
        page,
        limit,
      })
      setEntregas(response.data)
      setPagination(response.pagination)
    } catch (err) {
      console.error("Error fetching entregas:", err)
      setError("No se pudieron cargar las entregas. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  const fetchMySchedules = useCallback(async () => {
    setMySchedulesLoading(true)
    setMySchedulesError(null)
    try {
      const response = await apiClient.entregas.getMySchedules()
      setMySchedules(response.data ?? [])
    } catch (err) {
      console.error("Error fetching mis cronogramas:", err)
      setMySchedulesError("No se pudieron cargar tus entregas asignadas.")
    } finally {
      setMySchedulesLoading(false)
    }
  }, [])

  const fetchStudentProject = useCallback(async () => {
    try {
      const projects = await apiClient.projects.list()
      setStudentProject(projects?.[0] ?? null)
    } catch (err) {
      console.error("Error fetching proyecto del estudiante:", err)
      setStudentProject(null)
    }
  }, [])

  const fetchDocentes = useCallback(async (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) {
      setDocenteResults([])
      return
    }
    setDocenteLoading(true)
    try {
      const response = await apiClient.teachers.list({ search: trimmed, limit: 8 })
      setDocenteResults(response.data ?? [])
    } catch (err) {
      console.error("Error buscando docentes:", err)
      setDocenteResults([])
    } finally {
      setDocenteLoading(false)
    }
  }, [])

  const fetchDocenteById = useCallback(async (idDocente: string) => {
    if (!idDocente) return
    try {
      const docente = await apiClient.teachers.get(idDocente)
      setSelectedDocente(docente)
      setDocenteSearch(docente.nombreCompleto)
    } catch (err) {
      console.error("Error cargando docente por ID:", err)
    }
  }, [])

  const loadStudentsByFilters = useCallback(async () => {
    const idEspecialidad = Number(form.idEspecialidad)
    const idSemestre = Number(form.idSemestre)
    const idGestion = Number(form.idGestion)

    if (!idEspecialidad || !idSemestre || !idGestion) {
      setSelectedStudents([])
      setAutoStudentsError("")
      return
    }

    setAutoStudentsLoading(true)
    setAutoStudentsError("")
    try {
      const response = await apiClient.students.list({
        idEspecialidad,
        idSemestre,
        idGestion,
        limit: 200,
      })
      setSelectedStudents(response.data ?? [])
    } catch (err) {
      console.error("Error cargando estudiantes por filtros:", err)
      setAutoStudentsError("No se pudieron cargar los estudiantes con los filtros seleccionados.")
      setSelectedStudents([])
    } finally {
      setAutoStudentsLoading(false)
    }
  }, [form.idEspecialidad, form.idSemestre, form.idGestion])

  const fetchStudentsBySearch = useCallback(async (term: string) => {
    const trimmed = term.trim()
    if (!trimmed) {
      setStudentResults([])
      return
    }
    setStudentLoading(true)
    try {
      const isCiSearch = /^\d+$/.test(trimmed)
      const response = await apiClient.students.list({
        limit: 10,
        ...(isCiSearch ? { ci: trimmed } : { search: trimmed }),
      })
      setStudentResults(response.data ?? [])
    } catch (err) {
      console.error("Error buscando estudiantes:", err)
      setStudentResults([])
    } finally {
      setStudentLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas])

  useEffect(() => {
    if (canCreate) loadCatalogs()
  }, [canCreate, loadCatalogs])

  useEffect(() => {
    loadPhases()
  }, [loadPhases])

  useEffect(() => {
    if (isStudent) {
      fetchMySchedules()
      fetchStudentProject()
    }
  }, [isStudent, fetchMySchedules, fetchStudentProject])

  useEffect(() => {
    if (!showCreateForm) return
    if (docenteSearch.trim().length < 2) {
      setDocenteResults([])
      return
    }
    const timer = setTimeout(() => fetchDocentes(docenteSearch), 300)
    return () => clearTimeout(timer)
  }, [docenteSearch, fetchDocentes, showCreateForm])

  useEffect(() => {
    if (!showCreateForm) return
    if (studentSearch.trim().length < 2) {
      setStudentResults([])
      return
    }
    const timer = setTimeout(() => fetchStudentsBySearch(studentSearch), 300)
    return () => clearTimeout(timer)
  }, [studentSearch, fetchStudentsBySearch, showCreateForm])

  useEffect(() => {
    if (!showCreateForm) return
    loadStudentsByFilters()
  }, [form.idEspecialidad, form.idSemestre, form.idGestion, loadStudentsByFilters, showCreateForm])

  useEffect(() => {
    if (!showCreateForm) return
    if (!selectedDocente && form.idDocente) {
      fetchDocenteById(form.idDocente)
    }
  }, [showCreateForm, selectedDocente, form.idDocente, fetchDocenteById])

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("es-BO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (isActive: boolean) =>
    isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</Badge>
    ) : (
      <Badge variant="secondary">Inactivo</Badge>
    )

  const getWindowStatus = (entrega: AdmEntrega): WindowStatus => {
    const now = Date.now()
    const start = new Date(entrega.startAt).getTime()
    const end = new Date(entrega.endAt).getTime()
    if (now < start) return "NO_INICIADA"
    if (now > end) return "CERRADA"
    return "EN_CURSO"
  }

  const renderWindowBadge = (entrega: AdmEntrega) => {
    const status = getWindowStatus(entrega)
    const map: Record<WindowStatus, { label: string; className: string }> = {
      NO_INICIADA: { label: "No iniciada", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40" },
      EN_CURSO: { label: "En curso", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60" },
      CERRADA: { label: "Cerrada", className: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100" },
    }
    return <Badge className={`${map[status].className}`}>{map[status].label}</Badge>
  }

  const getDocenteLabel = (entrega: AdmEntrega) => {
    const details = entrega.docente?.usuario?.usuarioDetalles
    if (details) {
      return `${details.apPaterno ?? ""} ${details.apMaterno ?? ""} ${details.nombre ?? ""}`.trim()
    }
    if (entrega.docente?.nombreCompleto) return entrega.docente.nombreCompleto
    return `Docente ${entrega.idDocente}`
  }

  const selectedSchedule = useMemo(
    () => mySchedules.find((item) => String(item.id) === selectedScheduleId) ?? null,
    [mySchedules, selectedScheduleId],
  )
  const studentDeliveries = useMemo(() => {
    const rows: Array<{ entrega: any; cronograma?: AdmEntrega }> = []
    mySchedules.forEach((schedule) => {
      schedule.entregas?.forEach((entrega) => {
        rows.push({ entrega, cronograma: schedule })
      })
    })
    return rows
  }, [mySchedules])
  const [showEntregaDetail, setShowEntregaDetail] = useState(false)
  const [selectedEntregaDetail, setSelectedEntregaDetail] = useState<{
    entrega: any
    cronograma?: AdmEntrega
  } | null>(null)
  const studentLabel = user?.persona?.nombreCompleto || user?.email || "Estudiante"

  const renderEstadoRevision = (value?: string) => {
    const status = (value || "").toUpperCase()
    if (!status) return <Badge variant="secondary">N/A</Badge>
    if (status === "REVISADO") return <Badge className="bg-emerald-100 text-emerald-800">Revisado</Badge>
    if (status === "EN_REVISION") return <Badge className="bg-amber-100 text-amber-800">En revisión</Badge>
    return <Badge variant="outline">Pendiente</Badge>
  }

  const handleCreateCronograma = async () => {
    setCreateError("")
    setCreateMessage("")

    if (!form.title || !form.startAt || !form.endAt || !form.idGestion || !form.idSemestre || !form.idEspecialidad) {
      setCreateError("Completa título, fechas, gestión, semestre y especialidad.")
      return
    }
    const docenteIdValue = selectedDocente?.id ? String(selectedDocente.id) : form.idDocente
    if (!docenteIdValue) {
      setCreateError("Necesitamos el ID de docente responsable.")
      return
    }

    const startDate = new Date(form.startAt)
    const endDate = new Date(form.endAt)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setCreateError("Las fechas no son válidas.")
      return
    }
    const minEndTime = new Date(startDate.getTime() + 10 * 60 * 1000)
    if (endDate < minEndTime) {
      setCreateError("La fecha de fin debe ser al menos 10 minutos posterior al inicio.")
      return
    }

    const especialidad =
      selectedEspecialidad ?? especialidades.find((e) => e.idEspecialidad === Number(form.idEspecialidad))
    if (!especialidad) {
      setCreateError("Selecciona una especialidad válida.")
      return
    }

    const estudiantesIds = selectedStudents.map((student) => student.id)

    const payload = {
      title: form.title,
      descripcion: form.descripcion || null,
      idDocente: Number(docenteIdValue),
      idGestion: Number(form.idGestion),
      idEspecialidad: Number(form.idEspecialidad),
      especialidad: especialidad.especialidad,
      idSemestre: Number(form.idSemestre),
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      isActive: form.isActive,
      estudiantes: estudiantesIds,
    }

    try {
      setCreating(true)
      await apiClient.admEntregas.create(payload as any)
      setCreateMessage("Cronograma creado correctamente.")
      setShowCreateForm(false)
      setForm((prev) => ({
        ...prev,
        title: "",
        descripcion: "",
        startAt: "",
        endAt: "",
      }))
      setSelectedStudents([])
      setSelectedDocente(null)
      setSelectedEspecialidad(null)
      setDocenteSearch("")
      setStudentSearch("")
      fetchEntregas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el cronograma"
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  const openUploadModal = (cronograma?: AdmEntrega) => {
    const scheduleId =
      cronograma?.id ?? (mySchedules.length === 1 ? mySchedules[0].id : undefined)
    setSelectedScheduleId(scheduleId ? String(scheduleId) : "")
    setUploadForm({
      title: cronograma?.title || "Entrega de proyecto",
      fase: "",
      archWord: null,
      archPdf: null,
    })
    setUploadError("")
    setUploadMessage("")
    setUploadModalOpen(true)
  }

  const handleUploadModalChange = (open: boolean) => {
    setUploadModalOpen(open)
    if (!open) {
      setSelectedScheduleId("")
      setUploadForm({
        title: "",
        fase: "",
        archWord: null,
        archPdf: null,
      })
      setUploadError("")
      setUploadMessage("")
    }
  }

  const handleCreateModalChange = (open: boolean) => {
    setShowCreateForm(open)
    if (!open) {
      setCreateError("")
      setCreateMessage("")
      setDocenteResults([])
      setStudentResults([])
      setSelectedEspecialidad(null)
    }
  }

  const setWordFile = (file: File | null) => {
    if (!file) {
      setUploadForm((prev) => ({ ...prev, archWord: null }))
      return
    }
    if (!/\.docx?$/i.test(file.name)) {
      setUploadError("El archivo Word debe ser .doc o .docx.")
      return
    }
    setUploadError("")
    setUploadForm((prev) => ({ ...prev, archWord: file }))
  }

  const setPdfFile = (file: File | null) => {
    if (!file) {
      setUploadForm((prev) => ({ ...prev, archPdf: null }))
      return
    }
    if (!/\.pdf$/i.test(file.name)) {
      setUploadError("El archivo PDF debe ser .pdf.")
      return
    }
    setUploadError("")
    setUploadForm((prev) => ({ ...prev, archPdf: file }))
  }

  const handleWordDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setWordDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setWordFile(file)
  }

  const handlePdfDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setPdfDragActive(false)
    const file = event.dataTransfer.files?.[0]
    if (file) setPdfFile(file)
  }

  const handleUploadEntrega = async () => {
    setUploadError("")
    setUploadMessage("")

    if (!selectedSchedule) {
      setUploadError("Selecciona un cronograma válido.")
      return
    }
    if (!studentProject) {
      setUploadError("No tienes un proyecto asignado para subir la entrega.")
      return
    }
    if (!uploadForm.title.trim()) {
      setUploadError("Ingresa un título para la entrega.")
      return
    }
    if (!uploadForm.fase.trim()) {
      setUploadError("Ingresa la fase de la entrega.")
      return
    }
    if (!uploadForm.archWord || !uploadForm.archPdf) {
      setUploadError("Adjunta el archivo Word y el PDF.")
      return
    }

    try {
      setUploading(true)
      await apiClient.entregas.upload({
        idAdmEntrega: selectedSchedule.id,
        idProyecto: studentProject.id,
        title: uploadForm.title.trim(),
        descripcion: `Fase: ${uploadForm.fase.trim()}`,
        archWord: uploadForm.archWord,
        archPdf: uploadForm.archPdf,
      })
      setUploadMessage("Entrega enviada correctamente.")
      handleUploadModalChange(false)
      fetchMySchedules()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir la entrega."
      setUploadError(message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Cronograma de Entregas</h1>
          <p className="text-muted-foreground">
            Gestión y visualización de las ventanas de entrega y revisiones.
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear cronograma
            </Button>
          )}
          {canCreate && (
            <Button variant="outline" onClick={() => setShowCronogramasModal(true)}>
              Ver cronogramas
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchEntregas} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {isStudent && (
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Entregas</CardTitle>
                <CardDescription>
                  Carga tus archivos dentro de la ventana activa. Necesitas Word y PDF.
                </CardDescription>
              </div>
              <Button
                onClick={() => openUploadModal()}
                className="flex items-center gap-2"
                disabled={!mySchedules.length || !studentProject}
              >
                <Upload className="w-4 h-4" />
                Crear entrega
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {mySchedulesError && (
              <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-md p-3 mb-4">
                {mySchedulesError}
              </div>
            )}
            {!studentProject && (
              <div className="bg-amber-50 text-amber-700 border border-amber-200 text-sm rounded-md p-3 mb-4">
                No se encontró un proyecto asociado a tu cuenta. Comunícate con tu docente para asignarlo.
              </div>
            )}

            {mySchedulesLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-primary/20 bg-muted/40">
                      <th className="text-left py-3 px-4 font-bold">Estudiante</th>
                      <th className="text-left py-3 px-4 font-bold">Fecha</th>
                      <th className="text-left py-3 px-4 font-bold">Docente TG</th>
                      <th className="text-left py-3 px-4 font-bold">Tutor</th>
                      <th className="text-left py-3 px-4 font-bold">Revisor 1</th>
                      <th className="text-left py-3 px-4 font-bold">Revisor 2</th>
                      <th className="text-left py-3 px-4 font-bold">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentDeliveries.length > 0 ? (
                      studentDeliveries.map(({ entrega, cronograma }) => {
                        const estadoDocTG = entrega.estadoDocTG ?? entrega.estadoRevDocTG
                        const estadoTutor = entrega.estadoDocTutor ?? entrega.estadoRevDocTutor
                        const estadoRev1 = entrega.estadoDocRev1 ?? entrega.estadoRevDocRev1
                        const estadoRev2 = entrega.estadoDocRev2 ?? entrega.estadoRevDocRev2
                        return (
                          <tr key={entrega.id} className="border-b hover:bg-muted/50 transition-colors align-top">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground">{studentLabel}</div>
                              <div className="text-xs text-muted-foreground">
                                {cronograma?.title || "Entrega"}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-xs text-muted-foreground">
                              {formatDateTime(entrega.entregaEstAt)}
                            </td>
                            <td className="py-3 px-4">{renderEstadoRevision(estadoDocTG)}</td>
                            <td className="py-3 px-4">{renderEstadoRevision(estadoTutor)}</td>
                            <td className="py-3 px-4">{renderEstadoRevision(estadoRev1)}</td>
                            <td className="py-3 px-4">{renderEstadoRevision(estadoRev2)}</td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-primary hover:text-primary/80"
                                onClick={() => {
                                  setSelectedEntregaDetail({ entrega, cronograma })
                                  setShowEntregaDetail(true)
                                }}
                              >
                                Ver detalles
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No tienes entregas registradas todavía.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showCronogramasModal} onOpenChange={setShowCronogramasModal}>
        <DialogContent className="w-[95vw] max-w-6xl max-h-[85vh] overflow-y-auto" overlayClassName="bg-black/60">
          <DialogHeader>
            <DialogTitle className="text-primary">Cronogramas creados</DialogTitle>
            <DialogDescription>
              Visualiza las ventanas de entrega registradas.
            </DialogDescription>
          </DialogHeader>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-md text-sm">{error}</div>}

          {loading && !entregas.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-primary/20 bg-muted/40">
                      <th className="text-left py-3 px-4 font-bold">Cronograma</th>
                      <th className="text-left py-3 px-4 font-bold">Responsable</th>
                      <th className="text-left py-3 px-4 font-bold">Gestión / Semestre</th>
                      <th className="text-left py-3 px-4 font-bold">Ventana</th>
                      <th className="text-left py-3 px-4 font-bold">Estado</th>
                      <th className="text-left py-3 px-4 font-bold">Asignaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.length > 0 ? (
                      entregas.map((entrega) => {
                        const totalEstudiantes =
                          entrega._count?.estudiantes ?? entrega.estudiantes?.length ?? 0
                        const totalEntregas = entrega._count?.entregas ?? entrega.entregas?.length ?? 0
                        return (
                          <tr key={entrega.id} className="border-b hover:bg-muted/50 transition-colors align-top">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground">{entrega.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {entrega.descripcion || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{getDocenteLabel(entrega)}</div>
                              <div className="text-xs text-muted-foreground">ID {entrega.idDocente}</div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="font-medium">
                                {entrega.gestion?.gestion ?? entrega.idGestion} • {entrega.semestre?.name ?? entrega.idSemestre}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Especialidad: {entrega.especialidad ?? entrega.idEspecialidad}
                              </div>
                            </td>
                            <td className="py-3 px-4 space-y-1">
                              <div className="text-xs text-muted-foreground">
                                Inicio: {formatDateTime(entrega.startAt)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Fin: {formatDateTime(entrega.endAt)}
                              </div>
                              {renderWindowBadge(entrega)}
                            </td>
                            <td className="py-3 px-4 space-y-1">
                              {getStatusBadge(entrega.isActive)}
                            </td>
                            <td className="py-3 px-4 text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Estudiantes: {totalEstudiantes}</Badge>
                                <Badge variant="outline">Entregas: {totalEntregas}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created: {formatDateTime(entrega.createdAt)}
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No hay entregas programadas disponibles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showCreateForm} onOpenChange={handleCreateModalChange}>
        <DialogContent
          className="w-[95vw] max-w-4xl"
          overlayClassName="bg-black/60"
        >
          <DialogHeader>
            <DialogTitle className="text-primary">Crear cronograma</DialogTitle>
            <DialogDescription>
              Completa los campos requeridos. Selecciona estudiantes por filtros y agrega manualmente si hace falta.
            </DialogDescription>
          </DialogHeader>

          {createError && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-md p-3">{createError}</div>
          )}
          {createMessage && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm rounded-md p-3">
              {createMessage}
            </div>
          )}

          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Título</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Entrega final de proyecto"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Docente responsable</label>
                <Input
                  value={docenteSearch}
                  onChange={(e) => {
                    setDocenteSearch(e.target.value)
                    if (!e.target.value) {
                      setSelectedDocente(null)
                      setForm((prev) => ({ ...prev, idDocente: "" }))
                    }
                  }}
                  placeholder="Buscar por nombre"
                />
                {docenteLoading && <p className="text-xs text-muted-foreground">Buscando docentes...</p>}
                {selectedDocente && (
                  <div className="flex items-center justify-between rounded-md border border-muted px-3 py-2 text-sm">
                    <span className="text-foreground">{selectedDocente.nombreCompleto}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDocente(null)
                        setForm((prev) => ({ ...prev, idDocente: "" }))
                        setDocenteSearch("")
                      }}
                    >
                      Quitar
                    </Button>
                  </div>
                )}
                {!selectedDocente && docenteResults.length > 0 && (
                  <div className="rounded-md border border-muted bg-background max-h-40 overflow-y-auto">
                    {docenteResults.map((docente) => (
                      <button
                        key={docente.id}
                        type="button"
                        onClick={() => {
                          setSelectedDocente(docente)
                          setForm((prev) => ({ ...prev, idDocente: String(docente.id) }))
                          setDocenteSearch(docente.nombreCompleto)
                          setDocenteResults([])
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted"
                      >
                        {docente.nombreCompleto}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Gestión</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.idGestion}
                  onChange={(e) => setForm({ ...form, idGestion: e.target.value })}
                  disabled={catalogLoading}
                >
                  <option value="">Seleccione gestión</option>
                  {gestiones.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.gestion} {g.typeGestion ? `(${g.typeGestion})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Semestre</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.idSemestre}
                  onChange={(e) => setForm({ ...form, idSemestre: e.target.value })}
                  disabled={catalogLoading}
                >
                  <option value="">Seleccione semestre</option>
                  {semestres.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                  </select>
                </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Especialidad</label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.idEspecialidad}
                  onChange={(e) => {
                    const value = e.target.value
                    const found = especialidades.find((item) => item.idEspecialidad === Number(value))
                    const label = e.target.selectedOptions[0]?.text ?? ""
                    const parsedLabel = label.split("(")[0]?.trim()
                    setSelectedEspecialidad(
                      found ??
                        (value
                          ? {
                              idEspecialidad: Number(value),
                              especialidad: parsedLabel || label,
                              idNivelAcad: 0,
                              nivelAcad: "",
                            }
                          : null),
                    )
                    setForm({ ...form, idEspecialidad: value })
                  }}
                  disabled={catalogLoading}
                >
                  <option value="">Seleccione especialidad</option>
                  {especialidades.map((e) => (
                    <option key={e.idEspecialidad} value={e.idEspecialidad}>
                      {e.especialidad} ({e.nivelAcad})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de inicio</label>
                <Input
                  type="datetime-local"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de cierre</label>
                <Input
                  type="datetime-local"
                  value={form.endAt}
                  onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <Textarea
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Instrucciones para la entrega, formatos, etc."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estudiantes seleccionados</label>
              {autoStudentsLoading ? (
                <p className="text-xs text-muted-foreground">Cargando estudiantes según filtros...</p>
              ) : (
                <>
                  {autoStudentsError && <p className="text-xs text-red-600">{autoStudentsError}</p>}
                  {!form.idGestion || !form.idSemestre || !form.idEspecialidad ? (
                    <p className="text-xs text-muted-foreground">
                      Selecciona gestión, semestre y especialidad para cargar estudiantes automáticamente.
                    </p>
                  ) : selectedStudents.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No hay estudiantes para los filtros seleccionados.
                    </p>
                  ) : (
                    <div className="max-h-44 overflow-y-auto">
                      <div className="flex flex-wrap gap-2">
                        {selectedStudents.map((student) => (
                          <div
                            key={student.id}
                            className="flex items-center gap-2 rounded-full border border-muted bg-muted/40 px-3 py-1 text-xs"
                          >
                            <span className="font-medium">{student.nombreCompleto}</span>
                            <span className="text-muted-foreground">{student.ci ? `CI ${student.ci}` : "CI N/D"}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedStudents((prev) => prev.filter((item) => item.id !== student.id))
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              Quitar
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <div className="space-y-2 pt-3">
                <label className="text-sm font-medium">Agregar estudiante (nombre o CI)</label>
                <Input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Ej: Perez o 1234567"
                />
                {studentLoading && <p className="text-xs text-muted-foreground">Buscando estudiantes...</p>}
                {studentResults.length > 0 && (
                  <div className="rounded-md border border-muted bg-background max-h-40 overflow-y-auto">
                    {studentResults.map((student) => {
                      const alreadySelected = selectedStudents.some((item) => item.id === student.id)
                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            if (alreadySelected) return
                            setSelectedStudents((prev) => [...prev, student])
                            setStudentSearch("")
                            setStudentResults([])
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted disabled:opacity-60"
                          disabled={alreadySelected}
                        >
                          <span className="font-medium">{student.nombreCompleto}</span>
                          {student.ci ? <span className="text-xs text-muted-foreground"> • CI {student.ci}</span> : null}
                          {alreadySelected ? <span className="text-xs text-muted-foreground"> • Ya agregado</span> : null}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.isActive}
                onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                id="isActive"
              />
              <label htmlFor="isActive" className="text-sm">
                Activar cronograma al crear
              </label>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => handleCreateModalChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateCronograma} disabled={creating}>
              {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
              {creating ? "Creando..." : "Guardar cronograma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={uploadModalOpen} onOpenChange={handleUploadModalChange}>
        <DialogContent className="w-[95vw] max-w-lg" overlayClassName="bg-black/60">
          <DialogHeader>
            <DialogTitle className="text-primary">Subir entrega</DialogTitle>
            <DialogDescription>
              Adjunta tu Word y PDF para la entrega del proyecto.
            </DialogDescription>
          </DialogHeader>

          {uploadError && (
            <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-md p-3">{uploadError}</div>
          )}
          {uploadMessage && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm rounded-md p-3">
              {uploadMessage}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cronograma</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedScheduleId}
                onChange={(e) => setSelectedScheduleId(e.target.value)}
              >
                <option value="">Seleccione cronograma</option>
                {mySchedules.map((schedule) => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.title}
                  </option>
                ))}
              </select>
              {selectedSchedule && (
                <p className="text-xs text-muted-foreground">
                  Ventana: {formatDateTime(selectedSchedule.startAt)} - {formatDateTime(selectedSchedule.endAt)}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Título de entrega</label>
              <Input
                value={uploadForm.title}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Ej: Entrega parcial"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fase</label>
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={uploadForm.fase}
                onChange={(e) => setUploadForm((prev) => ({ ...prev, fase: e.target.value }))}
              >
                <option value="">Seleccione fase</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.name}>
                    {phase.name}
                  </option>
                ))}
              </select>
              {phasesLoading && <p className="text-xs text-muted-foreground">Cargando fases...</p>}
              {phasesError && <p className="text-xs text-red-600">{phasesError}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo Word</label>
              <div
                className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed px-4 py-6 text-sm ${
                  wordDragActive ? "border-primary bg-primary/5" : "border-muted"
                }`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setWordDragActive(true)
                }}
                onDragLeave={() => setWordDragActive(false)}
                onDrop={handleWordDrop}
                onClick={() => wordInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    wordInputRef.current?.click()
                  }
                }}
              >
                {wordDragActive && (
                  <div className="pointer-events-none absolute inset-0 bg-primary/10 ring-2 ring-primary/40" />
                )}
                <p className="font-medium">
                  {uploadForm.archWord ? uploadForm.archWord.name : "Arrastra tu Word o haz clic"}
                </p>
                <p className="text-xs text-muted-foreground">Formatos .doc o .docx</p>
                <Input
                  ref={wordInputRef}
                  type="file"
                  accept=".doc,.docx"
                  className="hidden"
                  onChange={(e) => setWordFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Archivo PDF</label>
              <div
                className={`relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-md border-2 border-dashed px-4 py-6 text-sm ${
                  pdfDragActive ? "border-primary bg-primary/5" : "border-muted"
                }`}
                onDragOver={(event) => {
                  event.preventDefault()
                  setPdfDragActive(true)
                }}
                onDragLeave={() => setPdfDragActive(false)}
                onDrop={handlePdfDrop}
                onClick={() => pdfInputRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    pdfInputRef.current?.click()
                  }
                }}
              >
                {pdfDragActive && (
                  <div className="pointer-events-none absolute inset-0 bg-primary/10 ring-2 ring-primary/40" />
                )}
                <p className="font-medium">
                  {uploadForm.archPdf ? uploadForm.archPdf.name : "Arrastra tu PDF o haz clic"}
                </p>
                <p className="text-xs text-muted-foreground">Formato .pdf</p>
                <Input
                  ref={pdfInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => handleUploadModalChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUploadEntrega} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
              {uploading ? "Subiendo..." : "Enviar entrega"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showEntregaDetail}
        onOpenChange={(open) => {
          setShowEntregaDetail(open)
          if (!open) setSelectedEntregaDetail(null)
        }}
      >
        <DialogContent className="w-[95vw] max-w-lg" overlayClassName="bg-black/60">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalle de entrega</DialogTitle>
            <DialogDescription>Estado de revisión por docente.</DialogDescription>
          </DialogHeader>

          {selectedEntregaDetail ? (
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Estudiante</p>
                <p className="font-medium">{studentLabel}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Cronograma</p>
                <p className="font-medium">{selectedEntregaDetail.cronograma?.title || "Entrega"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fecha de envío</p>
                <p className="font-medium">{formatDateTime(selectedEntregaDetail.entrega.entregaEstAt)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Título</p>
                <p className="font-medium">{selectedEntregaDetail.entrega.title}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fase</p>
                <p className="font-medium">
                  {(selectedEntregaDetail.entrega.descripcion || "").replace(/^Fase:\s*/i, "") || "N/D"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Docente TG</p>
                  {renderEstadoRevision(
                    selectedEntregaDetail.entrega.estadoDocTG ?? selectedEntregaDetail.entrega.estadoRevDocTG,
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tutor</p>
                  {renderEstadoRevision(
                    selectedEntregaDetail.entrega.estadoDocTutor ?? selectedEntregaDetail.entrega.estadoRevDocTutor,
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revisor 1</p>
                  {renderEstadoRevision(
                    selectedEntregaDetail.entrega.estadoDocRev1 ?? selectedEntregaDetail.entrega.estadoRevDocRev1,
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revisor 2</p>
                  {renderEstadoRevision(
                    selectedEntregaDetail.entrega.estadoDocRev2 ?? selectedEntregaDetail.entrega.estadoRevDocRev2,
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">No hay datos de entrega.</div>
          )}

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowEntregaDetail(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
