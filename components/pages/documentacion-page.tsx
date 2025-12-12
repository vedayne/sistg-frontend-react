"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, X, FilePlus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { openNotaServicioWindow } from "@/components/reportes/nota-servicio"
import { useToast } from "@/components/ui/use-toast"

const DOCUMENTOS = [
  {
    id: 1,
    titulo: "Carta de Invitación para Tutoría",
    descripcion: "Formulario para solicitar tutoría en trabajos de grado",
    fecha: "2024-01-10",
    tipo: "Formulario",
    estudiante: "Miguel Ángel Lipa",
    gestion: "2024",
    semestre: "6",
    fase: "Perfil",
  },
  {
    id: 2,
    titulo: "Carta de Aceptación para Tutoría",
    descripcion: "Documento de aceptación de tutoría por parte del tutor",
    fecha: "2024-01-15",
    tipo: "Certificado",
    estudiante: "María López",
    gestion: "2024",
    semestre: "6",
    fase: "Marco Teórico",
  },
  {
    id: 3,
    titulo: "Bitácora de Avances",
    descripcion: "Registro de avances y reuniones durante el TG",
    fecha: "2024-01-20",
    tipo: "Registro",
    estudiante: "Juan Pérez",
    gestion: "2024",
    semestre: "7",
    fase: "Marco Práctico",
  },
  {
    id: 4,
    titulo: "Aval de Tutoría",
    descripcion: "Documento de aval de conclusión de tutoría",
    fecha: "2024-02-01",
    tipo: "Certificado",
    estudiante: "Miguel Ángel Lipa",
    gestion: "2024",
    semestre: "7",
    fase: "Primer Borrador",
  },
  {
    id: 5,
    titulo: "Artículo Científico Template",
    descripcion: "Plantilla para redacción de artículos científicos",
    fecha: "2024-02-10",
    tipo: "Plantilla",
    estudiante: "Ana García",
    gestion: "2024",
    semestre: "8",
    fase: "Borrador Final",
  },
  {
    id: 6,
    titulo: "Registro SENAPI",
    descripcion: "Formulario para registro de derechos intelectuales",
    fecha: "2024-02-15",
    tipo: "Registro",
    estudiante: "María López",
    gestion: "2024",
    semestre: "8",
    fase: "Borrador Final",
  },
  {
    id: 7,
    titulo: "Acta de Defensa",
    descripcion: "Acta oficial de realización de defensa de TG",
    fecha: "2024-03-01",
    tipo: "Acta",
    estudiante: "Miguel Ángel Lipa",
    gestion: "2024",
    semestre: "8",
    fase: "Defensa",
  },
  {
    id: 8,
    titulo: "Nota de Servicio",
    descripcion: "Comunicado interno sobre procesos de TG",
    fecha: "2024-03-05",
    tipo: "Comunicado",
    estudiante: "Juan Pérez",
    gestion: "2024",
    semestre: "7",
    fase: "Primer Borrador",
  },
]

