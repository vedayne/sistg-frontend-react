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
import { openNotaServicioWindow } from "@/components/reportes/nota-servicio"
import { Label } from "@/components/ui/label"

export default function ProyectosPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [proyectos, setProyectos] = useState<ProjectResponseDto[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailProject, setDetailProject] = useState<ProjectResponseDto | null>(null)
  const [detailActive, setDetailActive] = useState<boolean>(true)
  const [detailNotaFecha, setDetailNotaFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [detailNotaCite, setDetailNotaCite] = useState("")
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [phases, setPhases] = useState<Phase[]>([])
  const [phasesLoading, setPhasesLoading] = useState(false)
  const [faseSelected, setFaseSelected] = useState("")

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
      const today = new Date().toISOString().slice(0, 10)
      setDetailNotaFecha(today)
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
      setDetailLoading(true)
      await apiClient.projects.update(detailProject.id, { isActive: detailActive })
      toast({ title: "Proyecto actualizado" })
      setDetailOpen(false)
      fetchData()
    } catch (err: any) {
      console.error(err)
      toast({ variant: "destructive", title: "No se pudo actualizar", description: err?.message })
    } finally {
      setDetailLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Load dropdown data when opening modal
  useEffect(() => {
    if (showCreateModal) {
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
  }, [showCreateModal])

  useEffect(() => {
    if (showNotaModal && phases.length === 0) {
      const loadPhases = async () => {
        try {
          setPhasesLoading(true)
          const res = await apiClient.phases.list()
          setPhases(res as any)
          setFaseSelected((res as any)[0]?.name || "")
        } catch (err) {
          console.error(err)
        } finally {
          setPhasesLoading(false)
        }
      }
      loadPhases()
    }
  }, [showNotaModal, phases.length])

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
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalle del Proyecto</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" /> Cargando...
            </div>
          ) : detailProject ? (
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Título</p>
                <p className="font-semibold">{detailProject.titulo}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Estudiante</p>
                  <p className="font-medium">{detailProject.estudiante?.nombreCompleto || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Gestión</p>
                  <Badge variant="outline">{detailProject.gestion?.gestion || "-"}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Línea de Investigación</p>
                  <p className="font-medium">{detailProject.lineaInvestigacion?.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Modalidad</p>
                  <p className="font-medium">{detailProject.modalidad?.name || "-"}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Docente TG</p>
                  <p className="font-medium">{detailProject.docenteTG?.nombreCompleto || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Tutor</p>
                  <p className="font-medium">{detailProject.docenteTutor?.nombreCompleto || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revisor 1</p>
                  <p className="font-medium">{detailProject.docenteRev1?.nombreCompleto || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Revisor 2</p>
                  <p className="font-medium">{detailProject.docenteRev2?.nombreCompleto || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-sm">Estado:</p>
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
              <div className="border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const today = new Date().toISOString().slice(0, 10)
                      setDetailNotaFecha(today)
                      setDetailNotaCite(`CITE-${detailProject.id}-${new Date().getFullYear()}`)
                      setFaseSelected(phases[0]?.name || "")
                      setShowNotaModal(true)
                    }}
                  >
                    Generar Nota de Servicio
                  </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No se pudo cargar el proyecto.</p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Cerrar</Button>
            <Button onClick={handleUpdateDetail} disabled={detailLoading || !detailProject}>
              {detailLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />} Guardar cambios
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
              onClick={() => {
                const fechaLegible = detailNotaFecha
                  ? new Date(detailNotaFecha).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
                  : ""
                openNotaServicioWindow({
                  fecha: fechaLegible,
                  cite: detailNotaCite || `CITE-${detailProject?.id ?? ""}-${new Date().getFullYear()}`,
                  tituloProyecto: detailProject?.titulo || "",
                  postulante: detailProject?.estudiante?.nombreCompleto || "",
                  tutor: detailProject?.docenteTutor?.nombreCompleto || "",
                  revisor1: detailProject?.docenteRev1?.nombreCompleto || "",
                  docenteTG: detailProject?.docenteTG?.nombreCompleto || "",
                  revisor2: detailProject?.docenteRev2?.nombreCompleto || "",
                  fase: faseSelected,
                  jefeCarrera: detailProject?.userJefeC?.nombreCompleto || detailProject?.userJefeC?.email || "JEFE DE CARRERA",
                  gradoJefe: detailProject?.userJefeC?.grado || "",
                })
                setShowNotaModal(false)
              }}
              disabled={!detailProject}
            >
              Generar
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
        <DialogContent className="max-w-6xl md:max-w-7xl max-h-[85vh] overflow-y-auto">
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
                            <p className="text-xs text-muted-foreground">{t.email || t.codDocente || t.idSaga}</p>
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
