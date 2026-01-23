"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDown } from "lucide-react"

const PASOS_PROCESO = [
  {
    numero: 1,
    titulo: "Presentación de Propuesta",
    descripcion: "Envío de propuesta inicial del proyecto de grado",
    color: "bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700",
  },
  {
    numero: 2,
    titulo: "Revisión y Aprobación",
    descripcion: "Evaluación y aprobación del asesor académico",
    color: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700",
  },
  {
    numero: 3,
    titulo: "Avances del Proyecto",
    descripcion: "Entregas periódicas al 30%, 60% y 90% de avance",
    color: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
  },
  {
    numero: 4,
    titulo: "Defensa I (Primer Tribunal)",
    descripcion: "Presentación ante tribunal de expertos (Perfil o Marco Teórico)",
    color: "bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700",
  },
  {
    numero: 5,
    titulo: "Ajustes y Revisión Final",
    descripcion: "Incorporación de observaciones y mejoras sugeridas",
    color: "bg-cyan-100 dark:bg-cyan-900/30 border-cyan-300 dark:border-cyan-700",
  },
  {
    numero: 6,
    titulo: "Defensa II (Tribunal Final)",
    descripcion: "Presentación final del proyecto completo",
    color: "bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700",
  },
  {
    numero: 7,
    titulo: "Aprobación Final",
    descripcion: "Obtención del grado académico y documentación final",
    color: "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700",
  },
]

export default function FlujogramaPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2 dark:text-white">Flujograma del Proceso</h1>
        <p className="text-muted-foreground">Visualización del proceso completo de trabajos de grado</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-3">
            {PASOS_PROCESO.map((paso, index) => (
              <div key={paso.numero} className="w-full flex flex-col items-center">
                {/* Paso */}
                <div className={`w-full max-w-md border-2 rounded-lg p-4 text-center ${paso.color}`}>
                  <Badge className="bg-primary mb-2">{paso.numero}</Badge>
                  <h3 className="font-bold text-foreground mb-1">{paso.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{paso.descripcion}</p>
                </div>

                {/* Flecha */}
                {index < PASOS_PROCESO.length - 1 && (
                  <div className="py-2">
                    <ArrowDown className="w-6 h-6 text-primary animate-bounce" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Duraciones Aproximadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Propuesta: 1-2 semanas</p>
            <p>• Revisión: 2-3 semanas</p>
            <p>• Desarrollo: 12-16 semanas</p>
            <p>• Defensa I: 1 semana</p>
            <p>• Ajustes: 2-4 semanas</p>
            <p>• Defensa II: 1 semana</p>
            <p>• Aprobación final: 3-5 días</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Requisitos Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Cumplir con todas las entregas a tiempo</p>
            <p>• Seguir normas de formato establecidas</p>
            <p>• Contar con asesoría continua</p>
            <p>• Participar activamente en defensa</p>
            <p>• Incorporar observaciones del tribunal</p>
            <p>• Completar documentación requerida</p>
            <p>• Mantener comunicación constante</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
