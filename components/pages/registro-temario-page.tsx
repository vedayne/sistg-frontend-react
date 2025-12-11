"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, FileText, Download, Eye, AlertTriangle } from "lucide-react"

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

  const [temarioGuardado, setTemarioGuardado] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [showPdfPreview, setShowPdfPreview] = useState(false)

  const generatePDF = () => {
    const pdfContent = `
REGISTRO DE TEMARIO TENTATIVO - EMI

Modalidad: ${MODALITIES.find((m) => m.id === selectedModality)?.label}

DATOS DEL ESTUDIANTE
---------------------

INFORMACIÓN DEL TRABAJO
---------------------
Título: ${temarioData.titulo}

Objetivos:
${temarioData.objetivos}

Alcance:
${temarioData.alcance}

Metodología:
${temarioData.metodologia}

${temarioData.capitulos ? `Estructura de Capítulos:\n${temarioData.capitulos}` : ""}

NOTA: Este documento es no modificable después de ser guardado.
Para realizar cambios, consulte con su Docente de Trabajo de Grado.
    `
    const blob = new Blob([pdfContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    setPdfUrl(url)
    return url
  }

  const handleSaveClick = () => {
    if (!temarioData.titulo) {
      alert("Por favor completa al menos el título del temario")
      return
    }
    setShowWarningModal(true)
  }

  const handleConfirmSave = () => {
    if (!temarioData.titulo) {
      alert("Por favor completa al menos el título del temario")
      return
    }
    generatePDF()
    setTemarioGuardado(true)
    setShowWarningModal(false)
  }

  const handleNewTemario = () => {
    setTemarioGuardado(false)
    setPdfUrl(null)
    setShowPdfPreview(false)
    setTemarioData({
      titulo: "",
      objetivos: "",
      alcance: "",
      metodologia: "",
      capitulos: "",
    })
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
                    disabled={temarioGuardado}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      selectedModality === mod.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    } ${temarioGuardado ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <p className="font-semibold text-sm">{mod.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {!temarioGuardado ? (
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
                  <Button onClick={handleSaveClick} className="flex-1 bg-primary hover:bg-primary/90 text-white">
                    Guardar Temario
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    Descartar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-700">Temario Guardado Exitosamente</CardTitle>
                  <CardDescription className="text-green-600">
                    Tu temario ha sido guardado y no puede ser modificado. Para realizar cambios, contacta a tu Docente
                    de Trabajo de Grado.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documento PDF del Temario</CardTitle>
                  <CardDescription>Descarga o visualiza tu temario en formato PDF</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => {
                        if (pdfUrl) {
                          const a = document.createElement("a")
                          a.href = pdfUrl
                          a.download = `Temario_${selectedModality}_${new Date().toISOString().split("T")[0]}.txt`
                          a.click()
                        }
                      }}
                      className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </Button>
                    <Button
                      onClick={() => setShowPdfPreview(!showPdfPreview)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      {showPdfPreview ? "Ocultar" : "Ver"} Vista Previa
                    </Button>
                  </div>

                  {showPdfPreview && pdfUrl && (
                    <div className="border rounded-lg p-4 bg-slate-50">
                      <div className="bg-white p-4 rounded border h-96 overflow-y-auto text-sm font-mono whitespace-pre-wrap">
                        {temarioData.titulo && `Título: ${temarioData.titulo}\n\n`}
                        {temarioData.objetivos && `Objetivos:\n${temarioData.objetivos}\n\n`}
                        {temarioData.alcance && `Alcance:\n${temarioData.alcance}\n\n`}
                        {temarioData.metodologia && `Metodología:\n${temarioData.metodologia}\n\n`}
                        {temarioData.capitulos && `Estructura de Capítulos:\n${temarioData.capitulos}`}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Crear Nuevo Temario</CardTitle>
                  <CardDescription>Iniciar el registro de un nuevo temario</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleNewTemario} variant="outline" className="w-full bg-transparent">
                    Crear Nuevo Temario
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
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

      {showWarningModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex gap-3">
                <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <CardTitle className="text-yellow-700">⚠️ Advertencia</CardTitle>
                  <CardDescription className="text-yellow-600">Guardando Temario</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-700">
                Una vez que guardes tu temario, <strong>no será posible modificarlo</strong>. Los datos almacenados
                permanecerán sin cambios.
              </p>
              <p className="text-sm text-gray-700">
                Si deseas realizar cambios después de guardar, deberás{" "}
                <strong>consultar con tu Docente de Trabajo de Grado</strong>.
              </p>
              <div className="flex gap-3 pt-4 border-t">
                <Button onClick={handleConfirmSave} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white">
                  Guardar de Todos Modos
                </Button>
                <Button onClick={() => setShowWarningModal(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
