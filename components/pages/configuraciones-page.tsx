"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TIPOS_MIEMBRO = [
  { id: 1, nombre: "Administrador", description: "Acceso total al sistema" },
  { id: 2, nombre: "Docente de Trabajo de Grado", description: "Gestión de TG asignados" },
  { id: 3, nombre: "Tutor", description: "Tutoría de proyectos" },
  { id: 4, nombre: "Revisor", description: "Revisión de entregas" },
  { id: 5, nombre: "Estudiante", description: "Acceso a perfil y entregas" },
  { id: 6, nombre: "Revisor Externa", description: "Revisión externa" },
  { id: 7, nombre: "Jefe de Carrera", description: "Gestión de carrera" },
  { id: 8, nombre: "Secretaria", description: "Apoyo administrativo" },
  { id: 9, nombre: "DDE", description: "Dirección de Educación" },
  { id: 10, nombre: "UTIC", description: "Unidad Técnica" },
]

const UNIDADES_ACADEMICAS = [
  { id: 1, nombre: "EMI Central", sigla: "CENTRAL", ubicacion: "La Paz" },
  { id: 2, nombre: "Unidad Académica La Paz", sigla: "UALP", ubicacion: "La Paz" },
  { id: 3, nombre: "Unidad Académica Santa Cruz", sigla: "UASC", ubicacion: "Santa Cruz" },
  { id: 4, nombre: "Unidad Académica Cochabamba", sigla: "UACB", ubicacion: "Cochabamba" },
  { id: 5, nombre: "Unidad Académica Riberalta", sigla: "UARIB", ubicacion: "Riberalta" },
  { id: 6, nombre: "Unidad Académica del Trópico", sigla: "UATROPICO", ubicacion: "Trópico" },
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

export default function ConfiguracionesPage() {
  const [activeTab, setActiveTab] = useState("miembros")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Configuraciones del Sistema</h1>
        <p className="text-muted-foreground">Gestión de tipos de miembros, unidades académicas y fases</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="miembros">Tipos de Miembro</TabsTrigger>
          <TabsTrigger value="unidades">Unidades Académicas</TabsTrigger>
          <TabsTrigger value="fases">Fases</TabsTrigger>
        </TabsList>

        {/* Tipos de Miembro */}
        <TabsContent value="miembros" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TIPOS_MIEMBRO.map((tipo) => (
              <Card key={tipo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Badge className="bg-primary mb-2">{tipo.id}</Badge>
                      <h3 className="font-bold text-foreground mb-1">{tipo.nombre}</h3>
                      <p className="text-sm text-muted-foreground">{tipo.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Unidades Académicas */}
        <TabsContent value="unidades" className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold">Nombre</th>
                  <th className="text-left py-3 px-4 font-bold">Sigla</th>
                  <th className="text-left py-3 px-4 font-bold">Ubicación</th>
                </tr>
              </thead>
              <tbody>
                {UNIDADES_ACADEMICAS.map((unidad) => (
                  <tr key={unidad.id} className="border-b hover:bg-secondary/50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4 font-medium">{unidad.nombre}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{unidad.sigla}</Badge>
                    </td>
                    <td className="py-3 px-4">{unidad.ubicacion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Fases */}
        <TabsContent value="fases" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {FASES.map((fase, idx) => (
              <Card key={idx} className="border-l-4 border-l-primary">
                <CardContent className="pt-4">
                  <Badge className="bg-secondary text-secondary-foreground mb-2">{idx + 1}</Badge>
                  <p className="font-medium text-foreground text-sm">{fase}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