export default function DocumentacionPage() {
  const { toast } = useToast()
  const [selectedDoc, setSelectedDoc] = useState<(typeof DOCUMENTOS)[0] | null>(null)
  const [searchEstudiante, setSearchEstudiante] = useState("")
  const [searchGestion, setSearchGestion] = useState("")
  const [searchSemestre, setSearchSemestre] = useState("")
  const [searchFase, setSearchFase] = useState("")
  const [showNotaModal, setShowNotaModal] = useState(false)
  const [notaForm, setNotaForm] = useState({
    cite: "",
    fecha: new Date().toISOString().slice(0, 10),
    tituloProyecto: "",
    postulante: "",
    tutor: "",
    revisor1: "",
    revisor2: "",
    docenteTG: "",
    fase: "",
    jefeCarrera: "",
    gradoJefe: "",
  })

  const filteredDocumentos = useMemo(() => {
    return DOCUMENTOS.filter((doc) => {
      const matchEstudiante =
        searchEstudiante === "" || doc.estudiante.toLowerCase().includes(searchEstudiante.toLowerCase())
      const matchGestion = searchGestion === "" || doc.gestion === searchGestion
      const matchSemestre = searchSemestre === "" || doc.semestre === searchSemestre
      const matchFase = searchFase === "" || doc.fase.toLowerCase().includes(searchFase.toLowerCase())
      return matchEstudiante && matchGestion && matchSemestre && matchFase
    })
  }, [searchEstudiante, searchGestion, searchSemestre, searchFase])

  const unique = (arr: string[]) => [...new Set(arr)]
  const gestiones = unique(DOCUMENTOS.map((d) => d.gestion))
  const semestres = unique(DOCUMENTOS.map((d) => d.semestre)).sort()
  const fases = unique(DOCUMENTOS.map((d) => d.fase))

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros de Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Estudiante</label>
              <Input
                placeholder="Buscar estudiante..."
                value={searchEstudiante}
                onChange={(e) => setSearchEstudiante(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Gestión</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={searchGestion}
                onChange={(e) => setSearchGestion(e.target.value)}
              >
                <option value="">Todas</option>
                {gestiones.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Semestre</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={searchSemestre}
                onChange={(e) => setSearchSemestre(e.target.value)}
              >
                <option value="">Todos</option>
                {semestres.map((s) => (
                  <option key={s} value={s}>
                    Semestre {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Fase</label>
              <select
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                value={searchFase}
                onChange={(e) => setSearchFase(e.target.value)}
              >
                <option value="">Todas</option>
                {fases.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchEstudiante("")
                  setSearchGestion("")
                  setSearchSemestre("")
                  setSearchFase("")
                }}
                variant="outline"
                className="w-full"
              >
                <X className="w-4 h-4 mr-1" />
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocumentos.length > 0 ? (
          filteredDocumentos.map((doc) => (
            <Card
              key={doc.id}
              className="hover:shadow-lg transition-all cursor-pointer border-l-4 border-l-primary"
              onClick={() => setSelectedDoc(doc)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base text-foreground">{doc.titulo}</CardTitle>
                    <CardDescription className="text-xs mt-1">{doc.fecha}</CardDescription>
                  </div>
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{doc.descripcion}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {doc.tipo}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-cyan-600 hover:text-cyan-700 h-8"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">No se encontraron documentos</div>
        )}
      </div>

      {/* Modal de detalles */}
      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-primary">{selectedDoc?.titulo}</DialogTitle>
          </DialogHeader>
          {selectedDoc && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Tipo</p>
                <Badge className="bg-secondary text-secondary-foreground">{selectedDoc.tipo}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Descripción</p>
                <p className="text-foreground">{selectedDoc.descripcion}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Fecha de Creación</p>
                <p className="text-foreground">{selectedDoc.fecha}</p>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setSelectedDoc(null)}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                >
                  Descargar
                </Button>
                <Button onClick={() => setSelectedDoc(null)} variant="outline" className="flex-1">
                  Cerrar
                </Button>
              </div>
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
            <div className="grid gap-2 md:col-span-2">
              <Label>Título de Proyecto</Label>
              <Input
                value={notaForm.tituloProyecto}
                onChange={(e) => setNotaForm({ ...notaForm, tituloProyecto: e.target.value })}
                placeholder="Título del proyecto"
              />
            </div>
            <div className="grid gap-2">
              <Label>Postulante</Label>
              <Input value={notaForm.postulante} onChange={(e) => setNotaForm({ ...notaForm, postulante: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Tutor</Label>
              <Input value={notaForm.tutor} onChange={(e) => setNotaForm({ ...notaForm, tutor: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Vocal Revisor (Rev 1)</Label>
              <Input value={notaForm.revisor1} onChange={(e) => setNotaForm({ ...notaForm, revisor1: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Vocal Revisor 2 (opcional)</Label>
              <Input value={notaForm.revisor2} onChange={(e) => setNotaForm({ ...notaForm, revisor2: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Docente TG</Label>
              <Input value={notaForm.docenteTG} onChange={(e) => setNotaForm({ ...notaForm, docenteTG: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Fase</Label>
              <Input value={notaForm.fase} onChange={(e) => setNotaForm({ ...notaForm, fase: e.target.value })} placeholder="Ej. BORRADOR FINAL" />
            </div>
            <div className="grid gap-2">
              <Label>Jefe de Carrera</Label>
              <Input value={notaForm.jefeCarrera} onChange={(e) => setNotaForm({ ...notaForm, jefeCarrera: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Grado Jefe</Label>
              <Input value={notaForm.gradoJefe} onChange={(e) => setNotaForm({ ...notaForm, gradoJefe: e.target.value })} />
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setShowNotaModal(false)}>Cancelar</Button>
            <Button
              onClick={() => {
                if (!notaForm.postulante || !notaForm.tutor || !notaForm.revisor1 || !notaForm.docenteTG || !notaForm.tituloProyecto) {
                  toast({ variant: "destructive", title: "Completa los campos obligatorios" })
                  return
                }
                const fechaLegible = notaForm.fecha
                  ? new Date(notaForm.fecha).toLocaleDateString("es-BO", { day: "2-digit", month: "long", year: "numeric" })
                  : ""
                openNotaServicioWindow({
                  fecha: fechaLegible,
                  cite: notaForm.cite || "S/N",
                  tituloProyecto: notaForm.tituloProyecto,
                  postulante: notaForm.postulante,
                  tutor: notaForm.tutor,
                  revisor1: notaForm.revisor1,
                  revisor2: notaForm.revisor2,
                  docenteTG: notaForm.docenteTG,
                  fase: notaForm.fase,
                  jefeCarrera: notaForm.jefeCarrera,
                  gradoJefe: notaForm.gradoJefe,
                })
                setShowNotaModal(false)
              }}
            >
              Generar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
