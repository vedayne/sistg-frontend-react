"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CenteredLoader } from "@/components/ui/centered-loader"
import { Plus, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Defensa, EstudianteBasicInfo, Phase, ProjectResponseDto } from "@/lib/types"

export default function DefensasPage() {
  const [searchStudent, setSearchStudent] = useState("")
  const [filterPhaseId, setFilterPhaseId] = useState("")
  const [selectedDefensa, setSelectedDefensa] = useState<Defensa | null>(null)
  const [showNewDefensaModal, setShowNewDefensaModal] = useState(false)
  const [defensas, setDefensas] = useState<Defensa[]>([])
  const [defensasLoading, setDefensasLoading] = useState(false)
  const [defensasError, setDefensasError] = useState("")
  const [phases, setPhases] = useState<Phase[]>([])
  const [phasesLoading, setPhasesLoading] = useState(false)

  const [newDefensa, setNewDefensa] = useState({
    idFase: "",
    notaReferencial: "",
    observaciones: "",
  })
  const [studentSearchTerm, setStudentSearchTerm] = useState("")
  const [studentSearchResults, setStudentSearchResults] = useState<EstudianteBasicInfo[]>([])
  const [studentSearchLoading, setStudentSearchLoading] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<EstudianteBasicInfo | null>(null)
  const [studentProjects, setStudentProjects] = useState<ProjectResponseDto[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState("")
  const [createError, setCreateError] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  const hasActiveFilters = searchStudent.trim() !== "" || filterPhaseId !== ""

  const filteredDefensas = useMemo(() => {
    return defensas.filter((defensa) => {
      const matchStudent = defensa.estudiante.nombreCompleto
        .toLowerCase()
        .includes(searchStudent.toLowerCase())
      const matchPhase = filterPhaseId === "" || defensa.idFase === Number(filterPhaseId)
      return matchStudent && matchPhase
    })
  }, [defensas, searchStudent, filterPhaseId])

  const selectedProject = studentProjects.find((proj) => proj.id === Number(selectedProjectId))

  const handleClearFilters = () => {
    setSearchStudent("")
    setFilterPhaseId("")
  }

  const resetNewDefensaForm = () => {
    setNewDefensa({ idFase: "", notaReferencial: "", observaciones: "" })
    setStudentSearchTerm("")
    setStudentSearchResults([])
    setSelectedStudent(null)
    setStudentProjects([])
    setSelectedProjectId("")
    setCreateError("")
  }

  const loadDefensas = async () => {
    setDefensasError("")
    setDefensasLoading(true)
    try {
      const res = await apiClient.defensas.list()
      setDefensas(res)
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudieron cargar las defensas"
      setDefensasError(message)
    } finally {
      setDefensasLoading(false)
    }
  }

  const loadPhases = async () => {
    if (phases.length > 0) return
    setPhasesLoading(true)
    try {
      const res = await apiClient.phases.list()
      setPhases(res)
    } catch (err) {
      console.error(err)
    } finally {
      setPhasesLoading(false)
    }
  }

  useEffect(() => {
    loadDefensas()
    loadPhases()
  }, [])

  const handleSearchStudent = async (term: string) => {
    setStudentSearchTerm(term)
    setSelectedStudent(null)
    setSelectedProjectId("")
    setStudentProjects([])
    if (term.trim().length < 2) {
      setStudentSearchResults([])
      return
    }
    setStudentSearchLoading(true)
    try {
      const res = await apiClient.students.list({
        search: term,
        limit: 8,
        fields: "id,nombreCompleto,email,idSaga",
      })
      const data = (res as any).data || res || []
      const list = (Array.isArray(data) ? data : [data]).map((item: any) => ({
        ...item,
        id: Number(item.id),
      }))
      setStudentSearchResults(list)
    } catch (err) {
      console.error(err)
    } finally {
      setStudentSearchLoading(false)
    }
  }

  const handleSelectStudent = async (student: EstudianteBasicInfo) => {
    setSelectedStudent(student)
    setStudentSearchTerm(student.nombreCompleto)
    setStudentSearchResults([])
    setSelectedProjectId("")
    setStudentProjects([])
    setProjectsLoading(true)
    try {
      const projects = await apiClient.projects.getByStudent(student.id)
      setStudentProjects(projects)
      if (projects.length === 1) {
        setSelectedProjectId(String(projects[0].id))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleSaveNewDefensa = async () => {
    if (!newDefensa.idFase || !selectedStudent || !selectedProjectId) {
      setCreateError("Completa fase, estudiante y proyecto.")
      return
    }

    setCreateError("")
    setCreateLoading(true)
    try {
      const resp = await apiClient.defensas.create({
        idFase: Number(newDefensa.idFase),
        idEstudiante: selectedStudent.id,
        idProyecto: Number(selectedProjectId),
        notaReferencial: newDefensa.notaReferencial || undefined,
        observaciones: newDefensa.observaciones || undefined,
      })
      const created = (resp as any).data || resp
      setDefensas((prev) => [created, ...prev])
      setShowNewDefensaModal(false)
      resetNewDefensaForm()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear la defensa"
      setCreateError(message)
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 dark:text-white">Defensas</h1>
          <p className="text-muted-foreground">Gestión de defensas de trabajos de grado</p>
        </div>
        <Button
          onClick={() => {
            setShowNewDefensaModal(true)
            loadPhases()
          }}
          className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
        >
          <Plus className="w-4 h-4" />
          NUEVO
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de Estudiante</label>
              <Input
                placeholder="Buscar estudiante..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium mb-1">Fase</label>
              <div className="flex gap-2">
                <select
                  className="flex-1 px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  value={filterPhaseId}
                  onChange={(e) => setFilterPhaseId(e.target.value)}
                >
                  <option value="">Todas las fases</option>
                  {phases.map((fase) => (
                    <option key={fase.id} value={fase.id}>
                      {fase.name}
                    </option>
                  ))}
                </select>
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="outline"
                    className="text-xs bg-transparent"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold w-12">No.</th>
                  <th className="text-left py-3 px-4 font-bold w-40">Fase</th>
                  <th className="text-left py-3 px-4 font-bold w-64">Proyecto</th>
                  <th className="text-left py-3 px-4 font-bold w-48">Estudiante</th>
                  <th className="text-left py-3 px-4 font-bold w-20">Nota</th>
                  <th className="text-left py-3 px-4 font-bold w-48">Tribunal</th>
                  <th className="text-left py-3 px-4 font-bold w-48">Observación</th>
                  <th className="text-left py-3 px-4 font-bold w-24">Acción</th>
                </tr>
              </thead>
              <tbody>
                {defensasLoading ? (
                  <tr>
                    <td colSpan={8} className="py-6">
                      <CenteredLoader label="Cargando defensas..." />
                    </td>
                  </tr>
                ) : defensasError ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-red-600">
                      {defensasError}
                    </td>
                  </tr>
                ) : filteredDefensas.length > 0 ? (
                  filteredDefensas.map((defensa, index) => (
                    <tr key={defensa.id} className="border-b hover:bg-secondary/50 dark:hover:bg-slate-800">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-purple-100/20">
                          {defensa.fase}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-sm">{defensa.proyecto.titulo}</td>
                      <td className="py-3 px-4 text-sm">{defensa.estudiante.nombreCompleto}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-secondary text-secondary-foreground">
                          {defensa.notaReferencial || "N/A"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs">{defensa.tribunal || "-"}</td>
                      <td className="py-3 px-4 text-xs">{defensa.observaciones || "-"}</td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedDefensa(defensa)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          Detalles
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-muted-foreground">
                      No se encontraron defensas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedDefensa} onOpenChange={() => setSelectedDefensa(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalles de Defensa</DialogTitle>
          </DialogHeader>
          {selectedDefensa && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fase</p>
                  <p className="font-medium">{selectedDefensa.fase}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nota Referencial</p>
                  <p className="text-lg font-bold text-secondary">
                    {selectedDefensa.notaReferencial || "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Proyecto</p>
                <p className="font-medium">{selectedDefensa.proyecto.titulo}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Estudiante</p>
                <p className="font-medium">{selectedDefensa.estudiante.nombreCompleto}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tribunal</p>
                <p className="text-sm font-medium">{selectedDefensa.tribunal || "-"}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Observaciones</p>
                <p className="text-sm font-medium">{selectedDefensa.observaciones || "-"}</p>
              </div>
              <Button
                onClick={() => setSelectedDefensa(null)}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={showNewDefensaModal}
        onOpenChange={(open) => {
          setShowNewDefensaModal(open)
          if (!open) resetNewDefensaForm()
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="text-primary">Agregar Nueva Defensa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2">
            <div>
              <label className="block text-sm font-medium mb-2">Fase *</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={newDefensa.idFase}
                onChange={(e) => setNewDefensa({ ...newDefensa, idFase: e.target.value })}
              >
                <option value="">Selecciona una fase</option>
                {phases.map((fase) => (
                  <option key={fase.id} value={fase.id}>
                    {fase.name}
                  </option>
                ))}
              </select>
              {phasesLoading && <p className="text-xs text-muted-foreground mt-1">Cargando fases...</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Estudiante *</label>
              <Input
                placeholder="Buscar estudiante..."
                value={studentSearchTerm}
                onChange={(e) => handleSearchStudent(e.target.value)}
              />
              {studentSearchLoading && <p className="text-xs text-muted-foreground mt-1">Buscando...</p>}
              {studentSearchResults.length > 0 && (
                <div className="mt-2 border rounded-lg max-h-44 overflow-y-auto bg-background">
                  {studentSearchResults.map((student) => (
                    <button
                      key={student.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-secondary/60 text-sm"
                      onClick={() => handleSelectStudent(student)}
                    >
                      <div className="font-medium text-foreground">{student.nombreCompleto}</div>
                      <div className="text-xs text-muted-foreground">{student.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStudent && (
              <div className="space-y-2">
                <div className="p-3 bg-secondary/20 rounded-lg border border-secondary">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Estudiante Seleccionado</p>
                  <p className="font-medium text-foreground">{selectedStudent.nombreCompleto}</p>
                </div>

                {projectsLoading && <p className="text-xs text-muted-foreground">Cargando proyectos...</p>}

                {!projectsLoading && studentProjects.length === 0 && (
                  <p className="text-xs text-red-600">El estudiante no tiene proyectos registrados.</p>
                )}

                {!projectsLoading && studentProjects.length === 1 && selectedProject && (
                  <div className="p-3 bg-secondary/10 rounded-lg border border-secondary">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Proyecto</p>
                    <p className="font-medium text-foreground">{selectedProject.titulo}</p>
                  </div>
                )}

                {!projectsLoading && studentProjects.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Proyecto *</label>
                    <select
                      className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                    >
                      <option value="">Selecciona un proyecto</option>
                      {studentProjects.map((proj) => (
                        <option key={proj.id} value={proj.id}>
                          {proj.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Nota Referencial</label>
              <Input
                type="text"
                placeholder="Ej: 18.5"
                value={newDefensa.notaReferencial}
                onChange={(e) => setNewDefensa({ ...newDefensa, notaReferencial: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observación</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Ingresa observaciones..."
                value={newDefensa.observaciones}
                onChange={(e) => setNewDefensa({ ...newDefensa, observaciones: e.target.value })}
                rows={4}
              />
            </div>

            {createError && <p className="text-xs text-red-600">{createError}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDefensaModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveNewDefensa}
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={createLoading}
            >
              {createLoading ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
