"use client"

import { useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

const PROYECTOS_DATA = [
  {
    id: 1,
    numero: 1,
    proyecto: "Sistema de Gestión de Trabajos de Grado EMI",
    areaInvestigacion: "Ingeniería de Software",
    lineaInvestigacion: "Sistemas de Información",
    estudiante: "Miguel Ángel Lipa Yahuita",
    gestion: "2024",
    especialidad: "Informática",
  },
  {
    id: 2,
    numero: 2,
    proyecto: "Aplicación Móvil para Gestión Educativa",
    areaInvestigacion: "Tecnología Educativa",
    lineaInvestigacion: "Aplicaciones Móviles",
    estudiante: "María López González",
    gestion: "2024",
    especialidad: "Informática",
  },
]

const GESTIONES = ["2023", "2024", "2025"]
const ESPECIALIDADES = ["Informática", "Electrónica", "Mecánica", "Civil"]
const ESTUDIANTES = ["Miguel Ángel Lipa Yahuita", "María López González", "Juan Pérez", "Ana García"]

export default function ProyectosPage() {
  const { user } = useAuth()
  const [searchGestion, setSearchGestion] = useState("")
  const [filterEspecialidad, setFilterEspecialidad] = useState("")
  const [selectedProyecto, setSelectedProyecto] = useState<(typeof PROYECTOS_DATA)[0] | null>(null)
  const [isEditingProyecto, setIsEditingProyecto] = useState(false)
  const [showNewProyecto, setShowNewProyecto] = useState(false)
  const [editData, setEditData] = useState({
    areaInvestigacion: "",
    lineaInvestigacion: "",
  })
  const [newProyecto, setNewProyecto] = useState({
    estudiante: "",
    proyecto: "",
    gestion: "",
    especialidad: "",
    areaInvestigacion: "",
    lineaInvestigacion: "",
  })

  const canCreateProject = user?.roles?.some((r) =>
    ["DOCENTE_TG", "SECRETARIA", "JEFE_CARRERA", "DDE", "ADMINISTRADOR"].includes(r.name),
  )

  const filteredProyectos = useMemo(() => {
    return PROYECTOS_DATA.filter((proyecto) => {
      const matchGestion = searchGestion === "" || proyecto.gestion === searchGestion
      const matchEspecialidad = filterEspecialidad === "" || proyecto.especialidad === filterEspecialidad
      return matchGestion && matchEspecialidad
    })
  }, [searchGestion, filterEspecialidad])

  const handleOpenProyecto = (proyecto: (typeof PROYECTOS_DATA)[0]) => {
    setSelectedProyecto(proyecto)
    setEditData({
      areaInvestigacion: proyecto.areaInvestigacion,
      lineaInvestigacion: proyecto.lineaInvestigacion,
    })
    setIsEditingProyecto(false)
  }

  const handleSaveChanges = () => {
    console.log("Guardar cambios:", editData)
    setIsEditingProyecto(false)
  }

  const handleSaveNewProyecto = () => {
    if (!newProyecto.estudiante || !newProyecto.proyecto || !newProyecto.gestion || !newProyecto.especialidad) {
      alert("Por favor completa todos los campos requeridos")
      return
    }
    console.log("Nuevo proyecto creado:", newProyecto)
    setShowNewProyecto(false)
    setNewProyecto({
      estudiante: "",
      proyecto: "",
      gestion: "",
      especialidad: "",
      areaInvestigacion: "",
      lineaInvestigacion: "",
    })
  }

  const documentButtons = [
    { label: "Tribunal", color: "bg-gray-600 hover:bg-gray-700" },
    { label: "Aval", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Bitácora", color: "bg-slate-800 hover:bg-slate-700" },
    { label: "Acta", color: "bg-green-600 hover:bg-green-700" },
    { label: "Nota de Servicio", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Temario", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "Memo Asignación Tutor", color: "bg-slate-700 hover:bg-slate-600" },
    { label: "Carta de Aprobación Perfil", color: "bg-gray-600 hover:bg-gray-700" },
    { label: "Informe de Revisión", color: "bg-yellow-600 hover:bg-yellow-700" },
    { label: "Memo Aviso Defensa", color: "bg-cyan-600 hover:bg-cyan-700" },
    { label: "Nota de Servicio Empastado", color: "bg-blue-600 hover:bg-blue-700" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Proyectos</h1>
          <p className="text-muted-foreground">Gestión de proyectos de trabajos de grado</p>
        </div>
        {canCreateProject && (
          <Button
            onClick={() => setShowNewProyecto(true)}
            className="bg-primary hover:bg-primary/90 text-white flex gap-2"
          >
            <Plus className="w-4 h-4" />
            NUEVO PROYECTO
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Gestión</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={searchGestion}
                onChange={(e) => setSearchGestion(e.target.value)}
              >
                <option value="">Todas las gestiones</option>
                {GESTIONES.map((gestion) => (
                  <option key={gestion} value={gestion}>
                    {gestion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Especialidad</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={filterEspecialidad}
                onChange={(e) => setFilterEspecialidad(e.target.value)}
              >
                <option value="">Todas las especialidades</option>
                {ESPECIALIDADES.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Proyectos */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold">No.</th>
                  <th className="text-left py-3 px-4 font-bold">Proyecto</th>
                  <th className="text-left py-3 px-4 font-bold">Área de Investigación</th>
                  <th className="text-left py-3 px-4 font-bold">Línea de Investigación</th>
                  <th className="text-left py-3 px-4 font-bold">Estudiante</th>
                  <th className="text-left py-3 px-4 font-bold">Gestión</th>
                  <th className="text-left py-3 px-4 font-bold">Especialidad</th>
                  <th className="text-left py-3 px-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredProyectos.length > 0 ? (
                  filteredProyectos.map((proyecto) => (
                    <tr key={proyecto.id} className="border-b hover:bg-secondary/50 dark:hover:bg-slate-800">
                      <td className="py-3 px-4">{proyecto.numero}</td>
                      <td className="py-3 px-4 font-medium text-sm">{proyecto.proyecto}</td>
                      <td className="py-3 px-4 text-sm">{proyecto.areaInvestigacion}</td>
                      <td className="py-3 px-4 text-sm">{proyecto.lineaInvestigacion}</td>
                      <td className="py-3 px-4 text-sm">{proyecto.estudiante}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline">{proyecto.gestion}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-secondary text-secondary-foreground">{proyecto.especialidad}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => handleOpenProyecto(proyecto)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          DETALLES
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-muted-foreground">
                      No se encontraron proyectos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Nuevo Proyecto */}
      <Dialog open={showNewProyecto} onOpenChange={setShowNewProyecto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Crear Nuevo Proyecto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Estudiante *</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  value={newProyecto.estudiante}
                  onChange={(e) => setNewProyecto({ ...newProyecto, estudiante: e.target.value })}
                >
                  <option value="">Selecciona estudiante</option>
                  {ESTUDIANTES.map((est) => (
                    <option key={est} value={est}>
                      {est}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Proyecto *</label>
                <Input
                  disabled
                  placeholder="Se carga desde SAGA"
                  className="bg-gray-100 dark:bg-slate-800"
                  value={newProyecto.proyecto}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Gestión *</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  value={newProyecto.gestion}
                  onChange={(e) => setNewProyecto({ ...newProyecto, gestion: e.target.value })}
                >
                  <option value="">Selecciona gestión</option>
                  {GESTIONES.map((gest) => (
                    <option key={gest} value={gest}>
                      {gest}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Especialidad *</label>
                <select
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                  value={newProyecto.especialidad}
                  onChange={(e) => setNewProyecto({ ...newProyecto, especialidad: e.target.value })}
                >
                  <option value="">Selecciona especialidad</option>
                  {ESPECIALIDADES.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t pt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Área de Investigación</label>
                <Input
                  placeholder="Ingresa el área de investigación"
                  value={newProyecto.areaInvestigacion}
                  onChange={(e) => setNewProyecto({ ...newProyecto, areaInvestigacion: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Línea de Investigación</label>
                <Input
                  placeholder="Ingresa la línea de investigación"
                  value={newProyecto.lineaInvestigacion}
                  onChange={(e) => setNewProyecto({ ...newProyecto, lineaInvestigacion: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowNewProyecto(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveNewProyecto} className="bg-primary hover:bg-primary/90 text-white">
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles del Proyecto */}
      <Dialog open={!!selectedProyecto} onOpenChange={() => setSelectedProyecto(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalles del Proyecto</DialogTitle>
          </DialogHeader>
          {selectedProyecto && (
            <div className="space-y-6">
              {/* Datos de solo lectura */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                  <p className="font-medium">{selectedProyecto.estudiante}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proyecto</p>
                  <p className="font-medium">{selectedProyecto.proyecto}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gestión</p>
                  <p className="font-medium">{selectedProyecto.gestion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Especialidad</p>
                  <p className="font-medium">{selectedProyecto.especialidad}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Área de Investigación</label>
                  {isEditingProyecto ? (
                    <Input
                      value={editData.areaInvestigacion}
                      onChange={(e) => setEditData({ ...editData, areaInvestigacion: e.target.value })}
                      placeholder="Ingresa el área de investigación"
                    />
                  ) : (
                    <p className="font-medium">{editData.areaInvestigacion}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Línea de Investigación</label>
                  {isEditingProyecto ? (
                    <Input
                      value={editData.lineaInvestigacion}
                      onChange={(e) => setEditData({ ...editData, lineaInvestigacion: e.target.value })}
                      placeholder="Ingresa la línea de investigación"
                    />
                  ) : (
                    <p className="font-medium">{editData.lineaInvestigacion}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Documentos Relacionados:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {documentButtons.map((btn) => (
                    <Button key={btn.label} className={`${btn.color} text-white text-xs `} size="sm">
                      {btn.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="block text-sm font-medium mb-2">Fecha de Documento</label>
                <Input type="date" className="max-w-xs" />
              </div>

              <div className="flex gap-2 justify-end">
                {!isEditingProyecto ? (
                  <>
                    <Button variant="outline" onClick={() => setSelectedProyecto(null)}>
                      Cerrar
                    </Button>
                    <Button
                      onClick={() => setIsEditingProyecto(true)}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      Editar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={() => setIsEditingProyecto(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveChanges} className="bg-green-600 hover:bg-green-700 text-white">
                      Guardar
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
