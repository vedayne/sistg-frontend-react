"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText } from "lucide-react"

type GraduationModality = "tesis" | "proyecto" | "trabajo-dirigido" | "monografia"

const MODALITIES = [
  { id: "tesis", label: "Tesis", description: "Trabajo de investigación original" },
  { id: "proyecto", label: "Proyecto de Grado", description: "Proyecto aplicado" },
  { id: "trabajo-dirigido", label: "Trabajo Dirigido", description: "Trabajo bajo supervisión" },
  { id: "monografia", label: "Monografía", description: "Estudio en profundidad" },
]

export default function RegistroTemarioPage() {
  const [selectedModality, setSelectedModality] = useState<GraduationModality>("tesis")
  const [temarioData, setTemarioData] = useState({
    titulo: "",
    objetivos: "",
    alcance: "",
    metodologia: "",
    capitulos: "",
  })

  const handleSaveTemario = () => {
    if (!temarioData.titulo) {
      alert("Por favor completa al menos el título del temario")
      return
    }
    alert(`Temario tentativo guardado para ${selectedModality}`)
  }

  const getFormFields = () => {
    const baseFields = ["titulo", "objetivos", "alcance", "metodologia"] as const

    switch (selectedModality) {
      case "tesis":
        return [...baseFields, "capitulos"] as const
      case "proyecto":
        return [...baseFields, "capitulos"] as const
      case "trabajo-dirigido":
        return baseFields
      case "monografia":
        return [...baseFields, "capitulos"] as const
      default:
        return baseFields
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Registro de Temario</h1>
        <p className="text-muted-foreground">Completa tu temario tentativo según la modalidad de graduación</p>
      </div>

      <Tabs defaultValue="temario" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="temario" className="flex gap-2">
            <FileText className="w-4 h-4" />
            Temario Tentativo
          </TabsTrigger>
          <TabsTrigger value="modalidades" className="flex gap-2">
            <BookOpen className="w-4 h-4" />
            Modalidades
          </TabsTrigger>
        </TabsList>

        <TabsContent value="temario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecciona tu Modalidad de Graduación</CardTitle>
              <CardDescription>Elige la modalidad que corresponde a tu trabajo de grado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {MODALITIES.map((mod) => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModality(mod.id as GraduationModality)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedModality === mod.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <p className="font-semibold text-sm">{mod.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formulario de Temario Tentativo</CardTitle>
              <CardDescription>
                Modalidad seleccionada: {MODALITIES.find((m) => m.id === selectedModality)?.label}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Título del Trabajo</label>
                <Input
                  placeholder="Ingresa el título de tu trabajo de grado"
                  value={temarioData.titulo}
                  onChange={(e) => setTemarioData({ ...temarioData, titulo: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Objetivos</label>
                <Textarea
                  placeholder="Describe los objetivos de tu trabajo"
                  value={temarioData.objetivos}
                  onChange={(e) => setTemarioData({ ...temarioData, objetivos: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Alcance</label>
                <Textarea
                  placeholder="Define el alcance de tu trabajo"
                  value={temarioData.alcance}
                  onChange={(e) => setTemarioData({ ...temarioData, alcance: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Metodología</label>
                <Textarea
                  placeholder="Describe la metodología a utilizar"
                  value={temarioData.metodologia}
                  onChange={(e) => setTemarioData({ ...temarioData, metodologia: e.target.value })}
                  rows={3}
                />
              </div>

              {selectedModality !== "trabajo-dirigido" && (
                <div>
                  <label className="block text-sm font-medium mb-2">Estructura de Capítulos</label>
                  <Textarea
                    placeholder="Describe la estructura de capítulos de tu trabajo"
                    value={temarioData.capitulos}
                    onChange={(e) => setTemarioData({ ...temarioData, capitulos: e.target.value })}
                    rows={4}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleSaveTemario} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                  Guardar Temario
                </Button>
                <Button variant="outline" className="flex-1 bg-transparent">
                  Descartar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="modalidades" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODALITIES.map((mod) => (
              <Card key={mod.id}>
                <CardHeader>
                  <CardTitle>{mod.label}</CardTitle>
                  <CardDescription>{mod.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  {mod.id === "tesis" && (
                    <>
                      <p>La tesis es un trabajo de investigación original que contribuye al conocimiento.</p>
                      <p>Incluye: Introducción, Marco Teórico, Metodología, Resultados, Conclusiones.</p>
                    </>
                  )}
                  {mod.id === "proyecto" && (
                    <>
                      <p>Proyecto aplicado que soluciona un problema específico o desarrolla una innovación.</p>
                      <p>Incluye: Diagnóstico, Diseño, Implementación, Evaluación.</p>
                    </>
                  )}
                  {mod.id === "trabajo-dirigido" && (
                    <>
                      <p>Trabajo realizado bajo supervisión directa de un tutor especializado.</p>
                      <p>Mayor flexibilidad en estructura, enfoque práctico.</p>
                    </>
                  )}
                  {mod.id === "monografia" && (
                    <>
                      <p>Estudio exhaustivo y profundo sobre un tema específico.</p>
                      <p>Incluye: Recopilación, Análisis, Síntesis de información.</p>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
