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
import type { ProjectResponseDto, CreateProjectDto, ResearchLine, Gestion, EstudianteBasicInfo, DocenteBasicInfo } from "@/lib/types"

export default function ProyectosPage() {
  const { user } = useAuth()
  const [proyectos, setProyectos] = useState<ProjectResponseDto[]>([])
  const [loading, setLoading] = useState(false)

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<EstudianteBasicInfo | null>(null)
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentSearchResults, setStudentSearchResults] = useState<EstudianteBasicInfo[]>([])
  const [searchLoading, setSearchLoading] = useState(false)

  // Dropdown Data
  const [researchLines, setResearchLines] = useState<ResearchLine[]>([])
  const [gestiones, setGestiones] = useState<Gestion[]>([])

  // Form State
  const [formData, setFormData] = useState<Partial<CreateProjectDto>>({
    titulo: "",
    idLineaInv: 0,
    idGestion: 0,
    idDocTG: 0, // Should be selected
    idDocTutor: 0,
    idModalidad: 1 // Default to 1 for now if we don't have modalities API
  })

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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Load dropdown data when opening modal
  useEffect(() => {
    if (showCreateModal) {
      const loadOptions = async () => {
        try {
          const [linesRes, gestionesRes] = await Promise.all([
            apiClient.researchLines.list(),
            apiClient.gestiones.list()
          ])

          setResearchLines(Array.isArray(linesRes) ? linesRes : (linesRes as any).data || [])

          // Gestiones: handle array/pagination
          const gestionesData = Array.isArray(gestionesRes) ? gestionesRes : (gestionesRes as any).data || []
          setGestiones(gestionesData.filter((g: any) => g.isActive)) // Only active gestiones

        } catch (e) {
          console.error("Error loading options", e)
        }
      }
      loadOptions()
    }
  }, [showCreateModal])

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
    if (term.length < 3) return
    setSearchLoading(true)
    try {
      const res = await apiClient.students.list({ search: term, limit: 5 })
      setStudentSearchResults(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setSearchLoading(false)
    }
  }

  const handleCreateRequest = async () => {
    // Validate
    if (!formData.titulo || !formData.idLineaInv || !formData.idGestion) {
      alert("Faltan campos obligatorios")
      return
    }

    // Determine Student ID
    let studentId = selectedStudent?.id
    if (isStudent) {
      // If I am student, I need my own ID.
      // Attempt to get it from context or assume backend handles it?
      // The DTO requires idEstudiante.
      // use idSaga if available as a fallback guess
      studentId = user?.academico?.idSaga || (user?.id ? parseInt(user.id) : 0)
    }

    if (!studentId) {
      alert("No se ha identificado el estudiante para este proyecto.")
      return
    }

    setCreateLoading(true)
    try {
      await apiClient.projects.create({
        titulo: formData.titulo!,
        idEstudiante: studentId,
        idLineaInv: Number(formData.idLineaInv),
        idGestion: Number(formData.idGestion),
        idModalidad: Number(formData.idModalidad) || 1,
        idDocTG: Number(formData.idDocTG) || 0, // Handle 0 if not selected (might fail backend validation)
        idDocTutor: Number(formData.idDocTutor) || 0,
        idDocRev1: 0,
      })
      setShowCreateModal(false)
      fetchData()
      setFormData({})
      setSelectedStudent(null)
    } catch (err) {
      console.error(err)
      alert("Error al crear proyecto")
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Proyectos de Grado</h1>
          <p className="text-muted-foreground">Listado y gestión de proyectos activos</p>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo Proyecto
          </Button>
        )}
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
                    proyectos.map((p) => (
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
                            <Button variant="ghost" size="icon" title="Ver Detalles">
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

      {/* CREATE MODAL */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">

            {/* Search Student (Only if Admin/Teacher) */}
            {!isStudent && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Estudiante</label>
                {selectedStudent ? (
                  <div className="flex justify-between items-center p-2 border rounded bg-muted/20">
                    <span>{selectedStudent.nombreCompleto}</span>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>Cambiar</Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar estudiante..."
                      className="pl-8"
                      value={studentSearchTerm}
                      onChange={e => handleSearchStudent(e.target.value)}
                    />
                    {studentSearchResults.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-background border rounded-md shadow-lg mt-1 max-h-40 overflow-auto">
                        {studentSearchResults.map(s => (
                          <div key={s.id}
                            className="p-2 hover:bg-muted cursor-pointer"
                            onClick={() => { setSelectedStudent(s); setStudentSearchResults([]); setStudentSearchTerm(""); }}
                          >
                            {s.nombreCompleto}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <label className="text-sm font-medium">Título del Proyecto</label>
              <Input
                value={formData.titulo}
                onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Ingrese el título..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-medium">Línea de Investigación</label>
                <Select
                  value={String(formData.idLineaInv || "")}
                  onValueChange={v => setFormData({ ...formData, idLineaInv: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                  <SelectContent>
                    {researchLines.map(line => (
                      <SelectItem key={line.id} value={String(line.id)}>{line.name}</SelectItem>
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
                      <SelectItem key={g.id} value={String(g.id)}>{g.gestion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Note: In a real app we need DocTG and Tutor selection here too. Omitted for brevity/lack of easy data source in this step */}
            <div className="p-2 bg-yellow-50 text-yellow-800 text-xs rounded border border-yellow-200">
              Nota: Los docentes (Tutor, Docente TG) deben ser asignados posteriormente o añadidos a este formulario.
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
