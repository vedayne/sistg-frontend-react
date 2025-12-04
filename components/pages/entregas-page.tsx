"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const ENTREGAS_DATA = [
  {
    id: 1,
    numero: 1,
    nombre: "Perfil de Proyecto",
    estudiante: "Miguel Ángel Lipa Yahuita",
    fase: "Perfil",
    fechaEntrega: "2025-01-15",
    gestion: "2025-I",
    especialidad: "Ingeniería de Sistemas",
    estado: "Entregado",
    detalles: "Propuesta inicial del proyecto de grado aprobada",
  },
  {
    id: 2,
    numero: 2,
    nombre: "Marco Teórico",
    estudiante: "Miguel Ángel Lipa Yahuita",
    fase: "Marco Teórico",
    fechaEntrega: "2025-02-28",
    gestion: "2025-I",
    especialidad: "Ingeniería de Sistemas",
    estado: "En Revisión",
    detalles: "Marco teórico del proyecto",
  },
  {
    id: 3,
    numero: 3,
    nombre: "Marco Práctico Primera Parte",
    estudiante: "María López González",
    fase: "Marco Práctico Primera Parte",
    fechaEntrega: "2025-03-30",
    gestion: "2025-I",
    especialidad: "Ingeniería Informatica",
    estado: "Pendiente",
    detalles: "Primera parte del marco práctico",
  },
  {
    id: 4,
    numero: 4,
    nombre: "Documento Final",
    estudiante: "Carlos Rodríguez Martínez",
    fase: "Borrador Final",
    fechaEntrega: "2025-04-30",
    gestion: "2025-I",
    especialidad: "Ingeniería de Software",
    estado: "Entregado",
    detalles: "Documento final del proyecto",
  },
]

const FASES = [
  "Perfil",
  "Marco Teórico",
  "Marco Práctico Primera Parte",
  "Marco Práctico Completo",
  "Primer Borrador",
  "Borrador Final",
  "Marco Práctico Primera Parte - Segunda Instancia (2T)",
  "Borrador Final - Segunda Instancia (2T)",
]

const GESTIONES = ["2024-II", "2025-I", "2025-II"]

export default function EntregasPage() {
  const [searchStudent, setSearchStudent] = useState("")
  const [filterPhase, setFilterPhase] = useState("")
  const [filterGestion, setFilterGestion] = useState("")
  const [filterSpecialty, setFilterSpecialty] = useState("")
  const [selectedEntrega, setSelectedEntrega] = useState<(typeof ENTREGAS_DATA)[0] | null>(null)

  const filteredEntregas = useMemo(() => {
    return ENTREGAS_DATA.filter((entrega) => {
      const matchStudent = entrega.estudiante.toLowerCase().includes(searchStudent.toLowerCase())
      const matchPhase = filterPhase === "" || entrega.fase === filterPhase
      const matchGestion = filterGestion === "" || entrega.gestion === filterGestion
      const matchSpecialty = filterSpecialty === "" || entrega.especialidad === filterSpecialty
      return matchStudent && matchPhase && matchGestion && matchSpecialty
    })
  }, [searchStudent, filterPhase, filterGestion, filterSpecialty])

  const especialidades = useMemo(() => [...new Set(ENTREGAS_DATA.map((e) => e.especialidad))], [])

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
          <strong>Información importante:</strong> Las entregas se deben hacer dentro de las fechas límite
          especificadas. Cualquier retraso será registrado en el sistema. Contacta con tu tutor en caso de dudas.
        </p>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Entregas</h1>
        <p className="text-muted-foreground">Gestión de entregas de trabajos de grado</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre de Estudiante</label>
              <Input
                placeholder="Buscar estudiante..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fase</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
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
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gestión</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={filterGestion}
                onChange={(e) => setFilterGestion(e.target.value)}
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
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
              >
                <option value="">Todas las especialidades</option>
                {especialidades.map((esp) => (
                  <option key={esp} value={esp}>
                    {esp}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-xs md:text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold">No.</th>
                  <th className="text-left py-3 px-4 font-bold">Entrega</th>
                  <th className="text-left py-3 px-4 font-bold">Estudiante</th>
                  <th className="text-left py-3 px-4 font-bold">Fase</th>
                  <th className="text-left py-3 px-4 font-bold">Fecha</th>
                  <th className="text-left py-3 px-4 font-bold">Gestión</th>
                  <th className="text-left py-3 px-4 font-bold">Estado</th>
                  <th className="text-left py-3 px-4 font-bold">Acción</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntregas.length > 0 ? (
                  filteredEntregas.map((entrega) => (
                    <tr key={entrega.id} className="border-b hover:bg-secondary/50 dark:hover:bg-slate-800">
                      <td className="py-3 px-4">{entrega.numero}</td>
                      <td className="py-3 px-4 font-medium">{entrega.nombre}</td>
                      <td className="py-3 px-4 text-sm">{entrega.estudiante}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-secondary/20">
                          {entrega.fase}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm">{entrega.fechaEntrega}</td>
                      <td className="py-3 px-4">{entrega.gestion}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={`${
                            entrega.estado === "Entregado"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                              : entrega.estado === "En Revisión"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                          }`}
                        >
                          {entrega.estado}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedEntrega(entrega)}
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
                      No se encontraron entregas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <Dialog open={!!selectedEntrega} onOpenChange={() => setSelectedEntrega(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">Detalles de Entrega</DialogTitle>
          </DialogHeader>
          {selectedEntrega && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                  <p className="font-medium">{selectedEntrega.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estudiante</p>
                  <p className="font-medium">{selectedEntrega.estudiante}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fase</p>
                  <p className="font-medium">{selectedEntrega.fase}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Gestión</p>
                  <p className="font-medium">{selectedEntrega.gestion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
                  <p className="font-medium">{selectedEntrega.fechaEntrega}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge className="mt-1">{selectedEntrega.estado}</Badge>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Detalles</p>
                <p className="text-foreground">{selectedEntrega.detalles}</p>
              </div>
              <Button
                onClick={() => setSelectedEntrega(null)}
                className="w-full bg-primary hover:bg-primary/90 text-white"
              >
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
