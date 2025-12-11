"use client"

import { useCallback, useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Plus, X, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Pagination, EstudianteBasicInfo, DocenteBasicInfo } from "@/lib/types"

const GESTIONES = ["2024", "2025", "2026"]
const ESPECIALIDADES = [
  "Ingeniería de Sistemas",
  "Ingeniería Electrónica",
  "Ingeniería Electromecánica",
  "Ingeniería Civil",
  "Ingeniería de Telecomunicaciones",
]
const SEMESTRES = Array.from({ length: 10 }, (_, i) => String(i + 1))

export default function StudentManagementPage() {
  const { user } = useAuth()

  // Filtros principales
  const [gestionFilter, setGestionFilter] = useState("all")
  const [especialidadFilter, setEspecialidadFilter] = useState("all")
  const [semestreFilter, setSemestreFilter] = useState("all")

  // Estado de estudiantes
  const [estudiantes, setEstudiantes] = useState<EstudianteBasicInfo[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal de nuevo proyecto
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [searchStudentInput, setSearchStudentInput] = useState("")
  const [studentSearchResults, setStudentSearchResults] = useState<EstudianteBasicInfo[]>([])
  const [selectedEstudiante, setSelectedEstudiante] = useState<EstudianteBasicInfo | null>(null)
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)

  // Estado de docentes para selects
  const [docentes, setDocentes] = useState<DocenteBasicInfo[]>([])
  const [docentesLoading, setDocentesLoading] = useState(false)

  // Estados del formulario nuevo proyecto
  const [newProject, setNewProject] = useState({
    docenteTG: "",
    tutor: "",
    revisor1: "",
    titulo: "",
  })
  const [formLoading, setFormLoading] = useState(false)

  const canViewStudentModule = user?.roles?.some((r) => ["ADMINISTRADOR", "DOCENTE_TG"].includes(r.name))

  // Cargar lista inicial de estudiantes
  const fetchEstudiantes = useCallback(async (pageValue: number, limitValue: number) => {
    setLoading(true)
    try {
      const response = await apiClient.students.list({
        page: pageValue,
        limit: limitValue,
        isActive: true,
      })
      setEstudiantes(response.data)
      setPagination(response.pagination)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar los estudiantes"
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar estudiantes en el modal
  const handleSearchStudent = useCallback(async (term: string) => {
    setSearchStudentInput(term)
    if (term.trim().length < 2) {
      setStudentSearchResults([])
      return
    }

    try {
      const response = await apiClient.students.list({
        search: term,
        limit: 10,
      })
      setStudentSearchResults(response.data)
    } catch (err) {
      console.error("Error searching students:", err)
      setStudentSearchResults([])
    }
  }, [])

  // Cargar docentes para los selects
  const fetchDocentes = useCallback(async () => {
    setDocentesLoading(true)
    try {
      const response = await apiClient.teachers.list({
        limit: 100,
      })
      setDocentes(response.data)
    } catch (err) {
      console.error("Error loading teachers:", err)
    } finally {
      setDocentesLoading(false)
    }
  }, [])

  // Cargar datos al abrir modal
  const handleOpenNewProjectModal = () => {
    setShowNewProjectModal(true)
    setSearchStudentInput("")
    setSelectedEstudiante(null)
    setStudentSearchResults([])
    setNewProject({ docenteTG: "", tutor: "", revisor1: "", titulo: "" })
    fetchDocentes()
  }

  // Seleccionar estudiante del dropdown
  const handleSelectEstudiante = (estudiante: EstudianteBasicInfo) => {
    setSelectedEstudiante(estudiante)
    setSearchStudentInput(estudiante.nombreCompleto)
    setShowStudentDropdown(false)
    setStudentSearchResults([])
  }

  // Guardar nuevo proyecto
  const handleCreateProject = async () => {
    if (!selectedEstudiante || !newProject.titulo.trim()) {
      setError("Debe proporcionar un título para el proyecto")
      return
    }

    if (!newProject.docenteTG || !newProject.tutor || !newProject.revisor1) {
      setError("Debe seleccionar Docente de Trabajo de Grado, Tutor y Revisor 1")
      return
    }

    try {
      setFormLoading(true)
      console.log("[v0] Creating project:", {
        estudiante: selectedEstudiante.id,
        ...newProject,
      })
      // API call would go here
      setShowNewProjectModal(false)
      setNewProject({ docenteTG: "", tutor: "", revisor1: "", titulo: "" })
      setSelectedEstudiante(null)
      setSearchStudentInput("")
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating project")
    } finally {
      setFormLoading(false)
    }
  }

  const handleClearFilters = () => {
    setGestionFilter("all")
    setEspecialidadFilter("all")
    setSemestreFilter("all")
    setPage(1)
  }

  const hasActiveFilters = gestionFilter !== "all" || especialidadFilter !== "all" || semestreFilter !== "all"

  useEffect(() => {
    fetchEstudiantes(page, limit)
  }, [page, limit, fetchEstudiantes])

  if (!canViewStudentModule) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">No tienes permiso para acceder a este módulo.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Estudiantes</h1>
        <p className="text-muted-foreground">Administración de estudiantes y sus trabajos de grado</p>
      </div>

      <Card className="border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" onClick={handleClearFilters} className="text-xs bg-transparent">
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Gestión</label>
              <Select value={gestionFilter} onValueChange={setGestionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {GESTIONES.map((gestion) => (
                    <SelectItem key={gestion} value={gestion}>
                      {gestion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Especialidad</label>
              <Select value={especialidadFilter} onValueChange={setEspecialidadFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {ESPECIALIDADES.map((esp) => (
                    <SelectItem key={esp} value={esp}>
                      {esp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Semestre</label>
              <Select value={semestreFilter} onValueChange={setSemestreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {SEMESTRES.map((sem) => (
                    <SelectItem key={sem} value={sem}>
                      {sem}º semestre
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Por página</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
              >
                {[5, 10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Estudiantes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Estudiantes</CardTitle>
            <Button
              onClick={handleOpenNewProjectModal}
              className="bg-primary hover:bg-primary/90 text-white flex gap-2"
            >
              <Plus className="w-4 h-4" />
              NUEVO
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando estudiantes...
            </div>
          )}
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary/30 bg-primary/5">
                  <th className="text-left py-4 px-4 font-bold">No.</th>
                  <th className="text-left py-4 px-4 font-bold">Estudiante</th>
                  <th className="text-left py-4 px-4 font-bold">Carrera</th>
                  <th className="text-left py-4 px-4 font-bold">Código SAGA</th>
                  <th className="text-left py-4 px-4 font-bold">Email</th>
                  <th className="text-left py-4 px-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.length > 0 ? (
                  estudiantes.map((estudiante, index) => (
                    <tr
                      key={estudiante.id}
                      className="border-b hover:bg-secondary/50 dark:hover:bg-primary/5 transition-colors"
                    >
                      <td className="py-4 px-4">{(page - 1) * limit + index + 1}</td>
                      <td className="py-4 px-4 font-medium">{estudiante.nombreCompleto}</td>
                      <td className="py-4 px-4">{estudiante.carrera || "N/A"}</td>
                      <td className="py-4 px-4 font-mono text-xs">{estudiante.codEstudiante}</td>
                      <td className="py-4 px-4 text-xs">{estudiante.email}</td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          onClick={handleOpenNewProjectModal}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                        >
                          NUEVO PROYECTO
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No se encontraron estudiantes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
            <div>
              Página {pagination?.page || page} de {pagination?.totalPages || 1} •{" "}
              {pagination?.total ?? estudiantes.length} registros
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination ? !pagination.hasPreviousPage : page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={pagination ? !pagination.hasNextPage : estudiantes.length < limit}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showNewProjectModal} onOpenChange={setShowNewProjectModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-primary">Crear Nuevo Proyecto de Grado</DialogTitle>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3 border-b pb-4">
              <label className="text-sm font-medium block">Buscar Estudiante *</label>
              <div className="relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o código..."
                    value={searchStudentInput}
                    onChange={(e) => handleSearchStudent(e.target.value)}
                    onFocus={() => setShowStudentDropdown(true)}
                    className="pl-9"
                  />
                </div>

                {showStudentDropdown && searchStudentInput.trim().length >= 2 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto dark:bg-slate-900">
                    {studentSearchResults.length > 0 ? (
                      studentSearchResults.map((estudiante) => (
                        <button
                          key={estudiante.id}
                          onClick={() => handleSelectEstudiante(estudiante)}
                          className="w-full text-left px-4 py-2 hover:bg-primary/10 border-b last:border-b-0 transition-colors"
                        >
                          <div className="font-medium">{estudiante.nombreCompleto}</div>
                          <div className="text-xs text-muted-foreground">
                            {estudiante.codEstudiante} • {estudiante.carrera}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground">No se encontraron estudiantes</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedEstudiante && (
              <div className="bg-primary/10 p-4 rounded-lg space-y-3">
                <h3 className="font-bold text-primary">Datos del Estudiante</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground font-medium">Nombre Completo</p>
                    <p className="font-semibold">{selectedEstudiante.nombreCompleto}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Especialidad</p>
                    <p className="font-semibold">{selectedEstudiante.carrera || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Código SAGA</p>
                    <p className="font-mono font-semibold">{selectedEstudiante.idSaga}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Código Estudiante</p>
                    <p className="font-mono font-semibold">{selectedEstudiante.codEstudiante}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Semestre</p>
                    <p className="font-semibold">{selectedEstudiante.semestre || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground font-medium">Email</p>
                    <p className="font-semibold text-xs">{selectedEstudiante.email}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedEstudiante && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Título del Proyecto de Grado *</label>
                  <Input
                    placeholder="Ingresa el título del proyecto..."
                    value={newProject.titulo}
                    onChange={(e) => setNewProject({ ...newProject, titulo: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Docente de Trabajo de Grado *</label>
                  <Select
                    value={newProject.docenteTG}
                    onValueChange={(val) => setNewProject({ ...newProject, docenteTG: val })}
                  >
                    <SelectTrigger disabled={docentesLoading}>
                      <SelectValue placeholder="Selecciona un docente..." />
                    </SelectTrigger>
                    <SelectContent>
                      {docentes.map((docente) => (
                        <SelectItem key={docente.id} value={docente.id.toString()}>
                          {docente.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tutor *</label>
                  <Select
                    value={newProject.tutor}
                    onValueChange={(val) => setNewProject({ ...newProject, tutor: val })}
                  >
                    <SelectTrigger disabled={docentesLoading}>
                      <SelectValue placeholder="Selecciona un tutor..." />
                    </SelectTrigger>
                    <SelectContent>
                      {docentes.map((docente) => (
                        <SelectItem key={docente.id} value={docente.id.toString()}>
                          {docente.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Revisor 1 *</label>
                  <Select
                    value={newProject.revisor1}
                    onValueChange={(val) => setNewProject({ ...newProject, revisor1: val })}
                  >
                    <SelectTrigger disabled={docentesLoading}>
                      <SelectValue placeholder="Selecciona revisor 1..." />
                    </SelectTrigger>
                    <SelectContent>
                      {docentes.map((docente) => (
                        <SelectItem key={docente.id} value={docente.id.toString()}>
                          {docente.nombreCompleto}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setShowNewProjectModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCreateProject}
                disabled={formLoading || !selectedEstudiante}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                {formLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
