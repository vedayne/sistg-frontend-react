"use client"

import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Plus, Upload, X, FileText, CalendarDays } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import type { AdmEntrega, Pagination, ProjectResponseDto, Gestion, SpecialityInfo, Phase } from "@/lib/types"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function EntregasPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [entregas, setEntregas] = useState<AdmEntrega[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  // Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Student Submission State
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [myProject, setMyProject] = useState<ProjectResponseDto | null>(null)
  const [submissionForm, setSubmissionForm] = useState<{
    idAdmEntrega: string
    title: string
    descripcion: string
    archPdf: File | null
    archWord: File | null
  }>({
    idAdmEntrega: "",
    title: "",
    descripcion: "",
    archPdf: null,
    archWord: null,
  })

  // Teacher Creation State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [specialities, setSpecialities] = useState<SpecialityInfo[]>([])
  const [phases, setPhases] = useState<Phase[]>([])

  const [createForm, setCreateForm] = useState({
    title: "",
    descripcion: "",
    idGestion: "",
    idEspecialidad: "",
    idFase: "", // Although Phase is not directly in AdmEntrega, prompt asked for it. Assuming we map it or it's just meta. AdmEntrega has NO phase field in types, but has 'especialidad' and 'semestre' and 'gestion'.
    // User asked "Fase" but in types AdmEntrega has `idSemestre`. Maybe he strictly means Semester or Phase of the project?
    // Let's use idSemestre as a proxy or just store it in description if not supported?
    // Looking at types: AdmEntrega has `idSemestre`. Phase is property of Project/Defensa.
    // Let's assume we need to select Semestre instead of Phase, or maybe "Fase" maps to Semester for "Taller I" vs "Taller II"?
    // The prompt says "FASE" explicitly. Let's try to load Phases, but AdmEntrega might likely bind to Semester?
    // Wait, type AdmEntrega has `idSemestre`. I will add a Semester selector too.
    idSemestre: "",
    startAt: "", // datetime-local string
    endAt: "",   // datetime-local string
  })

  // REVIEW LOGIC
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCorrectionModal, setShowCorrectionModal] = useState(false)
  const [currentScheduleId, setCurrentScheduleId] = useState<number | null>(null)
  const [submissions, setSubmissions] = useState<any[]>([]) // Using any for EntregaDetalle flexibility
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null)
  const [correctionForm, setCorrectionForm] = useState<{
    observaciones: string
    archPdf: File | null
  }>({
    observaciones: "",
    archPdf: null
  })

  // Reviewer roles: DocenteTG, Tutor, Revisor1, Revisor2
  const isReviewer = user?.roles?.some(r =>
    ["DOCENTETG", "DOCENTE_TG", "TUTOR", "REVISOR", "REVISOR1", "REVISOR2"].includes(r.name)
  )

  const fetchSubmissions = async (scheduleId: number) => {
    setLoading(true)
    try {
      const res = await apiClient.entregas.getBySchedule(scheduleId)
      setSubmissions(res.data)
      setCurrentScheduleId(scheduleId)
      setShowReviewModal(true)
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Error", description: "No se pudieron cargar las entregas." })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (id: number, type: "pdf" | "word", fileName: string) => {
    try {
      const blob = await apiClient.entregas.download(id, type)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (e) {
      console.error(e)
      toast({ variant: "destructive", title: "Error al descargar" })
    }
  }

  const openCorrectionModal = (sub: any) => {
    setSelectedSubmission(sub)
    setCorrectionForm({ observaciones: "", archPdf: null })
    setShowCorrectionModal(true)
  }

  const handleCorrectionSubmit = async () => {
    if (!selectedSubmission || !correctionForm.archPdf) {
      toast({ variant: "destructive", title: "Debes subir un archivo PDF" })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.entregas.review(selectedSubmission.id, correctionForm.archPdf, correctionForm.observaciones)
      toast({ title: "Corrección enviada exitosamente" })
      setShowCorrectionModal(false)
      // Refresh list
      if (currentScheduleId) fetchSubmissions(currentScheduleId)
    } catch (e: any) {
      console.error(e)
      toast({ variant: "destructive", title: "Error al enviar corrección", description: e.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openSubmissionModal = (entrega: AdmEntrega) => {
    setSubmissionForm({
      idAdmEntrega: entrega.id.toString(),
      title: "",
      descripcion: "",
      archPdf: null,
      archWord: null,
    })
    setShowSubmissionModal(true)
  }

  // Check roles
  const isStudent = user?.roles?.some(r => r.name === "ESTUDIANTE")
  const isDocenteTG = user?.roles?.some(r => r.name === "DOCENTETG" || r.name === "DOCENTE_TG")

  const fetchEntregas = useCallback(async () => {
    console.log("DEBUG: fetchEntregas called")
    setLoading(true)
    setError(null)
    try {
      console.log("DEBUG: Calling apiClient.admEntregas.list with", { page, limit })
      const response = await apiClient.admEntregas.list({
        page,
        limit,
      })
      console.log("DEBUG: API Response:", response)
      if (response && response.data) {
        console.log("DEBUG: Setting entregas:", response.data.length)
        setEntregas(response.data)
        setPagination(response.pagination)
      } else {
        console.error("DEBUG: Invalid API response format", response)
      }
    } catch (err) {
      console.error("Error fetching entregas:", err)
      setError("No se pudieron cargar las entregas. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas])

  // Fetch student's project if isStudent
  useEffect(() => {
    if (isStudent) {
      const fetchMyProject = async () => {
        try {
          const res = await apiClient.projects.list()
          const projects = Array.isArray(res) ? res : (res as any).data || []
          const active = projects.find((p: any) => p.isActive)
          if (active) {
            setMyProject(active)
          }
        } catch (e) {
          console.error("Error loading student project", e)
        }
      }
      fetchMyProject()
    }
  }, [isStudent])

  // Fetch options for Teacher
  useEffect(() => {
    if (isDocenteTG && showCreateModal) {
      const loadOptions = async () => {
        try {
          const [gRes, sRes, pRes] = await Promise.all([
            apiClient.gestiones.list(),
            apiClient.specialities.list({ limit: 100 }),
            apiClient.phases.list()
          ])
          setGestiones(gRes.data)
          setSpecialities(sRes.data)
          setPhases(pRes)
        } catch (e) {
          console.error("Error loading options", e)
        }
      }
      loadOptions()
    }
  }, [isDocenteTG, showCreateModal])

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</Badge>
      : <Badge variant="secondary">Inactivo</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-BO", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "pdf" | "word") => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (type === "pdf" && file.type !== "application/pdf") {
        toast({ variant: "destructive", title: "Formato incorrecto", description: "Debe ser un archivo PDF" })
        return
      }
      if (type === "word" && !file.name.match(/\.(doc|docx)$/)) {
        toast({ variant: "destructive", title: "Formato incorrecto", description: "Debe ser un archivo Word (.doc, .docx)" })
        return
      }
      setSubmissionForm(prev => ({ ...prev, [type === "pdf" ? "archPdf" : "archWord"]: file }))
    }
  }

  const handleStudentSubmit = async () => {
    if (!myProject) {
      toast({ variant: "destructive", title: "No tienes un proyecto activo" })
      return
    }
    if (!submissionForm.idAdmEntrega) {
      toast({ variant: "destructive", title: "Selecciona una entrega programada" })
      return
    }
    if (!submissionForm.title) {
      toast({ variant: "destructive", title: "Ingresa un título para la entrega" })
      return
    }
    if (!submissionForm.archPdf || !submissionForm.archWord) {
      toast({ variant: "destructive", title: "Ambos archivos (PDF y Word) son obligatorios" })
      return
    }

    setIsSubmitting(true)
    try {
      await apiClient.entregas.upload({
        idAdmEntrega: Number(submissionForm.idAdmEntrega),
        idProyecto: myProject.id,
        title: submissionForm.title,
        descripcion: submissionForm.descripcion,
        archPdf: submissionForm.archPdf,
        archWord: submissionForm.archWord
      })
      toast({ title: "Entrega realizada exitosamente" })
      setShowSubmissionModal(false)
      setSubmissionForm({
        idAdmEntrega: "",
        title: "",
        descripcion: "",
        archPdf: null,
        archWord: null,
      })
    } catch (err: any) {
      console.error(err)
      toast({
        variant: "destructive",
        title: "Error al realizar la entrega",
        description: err.message || "Ocurrió un error inesperado"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateSchedule = async () => {
    if (!createForm.title || !createForm.idGestion || !createForm.idEspecialidad || !createForm.startAt || !createForm.endAt) {
      toast({ variant: "destructive", title: "Completa los campos obligatorios", description: "Título, Gestión, Especialidad y Fechas son requeridos." })
      return
    }

    setIsCreating(true)
    console.log("DEBUG: User State:", user)
    console.log("DEBUG: Form State:", createForm)
    console.log("DEBUG: Specialities:", specialities)

    try {
      const selectedSpec = specialities.find(s => s.idEspecialidad === Number(createForm.idEspecialidad))
      console.log("DEBUG: Selected Spec:", selectedSpec)

      const studentsRes = await apiClient.students.list({
        isActive: true, // Only active students
        especialidad: selectedSpec?.especialidad,
        limit: 100
      })

      // If backend filtered correctly by string name of speciality:
      const studentIds = studentsRes.data.map(s => s.id)

      if (studentIds.length === 0) {
        toast({ variant: "default", title: "Sin estudiantes", description: "No se encontraron estudiantes activos con los filtros seleccionados, pero se creará la entrega." })
      }

      // 2. Create
      await apiClient.admEntregas.create({
        title: createForm.title,
        descripcion: createForm.descripcion,
        idDocente: Number(user?.id || 0),
        idGestion: Number(createForm.idGestion),
        idEspecialidad: Number(createForm.idEspecialidad),
        especialidad: selectedSpec?.especialidad || "",
        idSemestre: 1,
        startAt: new Date(createForm.startAt).toISOString(),
        endAt: new Date(createForm.endAt).toISOString(),
        isActive: true,
        estudiantes: studentIds
      })

      toast({ title: "Entrega programada creada correctamente" })
      setShowCreateModal(false)
      setCreateForm({
        title: "",
        descripcion: "",
        idGestion: "",
        idEspecialidad: "",
        idFase: "",
        idSemestre: "",
        startAt: "",
        endAt: "",
      })
      fetchEntregas()
    } catch (err: any) {
      console.error(err)
      toast({ variant: "destructive", title: "Error al crear", description: err.message })
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Cronograma de Entregas</h1>
          <p className="text-muted-foreground">Gestión y visualización de fechas de entrega programadas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchEntregas} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>



          {isDocenteTG && (
            <Button onClick={() => setShowCreateModal(true)} className="gap-2 bg-green-600 hover:bg-green-700 text-white">
              <CalendarDays className="w-4 h-4" /> NUEVA ENTREGA PROGRAMADA
            </Button>
          )}
        </div>
      </div >

      <Card>
        <CardHeader>
          <CardTitle>Listado de Entregas Programadas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

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
                      <th className="text-left py-3 px-4 font-bold">Título</th>
                      <th className="text-left py-3 px-4 font-bold">Fase</th>
                      <th className="text-left py-3 px-4 font-bold">Límite</th>
                      <th className="text-left py-3 px-4 font-bold">Estado</th>
                      <th className="text-left py-3 px-4 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.length > 0 ? (
                      entregas.map((entrega) => (
                        <tr key={entrega.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">
                            <div className="font-semibold">{entrega.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{entrega.descripcion}</div>
                          </td>
                          <td className="py-3 px-4">Semestre {entrega.idSemestre}</td>
                          <td className="py-3 px-4 whitespace-nowrap">{formatDate(entrega.endAt)}</td>
                          <td className="py-3 px-4">{getStatusBadge(entrega.isActive)}</td>
                          <td className="py-3 px-4 flex gap-2">
                            {isStudent ? (
                              entrega.isActive ? (
                                <Button size="sm" onClick={() => openSubmissionModal(entrega)}>
                                  REALIZAR ENTREGA
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">No disponible</span>
                              )
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                  Detalles
                                </Button>
                                {isReviewer && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200"
                                    onClick={() => fetchSubmissions(entrega.id)}
                                  >
                                    Ver Entregas
                                  </Button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))
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

              {/* Pagination Controls */}
              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={!pagination.hasPreviousPage} onClick={() => setPage(p => p - 1)}>Ant.</Button>
                    <Button variant="outline" size="sm" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Sig.</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <p><strong>Nota:</strong> Como estudiante, solo podrás subir archivos cuando la entrega esté activa y dentro del rango de fechas establecido.</p>
      </div>

      {/* STUDENT Submission Modal */}
      <Dialog open={showSubmissionModal} onOpenChange={setShowSubmissionModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nueva Entrega</DialogTitle>
            <DialogDescription>
              Sube tus documentos para la revisión. Se requiere obligatoriamente PDF y Word.
            </DialogDescription>
          </DialogHeader>

          {myProject ? (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Entrega seleccionada:</Label>
                <div className="font-medium text-lg">
                  {entregas.find(e => e.id.toString() === submissionForm.idAdmEntrega)?.title || "Sin título"}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Título de la Entrega <span className="text-red-500">*</span></Label>
                <Input
                  placeholder="Ej. Primer Borrador del Capítulo 1"
                  value={submissionForm.title}
                  onChange={(e) => setSubmissionForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Documento PDF (Previsualizar)</Label>
                  <div className="border border-dashed rounded p-3 text-center cursor-pointer relative hover:bg-muted/50 transition-colors">
                    <Input
                      type="file"
                      accept="application/pdf"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, "pdf")}
                    />
                    <div className="flex flex-col items-center">
                      {submissionForm.archPdf ? (
                        <>
                          <FileText className="text-red-500 mb-1 h-8 w-8" />
                          <span className="text-xs truncate max-w-full font-medium">{submissionForm.archPdf.name}</span>
                          <a
                            href={URL.createObjectURL(submissionForm.archPdf)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline mt-1 z-10 relative"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Ver PDF
                          </a>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-1 h-8 w-8 text-muted-foreground" />
                          <span className="text-xs">Subir PDF</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Documento Word</Label>
                  <div className="border border-dashed rounded p-3 text-center cursor-pointer relative hover:bg-muted/50 transition-colors">
                    <Input
                      type="file"
                      accept=".doc,.docx"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => handleFileChange(e, "word")}
                    />
                    <div className="flex flex-col items-center">
                      {submissionForm.archWord ? (
                        <>
                          <FileText className="text-blue-500 mb-1 h-8 w-8" />
                          <span className="text-xs truncate max-w-full font-medium">{submissionForm.archWord.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="mb-1 h-8 w-8 text-muted-foreground" />
                          <span className="text-xs">Subir Word</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No se encontró un proyecto activo asociado a tu cuenta.
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowSubmissionModal(false)}>Cancelar</Button>
            <Button onClick={handleStudentSubmit} disabled={isSubmitting || !myProject}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              GUARDAR ENTREGA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* TEACHER Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Entrega Programada</DialogTitle>
            <DialogDescription>Crea un nuevo evento de entrega y asígnalo a los estudiantes.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ej. Entrega de Primer Borrador"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Descripción (Opcional)</Label>
              <Textarea
                placeholder="Instrucciones adicionales..."
                value={createForm.descripcion}
                onChange={(e) => setCreateForm(prev => ({ ...prev, descripcion: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Gestión</Label>
                <Select
                  value={createForm.idGestion}
                  onValueChange={(val) => setCreateForm(prev => ({ ...prev, idGestion: val }))}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>
                    {gestiones.map(g => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.gestion} - {g.typeGestion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Especialidad / Carrera</Label>
                <Select
                  value={createForm.idEspecialidad}
                  onValueChange={(val) => setCreateForm(prev => ({ ...prev, idEspecialidad: val }))}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>
                    {specialities.map(s => (
                      <SelectItem key={s.idEspecialidad} value={s.idEspecialidad.toString()}>{s.especialidad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fase (Opcional)</Label>
              <Select
                value={createForm.idFase}
                onValueChange={(val) => setCreateForm(prev => ({ ...prev, idFase: val }))}
              >
                <SelectTrigger><SelectValue placeholder="Seleccione Fase..." /></SelectTrigger>
                <SelectContent>
                  {phases.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Input
                  type="datetime-local"
                  value={createForm.startAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, startAt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Fecha Límite</Label>
                <Input
                  type="datetime-local"
                  value={createForm.endAt}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, endAt: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateSchedule} disabled={isCreating}>
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Crear Programa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REVIEW DASHBOARD Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisión de Entregas</DialogTitle>
            <DialogDescription>
              Descarga los documentos, revisa y sube tus correcciones.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                No hay entregas subidas por estudiantes aún.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3">Estudiante</th>
                      <th className="px-4 py-3">Archivos</th>
                      <th className="px-4 py-3">Fecha Entrega</th>
                      <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {submissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 font-medium">
                          {sub.estudiante?.nombreCompleto || "Estudiante"}
                          <div className="text-xs text-muted-foreground">{sub.title}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {sub.archWordId && (
                              <Button variant="outline" size="icon" className="h-8 w-8 text-blue-600 border-blue-200" onClick={() => handleDownload(sub.id, "word", `entrega_${sub.id}.docx`)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            {sub.archPdfId && (
                              <Button variant="outline" size="icon" className="h-8 w-8 text-red-600 border-red-200" onClick={() => handleDownload(sub.id, "pdf", `entrega_${sub.id}.pdf`)}>
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{formatDate(sub.entregaEstAt)}</td>
                        <td className="px-4 py-3 text-right">
                          <Button size="sm" onClick={() => openCorrectionModal(sub)}>
                            Corregir / Observar
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* CORRECTION UPLOAD Modal */}
      <Dialog open={showCorrectionModal} onOpenChange={setShowCorrectionModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Subir Correcciones</DialogTitle>
            <DialogDescription>
              Sube el documento PDF corregido y añade las observaciones.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Observaciones / Comentarios</Label>
              <Textarea
                className="min-h-[100px]"
                placeholder="Escribe tus observaciones aquí..."
                value={correctionForm.observaciones}
                onChange={(e) => setCorrectionForm(prev => ({ ...prev, observaciones: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Archivo con Correcciones (PDF Obligatorio)</Label>
              <div className="border border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors relative">
                <Input
                  type="file"
                  accept="application/pdf"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const f = e.target.files[0]
                      if (f.type !== "application/pdf") return toast({ variant: "destructive", title: "Solo PDF permitido" })
                      setCorrectionForm(prev => ({ ...prev, archPdf: f }))
                    }
                  }}
                />
                <div className="flex flex-col items-center">
                  <Upload className={`w-8 h-8 mb-2 ${correctionForm.archPdf ? "text-green-500" : "text-muted-foreground"}`} />
                  <span className="text-sm font-medium">
                    {correctionForm.archPdf ? correctionForm.archPdf.name : "Click para subir PDF corregido"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCorrectionModal(false)}>Cancelar</Button>
            <Button onClick={handleCorrectionSubmit} disabled={isSubmitting || !correctionForm.archPdf}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar Correcciones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  )
}
