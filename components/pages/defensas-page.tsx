"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, X } from "lucide-react"

const DEFENSAS_DATA = [
  {
    id: 1,
    numero: 1,
    fase: "Defensa de Perfil",
    proyecto: "Sistema de Gestión de Trabajos de Grado EMI",
    estudiante: "Miguel Ángel Lipa Yahuita",
    notaReferencial: 18.5,
    miembroTribunal: "Dr. Carlos López, Dra. María González, Dr. Juan Martínez",
    observacion: "Excelente presentación. Proyecto bien estructurado y viable.",
  },
]

const FASES = [
  "Perfil",
  "Marco Teorico",
  "Marco Practico Primera Parte",
  "Marco Practico Completo",
  "Primer Borrador",
  "Borrador Final",
  "Marco Practico Primera Parte - Segunda Instancia (2T)",
  "Borrador Final - Segunda Instancia (2T)",
]

const ESTUDIANTES = [
  { id: 1, nombre: "Miguel Ángel Lipa Yahuita" },
  { id: 2, nombre: "María López González" },
  { id: 3, nombre: "Carlos Rodríguez Martínez" },
]

export default function DefensasPage() {
  const [searchStudent, setSearchStudent] = useState("")
  const [filterPhase, setFilterPhase] = useState("")
  const [selectedDefensa, setSelectedDefensa] = useState<(typeof DEFENSAS_DATA)[0] | null>(null)
  const [showNewDefensaModal, setShowNewDefensaModal] = useState(false)
  const [newDefensa, setNewDefensa] = useState({
    fase: "",
    estudiante: "",
    proyecto: "",
    notaReferencial: "",
    observacion: "",
  })

  const hasActiveFilters = searchStudent.trim() !== "" || filterPhase !== ""

  const filteredDefensas = useMemo(() => {
    return DEFENSAS_DATA.filter((defensa) => {
      const matchStudent = defensa.estudiante.toLowerCase().includes(searchStudent.toLowerCase())
      const matchPhase = filterPhase === "" || defensa.fase === filterPhase
      return matchStudent && matchPhase
    })
  }, [searchStudent, filterPhase])

  const handleClearFilters = () => {
    setSearchStudent("")
    setFilterPhase("")
  }

  const handleSaveNewDefensa = () => {
    if (!newDefensa.fase || !newDefensa.estudiante) {
      alert("Por favor completa los campos requeridos")
      return
    }
    console.log("Guardar nueva defensa:", newDefensa)
    setShowNewDefensaModal(false)
    setNewDefensa({
      fase: "",
      estudiante: "",
      proyecto: "",
      notaReferencial: "",
      observacion: "",
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Defensas</h1>
          <p className="text-muted-foreground">Gestión de defensas de trabajos de grado</p>
        </div>
        <Button
          onClick={() => setShowNewDefensaModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
        >
          <Plus className="w-4 h-4" />
          NUEVO
        </Button>
      </div>

      {/* Filtros */}
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
                  value={filterPhase}
                  onChange={(e) => setFilterPhase(e.target.value)}
                >
                  <option value="">Todas las fases</option>
                  {FASES.map((fase) => (
                    <option key={fase} value={fase}>
                      {fase}
                    </option>
                  ))}
                </select>
                {/* Clear filters button */}
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

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold">No.</th>
                  <th className="text-left py-3 px-4 font-bold">Fase</th>
                  <th className="text-left py-3 px-4 font-bold">Proyecto</th>
                  <th className="text-left py-3 px-4 font-bold">Estudiante</th>
                  <th className="text-left py-3 px-4 font-bold">Nota</th>
                  <th className="text-left py-3 px-4 font-bold">Tribunal</th>
                  <th className="text-left py-3 px-4 font-bold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredDefensas.length > 0 ? (
                  filteredDefensas.map((defensa) => (
                    <tr key={defensa.id} className="border-b hover:bg-secondary/50 dark:hover:bg-slate-800">
                      <td className="py-3 px-4">{defensa.numero}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-purple-100/20">
                          {defensa.fase}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium text-sm">{defensa.proyecto}</td>
                      <td className="py-3 px-4 text-sm">{defensa.estudiante}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-secondary text-secondary-foreground">{defensa.notaReferencial}</Badge>
                      </td>
                      <td className="py-3 px-4 text-xs line-clamp-2">{defensa.miembroTribunal}</td>
                      <td className="py-3 px-4 text-xs line-clamp-2">{defensa.observacion}</td>
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

      {/* Modal de detalles */}
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
                  <p className="text-lg font-bold text-secondary">{selectedDefensa.notaReferencial}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Proyecto</p>
                <p className="font-medium">{selectedDefensa.proyecto}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Estudiante</p>
                <p className="font-medium">{selectedDefensa.estudiante}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Miembros del Tribunal</p>
                <p className="text-sm font-medium">{selectedDefensa.miembroTribunal}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Observaciones</p>
                <p className="text-sm font-medium">{selectedDefensa.observacion}</p>
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

      <Dialog open={showNewDefensaModal} onOpenChange={setShowNewDefensaModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Agregar Nueva Defensa</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fase *</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={newDefensa.fase}
                onChange={(e) => setNewDefensa({ ...newDefensa, fase: e.target.value })}
              >
                <option value="">Selecciona una fase</option>
                {FASES.map((fase) => (
                  <option key={fase} value={fase}>
                    {fase}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Nombre del Estudiante *</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={newDefensa.estudiante}
                onChange={(e) => {
                  const selected = ESTUDIANTES.find((est) => est.nombre === e.target.value)
                  setNewDefensa({ ...newDefensa, estudiante: e.target.value })
                }}
              >
                <option value="">Selecciona un estudiante</option>
                {ESTUDIANTES.map((est) => (
                  <option key={est.id} value={est.nombre}>
                    {est.nombre}
                  </option>
                ))}
              </select>
            </div>

            {newDefensa.estudiante && (
              <div className="p-3 bg-secondary/20 rounded-lg border border-secondary">
                <p className="text-sm font-medium text-muted-foreground mb-1">Título del Proyecto</p>
                <p className="font-medium text-foreground">Sistema de Gestión de Trabajos de Grado EMI</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Nota Referencial</label>
              <Input
                type="number"
                placeholder="Ej: 18.5"
                value={newDefensa.notaReferencial}
                onChange={(e) => setNewDefensa({ ...newDefensa, notaReferencial: e.target.value })}
                min="0"
                max="20"
                step="0.5"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Observación</label>
              <textarea
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Ingresa observaciones..."
                value={newDefensa.observacion}
                onChange={(e) => setNewDefensa({ ...newDefensa, observacion: e.target.value })}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDefensaModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNewDefensa} className="bg-green-600 hover:bg-green-700 text-white">
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
