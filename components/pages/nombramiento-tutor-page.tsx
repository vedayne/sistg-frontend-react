"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Plus, Edit2, Printer, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface Tutor {
  id: string
  nombre: string
  email: string
  telefono: string
  externo: boolean
}

export default function NombramientoTutorPage() {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState("")
  const [tutorSearch, setTutorSearch] = useState("")
  const [selectedTutor, setSelectedTutor] = useState<Tutor | null>(null)
  const [projectTitle, setProjectTitle] = useState("")
  const [showExternalTutorModal, setShowExternalTutorModal] = useState(false)
  const [externalTutorData, setExternalTutorData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    especialidad: "",
  })
  const [tutors, setTutors] = useState<Tutor[]>([])
  const [externalTutors, setExternalTutors] = useState<Tutor[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isLoadingTutors, setIsLoadingTutors] = useState(false)
  const [tutorError, setTutorError] = useState<string | null>(null)

  const filteredTutors = tutors.filter(
    (t) =>
      t.nombre.toLowerCase().includes(tutorSearch.toLowerCase()) ||
      t.email.toLowerCase().includes(tutorSearch.toLowerCase()),
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      ;(async () => {
        setIsLoadingTutors(true)
        try {
          const response = await apiClient.teachers.list({ search: tutorSearch || undefined, limit: 10 })
          const mapped: Tutor[] = response.data.map((doc) => ({
            id: doc.id.toString(),
            nombre: doc.nombreCompleto,
            email: doc.email,
            telefono: "N/A",
            externo: false,
          }))
          setTutors(mapped)
          setTutorError(null)
        } catch (err) {
          const message = err instanceof Error ? err.message : "No se pudieron cargar los docentes"
          setTutorError(message)
        } finally {
          setIsLoadingTutors(false)
        }
      })()
    }, 300)

    return () => clearTimeout(handler)
  }, [tutorSearch])

  const handleAddExternalTutor = () => {
    if (externalTutorData.nombre && externalTutorData.email && externalTutorData.telefono) {
      const newTutor: Tutor = {
        id: Date.now().toString(),
        nombre: externalTutorData.nombre,
        email: externalTutorData.email,
        telefono: externalTutorData.telefono,
        externo: true,
      }
      setExternalTutors([...externalTutors, newTutor])
      setExternalTutorData({ nombre: "", email: "", telefono: "", especialidad: "" })
      setShowExternalTutorModal(false)
      alert("Tutor externo agregado exitosamente")
    }
  }

  const handlePrintDocument = (type: "aceptacion" | "tutor") => {
    if (!selectedTutor || !projectTitle) {
      alert("Por favor selecciona un tutor y completa el título del proyecto")
      return
    }
    alert(`Imprimiendo carta de ${type === "aceptacion" ? "aceptación de tutoría" : "tutor"}...`)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Nombramiento de Tutor</h1>
        <p className="text-muted-foreground">Registra y gestiona tu tutor de trabajo de grado</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Nombramiento</CardTitle>
          <CardDescription>Completa los datos para el nombramiento del tutor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fecha de nombramiento */}
          <div>
            <label className="block text-sm font-medium mb-2">Fecha de Nombramiento</label>
            <div className="relative">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pr-10"
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Búsqueda y selección de tutor */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Seleccionar Tutor</label>
            <div className="relative">
              <Input
                placeholder="Buscar tutor por nombre o email..."
                value={tutorSearch}
                onChange={(e) => setTutorSearch(e.target.value)}
                className="mb-2"
              />
              {isLoadingTutors && (
                <div className="absolute top-full left-0 mt-1 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Buscando docentes...
                </div>
              )}
              {tutorError && <p className="text-xs text-red-600 mt-1">{tutorError}</p>}
              {tutorSearch && (
                <div className="absolute top-full left-0 right-0 border rounded-lg bg-card shadow-lg z-10 max-h-48 overflow-y-auto">
                  {filteredTutors.length > 0 ? (
                    filteredTutors.map((tutor) => (
                      <button
                        key={tutor.id}
                        onClick={() => {
                          setSelectedTutor(tutor)
                          setTutorSearch("")
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-secondary/20 border-b last:border-b-0 transition-colors"
                      >
                        <p className="font-medium">{tutor.nombre}</p>
                        <p className="text-xs text-muted-foreground">{tutor.email}</p>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-muted-foreground">No se encontraron docentes</div>
                  )}
                </div>
              )}
            </div>

            {selectedTutor && (
              <div className="border rounded-lg p-4 bg-secondary/15 dark:bg-primary/20">
                <p className="font-semibold text-foreground">{selectedTutor.nombre}</p>
                <p className="text-sm text-muted-foreground">{selectedTutor.email}</p>
                <p className="text-sm text-muted-foreground">{selectedTutor.telefono}</p>
                {selectedTutor.externo && <p className="text-xs text-blue-600 mt-1">Tutor Externo</p>}
              </div>
            )}

            <Button
              onClick={() => setShowExternalTutorModal(true)}
              variant="outline"
              className="w-full gap-2 bg-transparent"
            >
              <Plus className="w-4 h-4" />
              Agregar Tutor Externo
            </Button>
          </div>

          {/* Título del proyecto */}
          <div>
            <label className="block text-sm font-medium mb-2">Título del Proyecto de Grado</label>
            <Input
              placeholder="Ingresa el título de tu proyecto..."
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
            />
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant="outline"
              className="flex gap-2 flex-1 bg-transparent"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? "Guardar" : "Editar"}
            </Button>
            <Button onClick={() => handlePrintDocument("aceptacion")} className="flex gap-2 flex-1 bg-primary">
              <Printer className="w-4 h-4" />
              Imprimir Carta de Aceptación
            </Button>
            <Button onClick={() => handlePrintDocument("tutor")} className="flex gap-2 flex-1 bg-cyan">
              <Printer className="w-4 h-4" />
              Imprimir Carta de Tutor
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal para tutor externo */}
      <Dialog open={showExternalTutorModal} onOpenChange={setShowExternalTutorModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Agregar Tutor Externo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre Completo</label>
              <Input
                placeholder="Nombre del tutor externo"
                value={externalTutorData.nombre}
                onChange={(e) => setExternalTutorData({ ...externalTutorData, nombre: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
              <Input
                type="email"
                placeholder="correo@example.com"
                value={externalTutorData.email}
                onChange={(e) => setExternalTutorData({ ...externalTutorData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <Input
                placeholder="+591 7xxxxxxxx"
                value={externalTutorData.telefono}
                onChange={(e) => setExternalTutorData({ ...externalTutorData, telefono: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Especialidad</label>
              <Input
                placeholder="Especialidad del tutor"
                value={externalTutorData.especialidad}
                onChange={(e) => setExternalTutorData({ ...externalTutorData, especialidad: e.target.value })}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddExternalTutor} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                Guardar
              </Button>
              <Button
                onClick={() => setShowExternalTutorModal(false)}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
