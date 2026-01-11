"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FilePlus, Loader2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { apiClient } from "@/lib/api-client"
import type { DocumentTypeSummaryResponse, DocumentTypeSummary, DocumentFileRecord, Phase } from "@/lib/types"

export default function DocumentacionPage() {
  const { toast } = useToast()
  const [summary, setSummary] = useState<DocumentTypeSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [summaryError, setSummaryError] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<DocumentTypeSummary | null>(null)
  const [files, setFiles] = useState<DocumentFileRecord[]>([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [showFilesModal, setShowFilesModal] = useState(false)
  const [phases, setPhases] = useState<Phase[]>([])
  const [phasesLoading, setPhasesLoading] = useState(false)
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [notaForm, setNotaForm] = useState({
    idProyecto: "",
    cite: "",
    fecha: new Date().toISOString().slice(0, 10),
    fase: "",
  })
  const [showActaModal, setShowActaModal] = useState(false)
  const [actaForm, setActaForm] = useState({
    idProyecto: "",
    cite: "",
    ciudad: "LA PAZ",
    hora: "12:00",
    fecha: new Date().toISOString().slice(0, 10),
    fase: "BORRADOR FINAL",
  })
  const [showCartaInvModal, setShowCartaInvModal] = useState(false)
  const [showCartaAceModal, setShowCartaAceModal] = useState(false)
  const [cartaInvForm, setCartaInvForm] = useState({
    idProyecto: "",
    cite: "",
    fecha: new Date().toISOString().slice(0, 10),
    destinatarioNombre: "",
    destinatarioCargo: "",
  })
  const [cartaAceForm, setCartaAceForm] = useState({
    idProyecto: "",
    cite: "",
    fecha: new Date().toISOString().slice(0, 10),
  })
  const [notaLoading, setNotaLoading] = useState(false)
  const [actaLoading, setActaLoading] = useState(false)
  const [cartaInvLoading, setCartaInvLoading] = useState(false)
  const [cartaAceLoading, setCartaAceLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const downloadArchivo = async (archivoId: number, filename?: string) => {
    const blob = await apiClient.documents.download(archivoId)
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename || `reporte-${archivoId}.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const openPreview = async (archivoId: number, filename?: string) => {
    const blob = await apiClient.documents.download(archivoId)
    const url = URL.createObjectURL(blob)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(url)
    setPreviewName(filename || `reporte-${archivoId}.pdf`)
    setShowPreview(true)
  }

  const handlePreviewOpenChange = (open: boolean) => {
    setShowPreview(open)
    if (!open && previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      setPreviewName("")
    }
  }

  const handleDownloadPreview = () => {
    if (!previewUrl) return
    const a = document.createElement("a")
    a.href = previewUrl
    a.download = previewName || "reporte.pdf"
    a.click()
  }

  useEffect(() => {
    const fetchSummary = async () => {
      setSummaryLoading(true)
      setSummaryError(null)
      try {
        const resp = await apiClient.documents.getTypesSummary()
        setSummary(resp.data)
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No se pudo cargar los tipos de documentos"
        setSummaryError(msg)
      } finally {
        setSummaryLoading(false)
      }
    }
    fetchSummary()
  }, [])

  useEffect(() => {
    if (phases.length > 0) return
    const fetchPhases = async () => {
      setPhasesLoading(true)
      try {
        const resp = await apiClient.phases.list()
        setPhases(resp as Phase[])
      } catch (err) {
        const msg = err instanceof Error ? err.message : "No se pudieron cargar las fases"
        toast({ variant: "destructive", title: "Error", description: msg })
      } finally {
        setPhasesLoading(false)
      }
    }
    fetchPhases()
  }, [phases.length, toast])

  useEffect(() => {
    if (phases.length === 0) return
    setActaForm((prev) => {
      const hasMatch = prev.fase && phases.some((fase) => fase.name === prev.fase)
      if (hasMatch) return prev
      return { ...prev, fase: phases[0]?.name || "" }
    })
  }, [phases])

  const fetchFilesByType = async (type: DocumentTypeSummary) => {
    setSelectedType(type)
    setFiles([])
    setFilesLoading(true)
    setShowFilesModal(true)
    try {
      const resp = await apiClient.documents.getFilesByType(type.tipoDocumentoId)
      setFiles(resp.data.archivos || [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : "No se pudieron cargar los archivos de este tipo"
      toast({ variant: "destructive", title: "Error", description: msg })
    } finally {
      setFilesLoading(false)
    }
  }

  const handleFilesModalOpenChange = (open: boolean) => {
    setShowFilesModal(open)
    if (!open) {
      setSelectedType(null)
      setFiles([])
      setFilesLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Documentación</h1>
        <p className="text-muted-foreground">Acceso a documentos y plantillas del sistema de gestión de TG</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setShowNotaModal(true)}>
          <FilePlus className="w-4 h-4" /> Generar Nota de Servicio
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowActaModal(true)}>
          <FilePlus className="w-4 h-4" /> Generar Acta (Borrador Final)
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowCartaInvModal(true)}>
          <FilePlus className="w-4 h-4" /> Carta de Invitación
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowCartaAceModal(true)}>
          <FilePlus className="w-4 h-4" /> Carta de Aceptación
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tipos de documentos</CardTitle>
          <CardDescription>
            Resumen de archivos generados/cargados en el sistema y acceso a su historial.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {summaryError && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-md p-3 text-sm mb-4">
              {summaryError}
            </div>
          )}
          {summaryLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : summary && summary.tipos.length > 0 ? (
            <div className="space-y-2 mb-4 text-sm text-muted-foreground">
              <span>Total tipos: {summary.totalTipos}</span> • <span>Total archivos: {summary.totalArchivos}</span>
            </div>
          ) : (
            <div className="text-muted-foreground text-sm">No hay tipos de documentos disponibles.</div>
          )}

          {summary && summary.tipos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.tipos.map((tipo) => (
                <Card
                  key={tipo.tipoDocumentoId}
                  className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
                  onClick={() => fetchFilesByType(tipo)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-base text-foreground">{tipo.tipoDocumento}</CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {tipo.descripcion || "Sin descripción"}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tipo.cantidadArchivos} archivos
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showFilesModal} onOpenChange={handleFilesModalOpenChange}>
        <DialogContent className="max-w-7xl w-[98vw]">
          <DialogHeader>
            <DialogTitle className="text-primary">
              {selectedType ? `Archivos: ${selectedType.tipoDocumento}` : "Archivos"}
            </DialogTitle>
          </DialogHeader>
          {selectedType && (
            <p className="text-xs text-muted-foreground">
              Total: {selectedType.cantidadArchivos} archivo(s)
            </p>
          )}
          {filesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : files.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay archivos registrados para este tipo.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="border-b bg-muted/40">
                    <th className="text-left py-2 px-2 font-semibold w-[45%]">Archivo</th>
                    <th className="text-left py-2 px-2 font-semibold w-[30%]">Fecha</th>
                    <th className="text-left py-2 px-2 font-semibold w-[25%]">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((file) => (
                    <tr key={file.id} className="border-b last:border-0">
                      <td className="py-2 px-2 max-w-[420px] truncate" title={file.originalName}>
                        {file.originalName}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground">
                        {new Date(file.createdAt).toLocaleString("es-BO", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="py-2 px-2">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary"
                            onClick={async () => {
                              try {
                                await openPreview(file.id, file.originalName)
                              } catch (err) {
                                const msg = err instanceof Error ? err.message : "No se pudo abrir la vista previa"
                                toast({ variant: "destructive", title: "Error", description: msg })
                              }
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary"
                            onClick={() => downloadArchivo(file.id, file.originalName)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Nota de Servicio */}
      <Dialog open={showNotaModal} onOpenChange={setShowNotaModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Generar Nota de Servicio</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={notaForm.idProyecto}
                onChange={(e) => setNotaForm({ ...notaForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={notaForm.cite}
                onChange={(e) => setNotaForm({ ...notaForm, cite: e.target.value })}
                placeholder="Ej. CITE-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={notaForm.fecha}
                onChange={(e) => setNotaForm({ ...notaForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fase (opcional)</Label>
              <Select
                value={notaForm.fase}
                onValueChange={(value) => setNotaForm({ ...notaForm, fase: value })}
                disabled={phasesLoading || phases.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={phasesLoading ? "Cargando fases..." : "Selecciona fase"} />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((fase) => (
                    <SelectItem key={fase.id} value={fase.name}>
                      {fase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!phasesLoading && phases.length === 0 && (
                <p className="text-xs text-muted-foreground">No hay fases registradas. Crea una en Configuraciones.</p>
              )}
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              Los nombres de postulante, tutor y revisores se obtienen del proyecto en el backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowNotaModal(false)}>Cancelar</Button>
            <Button
              disabled={notaLoading}
              onClick={async () => {
                if (!notaForm.idProyecto || !notaForm.cite || !notaForm.fecha) {
                  toast({ variant: "destructive", title: "ID de proyecto, CITE y fecha son obligatorios" })
                  return
                }
                try {
                  setNotaLoading(true)
                  const fechaLegible = new Date(notaForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.notaServicio({
                    idProyecto: Number(notaForm.idProyecto),
                    cite: notaForm.cite,
                    fecha: fechaLegible,
                    fase: notaForm.fase || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Nota generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowNotaModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Nota de Servicio"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setNotaLoading(false)
                }
              }}
            >
              {notaLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Carta de Invitación (Tutor) */}
      <Dialog open={showCartaInvModal} onOpenChange={setShowCartaInvModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carta Invitación a Tutor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={cartaInvForm.idProyecto}
                onChange={(e) => setCartaInvForm({ ...cartaInvForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE (opcional)</Label>
              <Input value={cartaInvForm.cite} onChange={(e) => setCartaInvForm({ ...cartaInvForm, cite: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={cartaInvForm.fecha}
                onChange={(e) => setCartaInvForm({ ...cartaInvForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Destinatario (nombre)</Label>
              <Input
                value={cartaInvForm.destinatarioNombre}
                onChange={(e) => setCartaInvForm({ ...cartaInvForm, destinatarioNombre: e.target.value })}
                placeholder="Nombre del tutor"
              />
            </div>
            <div className="grid gap-2">
              <Label>Destinatario (cargo)</Label>
              <Input
                value={cartaInvForm.destinatarioCargo}
                onChange={(e) => setCartaInvForm({ ...cartaInvForm, destinatarioCargo: e.target.value })}
                placeholder="DOCENTE DE LA EMI"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El resto de datos (estudiante, proyecto, semestre) se obtienen del backend.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCartaInvModal(false)}>Cancelar</Button>
            <Button
              disabled={cartaInvLoading}
              onClick={async () => {
                if (!cartaInvForm.idProyecto || !cartaInvForm.fecha) {
                  toast({ variant: "destructive", title: "ID de proyecto y fecha son obligatorios" })
                  return
                }
                try {
                  setCartaInvLoading(true)
                  const fechaLegible = new Date(cartaInvForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.cartaInvitacionTutor({
                    idProyecto: Number(cartaInvForm.idProyecto),
                    cite: cartaInvForm.cite || undefined,
                    fecha: fechaLegible,
                    destinatarioNombre: cartaInvForm.destinatarioNombre || undefined,
                    destinatarioCargo: cartaInvForm.destinatarioCargo || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Carta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowCartaInvModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Carta de Invitación"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setCartaInvLoading(false)
                }
              }}
            >
              {cartaInvLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Carta de Aceptación (Tutor) */}
      <Dialog open={showCartaAceModal} onOpenChange={setShowCartaAceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Carta de Aceptación de Tutor</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={cartaAceForm.idProyecto}
                onChange={(e) => setCartaAceForm({ ...cartaAceForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE (opcional)</Label>
              <Input value={cartaAceForm.cite} onChange={(e) => setCartaAceForm({ ...cartaAceForm, cite: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={cartaAceForm.fecha}
                onChange={(e) => setCartaAceForm({ ...cartaAceForm, fecha: e.target.value })}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              El backend obtiene estudiante, jefe de carrera y tutor desde el proyecto.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCartaAceModal(false)}>Cancelar</Button>
            <Button
              disabled={cartaAceLoading}
              onClick={async () => {
                if (!cartaAceForm.idProyecto || !cartaAceForm.fecha) {
                  toast({ variant: "destructive", title: "ID de proyecto y fecha son obligatorios" })
                  return
                }
                try {
                  setCartaAceLoading(true)
                  const fechaLegible = new Date(cartaAceForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.cartaAceptacionTutor({
                    idProyecto: Number(cartaAceForm.idProyecto),
                    cite: cartaAceForm.cite || undefined,
                    fecha: fechaLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Carta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowCartaAceModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Carta de Aceptación"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setCartaAceLoading(false)
                }
              }}
            >
              {cartaAceLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Acta de Aprobación */}
      <Dialog open={showActaModal} onOpenChange={setShowActaModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Generar Acta de Aprobación</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={actaForm.idProyecto}
                onChange={(e) => setActaForm({ ...actaForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input value={actaForm.cite} onChange={(e) => setActaForm({ ...actaForm, cite: e.target.value })} placeholder="Ej. 082" />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input value={actaForm.ciudad} onChange={(e) => setActaForm({ ...actaForm, ciudad: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Hora</Label>
              <Input value={actaForm.hora} onChange={(e) => setActaForm({ ...actaForm, hora: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={actaForm.fecha}
                onChange={(e) => setActaForm({ ...actaForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select
                value={actaForm.fase}
                onValueChange={(value) => setActaForm({ ...actaForm, fase: value })}
                disabled={phasesLoading || phases.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={phasesLoading ? "Cargando fases..." : "Selecciona fase"} />
                </SelectTrigger>
                <SelectContent>
                  {phases.map((fase) => (
                    <SelectItem key={fase.id} value={fase.name}>
                      {fase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!phasesLoading && phases.length === 0 && (
                <p className="text-xs text-muted-foreground">No hay fases registradas. Crea una en Configuraciones.</p>
              )}
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              Los datos de postulante, revisores, tutor y DocTG se obtienen automáticamente del proyecto en backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowActaModal(false)}>Cancelar</Button>
            <Button
              disabled={actaLoading}
              onClick={async () => {
                if (!actaForm.idProyecto || !actaForm.cite || !actaForm.fecha) {
                  toast({ variant: "destructive", title: "ID de proyecto, CITE y fecha son obligatorios" })
                  return
                }
                try {
                  setActaLoading(true)
                  const fechaLarga = new Date(actaForm.fecha).toLocaleDateString("es-BO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.actaAprobacion({
                    idProyecto: Number(actaForm.idProyecto),
                    cite: actaForm.cite,
                    ciudad: actaForm.ciudad || undefined,
                    hora: actaForm.hora || undefined,
                    fechaLarga,
                    fase: actaForm.fase || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Acta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowActaModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Acta de Aprobación"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setActaLoading(false)
                }
              }}
            >
              {actaLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar Acta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPreview} onOpenChange={handlePreviewOpenChange}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Vista previa del documento</DialogTitle>
          </DialogHeader>
          {previewUrl ? (
            <iframe title={previewName || "Documento"} src={previewUrl} className="w-full h-[70vh] border rounded-md" />
          ) : (
            <div className="flex items-center justify-center h-[50vh]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={handleDownloadPreview} disabled={!previewUrl}>
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
