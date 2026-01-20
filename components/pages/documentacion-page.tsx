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
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"

const buildControlDetalles = () =>
  Array.from({ length: 12 }, () => ({
    detalle: "",
    presentaObservacion: false,
    observacionSubsanada: false,
    conforme: false,
  }))

const buildControlCumple = () =>
  Array.from({ length: 4 }, () => ({
    cumple: false,
    noCumple: false,
  }))

const controlCumpleLabels = [
  "Cumplimiento de formato (Numeracion, Tipo de letra, Parrafo, Etc.)",
  "Redaccion, gramatica y ortografia del trabajo",
  "Relacion Titulo - Problematica - Objetivos",
  "Profundidad y Pertinencia del Trabajo",
]

export default function DocumentacionPage() {
  const { toast } = useToast()
  const { user } = useAuth()
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
  const [showCartaPerfilModal, setShowCartaPerfilModal] = useState(false)
  const [showInformeRevisionModal, setShowInformeRevisionModal] = useState(false)
  const [showTemarioModal, setShowTemarioModal] = useState(false)
  const [showControlModal, setShowControlModal] = useState(false)
  const [notaForm, setNotaForm] = useState({
    idProyecto: "",
    cite: "",
    fecha: new Date().toISOString().slice(0, 10),
    fechaDefensa: new Date().toISOString().slice(0, 10),
    horaDefensa: "12:00",
    fase: "",
  })
  const [showNotaEmpastadoModal, setShowNotaEmpastadoModal] = useState(false)
  const [notaEmpastadoForm, setNotaEmpastadoForm] = useState({
    idProyecto: "",
    cite: "",
    ciudad: "LA PAZ",
    fecha: new Date().toISOString().slice(0, 10),
    fechaPresentacion: new Date().toISOString().slice(0, 10),
  })
  const [cartaPerfilForm, setCartaPerfilForm] = useState({
    idProyecto: "",
    cite: "",
    ciudad: "LA PAZ",
    fecha: new Date().toISOString().slice(0, 10),
    fase: "",
    anexos: "",
  })
  const [informeRevisionForm, setInformeRevisionForm] = useState({
    idProyecto: "",
    ciudad: "LA PAZ",
    fecha: new Date().toISOString().slice(0, 10),
    fase: "",
  })
  const [temarioForm, setTemarioForm] = useState({
    idProyecto: "",
    cite: "",
    objeto: "",
    anexos: "S/A",
    ciudad: "LA PAZ",
    fecha: new Date().toISOString().slice(0, 10),
  })
  const [controlForm, setControlForm] = useState({
    idProyecto: "",
    fase: "",
    revisionPor: "",
    fechaDevolucion: new Date().toISOString().slice(0, 10),
    detalles: buildControlDetalles(),
    cumple: buildControlCumple(),
    observaciones: "",
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
  const [showMemoModal, setShowMemoModal] = useState(false)
  const [showMemoAsignacionModal, setShowMemoAsignacionModal] = useState(false)
  const [showAvalModal, setShowAvalModal] = useState(false)
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
  const [memoForm, setMemoForm] = useState({
    idProyecto: "",
    cite: "",
    ciudad: "LA PAZ",
    fecha: new Date().toISOString().slice(0, 10),
    fechaDefensa: new Date().toISOString().slice(0, 10),
    horaDefensa: "12:00",
  })
  const [memoAsignacionForm, setMemoAsignacionForm] = useState({
    idProyecto: "",
    cite: "",
    ciudad: "LA PAZ",
    fecha: new Date().toISOString().slice(0, 10),
  })
  const [avalForm, setAvalForm] = useState({
    idProyecto: "",
    fecha: new Date().toISOString().slice(0, 10),
    fase: "",
    firmante: "tg" as "tg" | "tutor" | "rev1" | "rev2",
  })
  const [notaLoading, setNotaLoading] = useState(false)
  const [actaLoading, setActaLoading] = useState(false)
  const [cartaInvLoading, setCartaInvLoading] = useState(false)
  const [cartaAceLoading, setCartaAceLoading] = useState(false)
  const [memoLoading, setMemoLoading] = useState(false)
  const [memoAsignacionLoading, setMemoAsignacionLoading] = useState(false)
  const [avalLoading, setAvalLoading] = useState(false)
  const [notaEmpastadoLoading, setNotaEmpastadoLoading] = useState(false)
  const [cartaPerfilLoading, setCartaPerfilLoading] = useState(false)
  const [informeRevisionLoading, setInformeRevisionLoading] = useState(false)
  const [temarioLoading, setTemarioLoading] = useState(false)
  const [controlLoading, setControlLoading] = useState(false)
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
    setAvalForm((prev) => {
      const hasMatch = prev.fase && phases.some((fase) => fase.name === prev.fase)
      if (hasMatch) return prev
      return { ...prev, fase: phases[0]?.name || "" }
    })
    setCartaPerfilForm((prev) => {
      const hasMatch = prev.fase && phases.some((fase) => fase.name === prev.fase)
      if (hasMatch) return prev
      return { ...prev, fase: phases[0]?.name || "" }
    })
    setInformeRevisionForm((prev) => {
      const hasMatch = prev.fase && phases.some((fase) => fase.name === prev.fase)
      if (hasMatch) return prev
      return { ...prev, fase: phases[0]?.name || "" }
    })
    setControlForm((prev) => {
      const hasMatch = prev.fase && phases.some((fase) => fase.name === prev.fase)
      if (hasMatch) return prev
      return { ...prev, fase: phases[0]?.name || "" }
    })
  }, [phases])

  useEffect(() => {
    const nombre = user?.persona?.nombreCompleto?.trim()
    if (!nombre) return
    setControlForm((prev) => {
      if (prev.revisionPor) return prev
      return { ...prev, revisionPor: nombre }
    })
  }, [user?.persona?.nombreCompleto])

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
        <Button variant="outline" className="gap-2" onClick={() => setShowNotaEmpastadoModal(true)}>
          <FilePlus className="w-4 h-4" /> Nota de Servicio Empastado
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowCartaPerfilModal(true)}>
          <FilePlus className="w-4 h-4" /> Carta Aprobación de Perfil
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowInformeRevisionModal(true)}>
          <FilePlus className="w-4 h-4" /> Informe Revisión
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setTemarioForm({
              idProyecto: "",
              cite: "",
              objeto: "",
              anexos: "S/A",
              ciudad: "LA PAZ",
              fecha: new Date().toISOString().slice(0, 10),
            })
            setShowTemarioModal(true)
          }}
        >
          <FilePlus className="w-4 h-4" /> Temario
        </Button>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            setControlForm({
              idProyecto: "",
              fase: phases[0]?.name || "",
              revisionPor: user?.persona?.nombreCompleto || "",
              fechaDevolucion: new Date().toISOString().slice(0, 10),
              detalles: buildControlDetalles(),
              cumple: buildControlCumple(),
              observaciones: "",
            })
            setShowControlModal(true)
          }}
        >
          <FilePlus className="w-4 h-4" /> Bitacora
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
        <Button variant="outline" className="gap-2" onClick={() => setShowMemoModal(true)}>
          <FilePlus className="w-4 h-4" /> Memorandum Aviso de Defensa
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowMemoAsignacionModal(true)}>
          <FilePlus className="w-4 h-4" /> Memorandum Asignacion Tutor
        </Button>
        <Button variant="outline" className="gap-2" onClick={() => setShowAvalModal(true)}>
          <FilePlus className="w-4 h-4" /> Aval
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
        <DialogContent className="max-w-7xl w-[98vw] max-h-[85vh] overflow-hidden">
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
            <div className="max-h-[65vh] overflow-y-auto overflow-x-auto">
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
              <Label>Fecha de defensa</Label>
              <Input
                type="date"
                value={notaForm.fechaDefensa}
                onChange={(e) => setNotaForm({ ...notaForm, fechaDefensa: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hora de defensa</Label>
              <Input
                type="time"
                value={notaForm.horaDefensa}
                onChange={(e) => setNotaForm({ ...notaForm, horaDefensa: e.target.value })}
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
                if (!notaForm.idProyecto || !notaForm.cite || !notaForm.fecha || !notaForm.fechaDefensa || !notaForm.horaDefensa) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, CITE, fecha, fecha de defensa y hora son obligatorios",
                  })
                  return
                }
                try {
                  setNotaLoading(true)
                  const fechaLegible = new Date(notaForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const fechaDefensaLegible = new Date(notaForm.fechaDefensa).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.notaServicio({
                    idProyecto: Number(notaForm.idProyecto),
                    cite: notaForm.cite,
                    fecha: fechaLegible,
                    fechaDefensa: fechaDefensaLegible,
                    horaDefensa: notaForm.horaDefensa,
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

      {/* Modal Nota de Servicio Empastado */}
      <Dialog open={showNotaEmpastadoModal} onOpenChange={setShowNotaEmpastadoModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Nota de Servicio Empastado</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={notaEmpastadoForm.idProyecto}
                onChange={(e) => setNotaEmpastadoForm({ ...notaEmpastadoForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={notaEmpastadoForm.cite}
                onChange={(e) => setNotaEmpastadoForm({ ...notaEmpastadoForm, cite: e.target.value })}
                placeholder="Ej. CITE-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={notaEmpastadoForm.ciudad}
                onChange={(e) => setNotaEmpastadoForm({ ...notaEmpastadoForm, ciudad: e.target.value })}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={notaEmpastadoForm.fecha}
                onChange={(e) => setNotaEmpastadoForm({ ...notaEmpastadoForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha límite de presentación</Label>
              <Input
                type="date"
                value={notaEmpastadoForm.fechaPresentacion}
                onChange={(e) => setNotaEmpastadoForm({ ...notaEmpastadoForm, fechaPresentacion: e.target.value })}
              />
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              Estudiante, semestre y gestión se obtienen del proyecto (solo 6to o 10mo semestre).
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowNotaEmpastadoModal(false)}>Cancelar</Button>
            <Button
              disabled={notaEmpastadoLoading}
              onClick={async () => {
                if (!notaEmpastadoForm.idProyecto || !notaEmpastadoForm.cite || !notaEmpastadoForm.ciudad || !notaEmpastadoForm.fecha || !notaEmpastadoForm.fechaPresentacion) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, CITE, ciudad, fecha y fecha límite son obligatorios",
                  })
                  return
                }
                try {
                  setNotaEmpastadoLoading(true)
                  const fechaLegible = new Date(notaEmpastadoForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const fechaPresentacionLegible = new Date(notaEmpastadoForm.fechaPresentacion).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.notaServicioEmpastado({
                    idProyecto: Number(notaEmpastadoForm.idProyecto),
                    cite: notaEmpastadoForm.cite,
                    ciudad: notaEmpastadoForm.ciudad,
                    fecha: fechaLegible,
                    fechaPresentacion: fechaPresentacionLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Nota generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowNotaEmpastadoModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Nota de Servicio Empastado"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setNotaEmpastadoLoading(false)
                }
              }}
            >
              {notaEmpastadoLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Carta Aprobación de Perfil */}
      <Dialog open={showCartaPerfilModal} onOpenChange={setShowCartaPerfilModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Carta Aprobación de Perfil</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={cartaPerfilForm.idProyecto}
                onChange={(e) => setCartaPerfilForm({ ...cartaPerfilForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={cartaPerfilForm.cite}
                onChange={(e) => setCartaPerfilForm({ ...cartaPerfilForm, cite: e.target.value })}
                placeholder="Ej. CITE-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={cartaPerfilForm.ciudad}
                onChange={(e) => setCartaPerfilForm({ ...cartaPerfilForm, ciudad: e.target.value })}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={cartaPerfilForm.fecha}
                onChange={(e) => setCartaPerfilForm({ ...cartaPerfilForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select
                value={cartaPerfilForm.fase}
                onValueChange={(value) => setCartaPerfilForm({ ...cartaPerfilForm, fase: value })}
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
            </div>
            <div className="grid gap-2">
              <Label>Anexos (opcional)</Label>
              <Input
                value={cartaPerfilForm.anexos}
                onChange={(e) => setCartaPerfilForm({ ...cartaPerfilForm, anexos: e.target.value })}
                placeholder="S/A"
              />
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              Estudiante, docente TG y semestre se obtienen del proyecto en el backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowCartaPerfilModal(false)}>Cancelar</Button>
            <Button
              disabled={cartaPerfilLoading}
              onClick={async () => {
                if (!cartaPerfilForm.idProyecto || !cartaPerfilForm.cite || !cartaPerfilForm.ciudad || !cartaPerfilForm.fecha || !cartaPerfilForm.fase) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, CITE, ciudad, fecha y fase son obligatorios",
                  })
                  return
                }
                try {
                  setCartaPerfilLoading(true)
                  const fechaLegible = new Date(cartaPerfilForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.cartaAprobacionPerfil({
                    idProyecto: Number(cartaPerfilForm.idProyecto),
                    cite: cartaPerfilForm.cite,
                    ciudad: cartaPerfilForm.ciudad,
                    fecha: fechaLegible,
                    fase: cartaPerfilForm.fase,
                    anexos: cartaPerfilForm.anexos || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Carta generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowCartaPerfilModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Carta de Aprobación"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setCartaPerfilLoading(false)
                }
              }}
            >
              {cartaPerfilLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Informe Revision */}
      <Dialog open={showInformeRevisionModal} onOpenChange={setShowInformeRevisionModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Informe de Revision</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={informeRevisionForm.idProyecto}
                onChange={(e) => setInformeRevisionForm({ ...informeRevisionForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={informeRevisionForm.ciudad}
                onChange={(e) => setInformeRevisionForm({ ...informeRevisionForm, ciudad: e.target.value })}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={informeRevisionForm.fecha}
                onChange={(e) => setInformeRevisionForm({ ...informeRevisionForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select
                value={informeRevisionForm.fase}
                onValueChange={(value) => setInformeRevisionForm({ ...informeRevisionForm, fase: value })}
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
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              Estudiante, modalidad y docentes se obtienen del proyecto en el backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowInformeRevisionModal(false)}>Cancelar</Button>
            <Button
              disabled={informeRevisionLoading}
              onClick={async () => {
                if (!informeRevisionForm.idProyecto || !informeRevisionForm.ciudad || !informeRevisionForm.fecha || !informeRevisionForm.fase) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, ciudad, fecha y fase son obligatorios",
                  })
                  return
                }
                try {
                  setInformeRevisionLoading(true)
                  const fechaLegible = new Date(informeRevisionForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.informeRevision({
                    idProyecto: Number(informeRevisionForm.idProyecto),
                    ciudad: informeRevisionForm.ciudad,
                    fecha: fechaLegible,
                    fase: informeRevisionForm.fase,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Informe generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowInformeRevisionModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Informe"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setInformeRevisionLoading(false)
                }
              }}
            >
              {informeRevisionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Temario */}
      <Dialog open={showTemarioModal} onOpenChange={setShowTemarioModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Temario</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={temarioForm.idProyecto}
                onChange={(e) => setTemarioForm({ ...temarioForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={temarioForm.cite}
                onChange={(e) => setTemarioForm({ ...temarioForm, cite: e.target.value })}
                placeholder="Ej. CITE-123/2025"
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label>Objeto</Label>
              <Input
                value={temarioForm.objeto}
                onChange={(e) => setTemarioForm({ ...temarioForm, objeto: e.target.value })}
                placeholder="Ej. Aprobación de temario"
              />
            </div>
            <div className="grid gap-2">
              <Label>Anexos</Label>
              <Input
                value={temarioForm.anexos}
                onChange={(e) => setTemarioForm({ ...temarioForm, anexos: e.target.value })}
                placeholder="S/A"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={temarioForm.ciudad}
                onChange={(e) => setTemarioForm({ ...temarioForm, ciudad: e.target.value })}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={temarioForm.fecha}
                onChange={(e) => setTemarioForm({ ...temarioForm, fecha: e.target.value })}
              />
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              El temario se obtiene del proyecto registrado (capítulos y secciones).
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowTemarioModal(false)}>Cancelar</Button>
            <Button
              disabled={temarioLoading}
              onClick={async () => {
                if (!temarioForm.idProyecto || !temarioForm.cite || !temarioForm.objeto || !temarioForm.ciudad || !temarioForm.fecha) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, CITE, objeto, ciudad y fecha son obligatorios",
                  })
                  return
                }
                try {
                  setTemarioLoading(true)
                  const fechaLegible = new Date(temarioForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.temario({
                    idProyecto: Number(temarioForm.idProyecto),
                    cite: temarioForm.cite,
                    objeto: temarioForm.objeto,
                    anexos: temarioForm.anexos || undefined,
                    ciudad: temarioForm.ciudad,
                    fecha: fechaLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Temario generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowTemarioModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Temario"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setTemarioLoading(false)
                }
              }}
            >
              {temarioLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Bitacora */}
      <Dialog open={showControlModal} onOpenChange={setShowControlModal}>
        <DialogContent className="max-w-[21.59cm] w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-primary">Bitacora</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>ID Proyecto</Label>
                <Input
                  type="number"
                  value={controlForm.idProyecto}
                  onChange={(e) => setControlForm({ ...controlForm, idProyecto: e.target.value })}
                  placeholder="ID del proyecto"
                />
              </div>
              <div className="grid gap-2">
                <Label>Fase</Label>
                <Select
                  value={controlForm.fase}
                  onValueChange={(value) => setControlForm({ ...controlForm, fase: value })}
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
              </div>
              <div className="grid gap-2">
                <Label>Revision por</Label>
                <Input
                  value={controlForm.revisionPor}
                  onChange={(e) => setControlForm({ ...controlForm, revisionPor: e.target.value })}
                  placeholder="Nombre del revisor"
                />
              </div>
              <div className="grid gap-2">
                <Label>Fecha de devolucion</Label>
                <Input
                  type="date"
                  value={controlForm.fechaDevolucion}
                  onChange={(e) => setControlForm({ ...controlForm, fechaDevolucion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Detalle de observaciones</div>
              <div className="rounded-lg border">
                <div className="grid grid-cols-[44px_minmax(0,1fr)_120px_140px_100px] gap-2 bg-muted px-2 py-2 text-[11px] font-semibold uppercase">
                  <div className="text-center">Nº</div>
                  <div>Detalle</div>
                  <div className="text-center">Presenta</div>
                  <div className="text-center">Subsanada</div>
                  <div className="text-center">Conforme</div>
                </div>
                {controlForm.detalles.map((row, index) => (
                  <div
                    key={`control-detalle-${index}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_120px_140px_100px] gap-2 border-t px-2 py-2 text-sm items-center"
                  >
                    <div className="text-center">{index + 1}</div>
                    <Input
                      value={row.detalle}
                      onChange={(e) => {
                        const value = e.target.value
                        setControlForm((prev) => {
                          const detalles = [...prev.detalles]
                          detalles[index] = { ...detalles[index], detalle: value }
                          return { ...prev, detalles }
                        })
                      }}
                      placeholder="Detalle"
                      className="h-8"
                    />
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={row.presentaObservacion}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlForm((prev) => {
                            const detalles = [...prev.detalles]
                            detalles[index] = { ...detalles[index], presentaObservacion: value }
                            return { ...prev, detalles }
                          })
                        }}
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={row.observacionSubsanada}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlForm((prev) => {
                            const detalles = [...prev.detalles]
                            detalles[index] = { ...detalles[index], observacionSubsanada: value }
                            return { ...prev, detalles }
                          })
                        }}
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={row.conforme}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlForm((prev) => {
                            const detalles = [...prev.detalles]
                            detalles[index] = { ...detalles[index], conforme: value }
                            return { ...prev, detalles }
                          })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-semibold">Verificacion de cumplimiento</div>
              <div className="rounded-lg border">
                <div className="grid grid-cols-[44px_minmax(0,1fr)_120px_120px] gap-2 bg-muted px-2 py-2 text-[11px] font-semibold uppercase">
                  <div className="text-center">Nº</div>
                  <div>Detalle</div>
                  <div className="text-center">Cumple</div>
                  <div className="text-center">No cumple</div>
                </div>
                {controlCumpleLabels.map((label, index) => (
                  <div
                    key={`control-cumple-${index}`}
                    className="grid grid-cols-[44px_minmax(0,1fr)_120px_120px] gap-2 border-t px-2 py-2 text-sm items-start"
                  >
                    <div className="text-center">{index + 1}</div>
                    <div className="text-sm leading-snug">{label}</div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={controlForm.cumple[index]?.cumple}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlForm((prev) => {
                            const cumple = [...prev.cumple]
                            cumple[index] = { ...cumple[index], cumple: value }
                            return { ...prev, cumple }
                          })
                        }}
                      />
                    </div>
                    <div className="flex justify-center items-center">
                      <Checkbox
                        checked={controlForm.cumple[index]?.noCumple}
                        onCheckedChange={(checked) => {
                          const value = checked === true
                          setControlForm((prev) => {
                            const cumple = [...prev.cumple]
                            cumple[index] = { ...cumple[index], noCumple: value }
                            return { ...prev, cumple }
                          })
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Observaciones</Label>
              <Textarea
                value={controlForm.observaciones}
                onChange={(e) => setControlForm({ ...controlForm, observaciones: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowControlModal(false)}>Cancelar</Button>
            <Button
              disabled={controlLoading}
              onClick={async () => {
                if (!controlForm.idProyecto || !controlForm.fase || !controlForm.revisionPor || !controlForm.fechaDevolucion) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, fase, revisor y fecha son obligatorios",
                  })
                  return
                }
                try {
                  setControlLoading(true)
                  const fechaLegible = new Date(controlForm.fechaDevolucion).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.bitacora({
                    idProyecto: Number(controlForm.idProyecto),
                    fase: controlForm.fase,
                    revisionPor: controlForm.revisionPor,
                    fechaDevolucion: fechaLegible,
                    detalles: controlForm.detalles,
                    cumple: controlForm.cumple,
                    observaciones: controlForm.observaciones || undefined,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Bitacora generada", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowControlModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar la Bitacora"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setControlLoading(false)
                }
              }}
            >
              {controlLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
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

      {/* Modal Memorandum Aviso de Defensa */}
      <Dialog open={showMemoModal} onOpenChange={setShowMemoModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Generar Memorandum Aviso de Defensa</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={memoForm.idProyecto}
                onChange={(e) => setMemoForm({ ...memoForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={memoForm.cite}
                onChange={(e) => setMemoForm({ ...memoForm, cite: e.target.value })}
                placeholder="Ej. MEMO-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={memoForm.ciudad}
                onChange={(e) => setMemoForm({ ...memoForm, ciudad: e.target.value })}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={memoForm.fecha}
                onChange={(e) => setMemoForm({ ...memoForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha de defensa</Label>
              <Input
                type="date"
                value={memoForm.fechaDefensa}
                onChange={(e) => setMemoForm({ ...memoForm, fechaDefensa: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Hora de defensa</Label>
              <Input
                type="time"
                value={memoForm.horaDefensa}
                onChange={(e) => setMemoForm({ ...memoForm, horaDefensa: e.target.value })}
              />
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              El nombre del estudiante y la especialidad se obtienen del proyecto en el backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowMemoModal(false)}>Cancelar</Button>
            <Button
              disabled={memoLoading}
              onClick={async () => {
                if (!memoForm.idProyecto || !memoForm.cite || !memoForm.ciudad || !memoForm.fecha || !memoForm.fechaDefensa || !memoForm.horaDefensa) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, CITE, ciudad, fecha y datos de defensa son obligatorios",
                  })
                  return
                }
                try {
                  setMemoLoading(true)
                  const fechaLegible = new Date(memoForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const fechaDefensaLegible = new Date(memoForm.fechaDefensa).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.memoAvisoDefensa({
                    idProyecto: Number(memoForm.idProyecto),
                    cite: memoForm.cite,
                    ciudad: memoForm.ciudad,
                    fecha: fechaLegible,
                    fechaDefensa: fechaDefensaLegible,
                    horaDefensa: memoForm.horaDefensa,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Memorandum generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowMemoModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Memorandum"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setMemoLoading(false)
                }
              }}
            >
              {memoLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Memorandum Asignacion Tutor */}
      <Dialog open={showMemoAsignacionModal} onOpenChange={setShowMemoAsignacionModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Generar Memorandum Asignacion Tutor</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={memoAsignacionForm.idProyecto}
                onChange={(e) => setMemoAsignacionForm({ ...memoAsignacionForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>CITE</Label>
              <Input
                value={memoAsignacionForm.cite}
                onChange={(e) => setMemoAsignacionForm({ ...memoAsignacionForm, cite: e.target.value })}
                placeholder="Ej. MEMO-123/2024"
              />
            </div>
            <div className="grid gap-2">
              <Label>Ciudad</Label>
              <Input
                value={memoAsignacionForm.ciudad}
                onChange={(e) => setMemoAsignacionForm({ ...memoAsignacionForm, ciudad: e.target.value })}
                placeholder="Ej. LA PAZ"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={memoAsignacionForm.fecha}
                onChange={(e) => setMemoAsignacionForm({ ...memoAsignacionForm, fecha: e.target.value })}
              />
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              El tutor, estudiante y especialidad se obtienen del proyecto en el backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowMemoAsignacionModal(false)}>Cancelar</Button>
            <Button
              disabled={memoAsignacionLoading}
              onClick={async () => {
                if (!memoAsignacionForm.idProyecto || !memoAsignacionForm.cite || !memoAsignacionForm.ciudad || !memoAsignacionForm.fecha) {
                  toast({
                    variant: "destructive",
                    title: "ID de proyecto, CITE, ciudad y fecha son obligatorios",
                  })
                  return
                }
                try {
                  setMemoAsignacionLoading(true)
                  const fechaLegible = new Date(memoAsignacionForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.memoAsignacionTutor({
                    idProyecto: Number(memoAsignacionForm.idProyecto),
                    cite: memoAsignacionForm.cite,
                    ciudad: memoAsignacionForm.ciudad,
                    fecha: fechaLegible,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Memorandum generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowMemoAsignacionModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Memorandum"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setMemoAsignacionLoading(false)
                }
              }}
            >
              {memoAsignacionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Aval */}
      <Dialog open={showAvalModal} onOpenChange={setShowAvalModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-primary">Generar Aval</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>ID Proyecto</Label>
              <Input
                type="number"
                value={avalForm.idProyecto}
                onChange={(e) => setAvalForm({ ...avalForm, idProyecto: e.target.value })}
                placeholder="ID del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>Fecha</Label>
              <Input
                type="date"
                value={avalForm.fecha}
                onChange={(e) => setAvalForm({ ...avalForm, fecha: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Select
                value={avalForm.fase}
                onValueChange={(value) => setAvalForm({ ...avalForm, fase: value })}
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
            </div>
            <div className="grid gap-2">
              <Label>Firmante</Label>
              <Select
                value={avalForm.firmante}
                onValueChange={(value) =>
                  setAvalForm({ ...avalForm, firmante: value as "tg" | "tutor" | "rev1" | "rev2" })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona firmante" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tg">Docente TG</SelectItem>
                  <SelectItem value="tutor">Tutor</SelectItem>
                  <SelectItem value="rev1">Revisor 1</SelectItem>
                  <SelectItem value="rev2">Revisor 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-full text-xs text-muted-foreground">
              El nombre del estudiante, carrera y jefe de carrera se obtienen del proyecto en el backend.
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowAvalModal(false)}>Cancelar</Button>
            <Button
              disabled={avalLoading}
              onClick={async () => {
                if (!avalForm.idProyecto || !avalForm.fecha || !avalForm.fase || !avalForm.firmante) {
                  toast({ variant: "destructive", title: "ID de proyecto, fecha, fase y firmante son obligatorios" })
                  return
                }
                try {
                  setAvalLoading(true)
                  const fechaLegible = new Date(avalForm.fecha).toLocaleDateString("es-BO", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  const resp = await apiClient.reportes.aval({
                    idProyecto: Number(avalForm.idProyecto),
                    fecha: fechaLegible,
                    fase: avalForm.fase,
                    firmante: avalForm.firmante,
                  })
                  await openPreview(resp.archivoId, resp.filename)
                  toast({ title: "Aval generado", description: "Se generó el PDF y se abrió la vista previa." })
                  setShowAvalModal(false)
                } catch (err) {
                  const msg = err instanceof Error ? err.message : "No se pudo generar el Aval"
                  toast({ variant: "destructive", title: "Error", description: msg })
                } finally {
                  setAvalLoading(false)
                }
              }}
            >
              {avalLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Generar
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
