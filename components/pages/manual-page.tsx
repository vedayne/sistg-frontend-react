"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LogIn, User, FileText, BookOpen, Download, BarChart3 } from "lucide-react"

const MANUAL_SECTIONS = [
  {
    titulo: "Inicio de Sesión",
    contenido:
      "Para acceder al sistema, utiliza tu correo institucional (@emi.edu.bo) y contraseña. Al primer acceso, deberás cambiar tu contraseña de forma obligatoria.",
    icon: LogIn,
  },
  {
    titulo: "Perfil de Usuario",
    contenido:
      "En esta sección puedes ver tus datos personales, información académica, cambiar tu contraseña en cualquier momento y actualizar tu foto de perfil.",
    icon: User,
  },
  {
    titulo: "Módulo de Entregas",
    contenido:
      "Visualiza todas tus entregas de trabajo de grado. Puedes filtrar por estudiante, fase, gestión y especialidad para encontrar rápidamente la información.",
    icon: FileText,
  },
  {
    titulo: "Módulo de Defensas",
    contenido:
      "Consulta las fechas, detalles y notas de tus defensas académicas, así como comentarios del tribunal. Visualiza información de proyectos completos.",
    icon: BookOpen,
  },
  {
    titulo: "Documentación",
    contenido:
      "Accede a 8 tipos de documentos: cartas de invitación, aceptación, bitácoras, avales, artículos, registros SENAPI, actas y notas de servicio.",
    icon: Download,
  },
  {
    titulo: "Generar Reportes",
    contenido:
      "Genera reportes personalizados sobre revisiones de avances, defensas, tutores, revisores y rol de defensas. Exporta en PDF o Excel.",
    icon: BarChart3,
  },
]

export default function ManualPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Manual de Usuario</h1>
        <p className="text-muted-foreground">Guía completa de uso del sistema SISTG</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MANUAL_SECTIONS.map((section, index) => {
          const Icon = section.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-all border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg text-foreground">{section.titulo}</CardTitle>
                  <Icon className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{section.contenido}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tips adicionales */}
      <Card className="bg-secondary/10 border-secondary">
        <CardHeader>
          <CardTitle className="text-primary">Consejos Útiles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>• Cambiar tu contraseña regularmente por seguridad</p>
          <p>• Utilizar los filtros para búsquedas más específicas</p>
          <p>• Descargar documentos con anticipación antes de entregas</p>
          <p>• Revisar regularmente el estado de tus entregas y defensas</p>
          <p>• Contactar al soporte si encuentras problemas</p>
        </CardContent>
      </Card>
    </div>
  )
}
