"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileDown, FileUp } from "lucide-react"

const TIPOS_REPORTES = [
  {
    id: "revision_avances_estudiante",
    titulo: "Consulta de Revisiones de Avances de TG por Estudiante",
    descripcion: "Reporte individual de revisiones y avances de un estudiante específico",
  },
  {
    id: "revision_avances_general",
    titulo: "Consulta de Revisiones de Avances de TG General",
    descripcion: "Reporte consolidado de revisiones y avances de todos los estudiantes",
  },
  {
    id: "notas_defensa",
    titulo: "Consulta de Notas de Defensa de TG",
    descripcion: "Reporte de calificaciones y evaluaciones de defensas realizadas",
  },
  {
    id: "tutores_revisores",
    titulo: "Consulta de Tutores y Revisores por Especialidad y Gestión",
    descripcion: "Listado de docentes por rol, especialidad y período académico",
  },
  {
    id: "rol_defensas",
    titulo: "Rol de Defensas de Trabajo de Grado",
    descripcion: "Cronograma y programación de defensas próximas",
  },
  {
    id: "proyectos_elaboracion",
    titulo: "Proyectos de Trabajo de Grado en Elaboración",
    descripcion: "Listado de proyectos activos con estado de avance",
  },
]

export default function GenerarReportePage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [fechaInicio, setFechaInicio] = useState("")
  const [fechaFin, setFechaFin] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const handleGenerateReport = async (format: "pdf" | "excel") => {
    if (!selectedReport) {
      alert("Selecciona un tipo de reporte")
      return
    }

    setIsGenerating(true)
    setSuccessMessage("")

    // Simulación de generación
    setTimeout(() => {
      const reportName = TIPOS_REPORTES.find((r) => r.id === selectedReport)?.titulo
      setSuccessMessage(`Reporte "${reportName}" generado exitosamente en formato ${format.toUpperCase()}`)
      setIsGenerating(false)

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(""), 3000)
    }, 1500)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2 dark:text-white">Generar Reportes</h1>
        <p className="text-muted-foreground">Crea reportes personalizados sobre trabajos de grado</p>
      </div>

      {successMessage && (
        <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700">
          <AlertDescription className="text-green-800 dark:text-green-100">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Selección de Reporte */}
      <Card>
        <CardHeader>
          <CardTitle>Tipos de Reportes Disponibles</CardTitle>
          <CardDescription>Selecciona el reporte que deseas generar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {TIPOS_REPORTES.map((reporte) => (
              <button
                key={reporte.id}
                onClick={() => setSelectedReport(reporte.id)}
                className={`p-4 rounded-lg border-2 transition-all text-left hover:shadow-md ${
                  selectedReport === reporte.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <h3 className="font-medium text-foreground mb-1">{reporte.titulo}</h3>
                <p className="text-xs text-muted-foreground">{reporte.descripcion}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Opciones de Reporte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Opciones de Generación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Inicio</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fecha de Fin</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleGenerateReport("pdf")}
              disabled={isGenerating || !selectedReport}
              className="bg-red-600 hover:bg-red-700 text-white flex gap-2"
            >
              <FileDown className="w-4 h-4" />
              {isGenerating ? "Generando..." : "Generar PDF"}
            </Button>
            <Button
              onClick={() => handleGenerateReport("excel")}
              disabled={isGenerating || !selectedReport}
              className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
            >
              <FileUp className="w-4 h-4" />
              {isGenerating ? "Generando..." : "Generar Excel"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Información */}
      <Card className="bg-secondary/10 border-secondary">
        <CardHeader>
          <CardTitle className="text-base">Información Importante</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Los reportes pueden tardar algunos segundos en generarse según el volumen de datos</p>
          <p>• Los reportes en PDF incluyen formato profesional listo para imprimir</p>
          <p>• Los reportes en Excel pueden ser editados y procesados en cualquier aplicación compatible</p>
          <p>• Se recomienda generar reportes regularmente para seguimiento académico</p>
        </CardContent>
      </Card>
    </div>
  )
}
