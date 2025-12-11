"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Save, X, Plus, Trash2, Loader2, MoreHorizontal, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import type { RoleInfo, Phase, Gestion, ResearchLine, Semester, ResearchArea, MemberType, DocumentType } from "@/lib/types"

export default function ConfiguracionesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("roles")
  const [loading, setLoading] = useState(false)

  // Data States
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [fases, setFases] = useState<Phase[]>([])
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [researchLines, setResearchLines] = useState<ResearchLine[]>([])
  const [researchAreas, setResearchAreas] = useState<ResearchArea[]>([])
  const [semesters, setSemesters] = useState<Semester[]>([])
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([])
  const [docTypes, setDocTypes] = useState<DocumentType[]>([])

  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<string | null>(null) // 'create_fase', 'edit_role', etc.
  const [editItem, setEditItem] = useState<any>(null)

  // Form States (Generic)
  const [formData, setFormData] = useState<any>({})

  // Fetchers
  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === "roles") setRoles(await apiClient.roles.list())
      if (activeTab === "miembros") setMemberTypes((await apiClient.memberTypes.list()).data)
      if (activeTab === "fases") setFases(await apiClient.phases.list())
      if (activeTab === "gestion") setGestiones((await apiClient.gestiones.list()).data)
      if (activeTab === "investigacion") {
        setResearchAreas((await apiClient.researchAreas.list()).data)
        setResearchLines((await apiClient.researchLines.list()).data)
        setSemesters((await apiClient.semesters.list()).data)
      }
      if (activeTab === "documentacion") setDocTypes((await apiClient.documentTypes.list()).data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [activeTab])

  // Generic Handlers
  const openCreate = (type: string) => {
    setDialogType(type)
    setEditItem(null)
    setFormData({})
    setIsDialogOpen(true)
  }

  const openEdit = (type: string, item: any) => {
    setDialogType(type)
    setEditItem(item)
    // Populate form data based on type
    if (type === 'role') setFormData({ name: item.name }) // Only name editable for roles as requested
    if (type === 'member') setFormData({ name: item.name, description: item.description })
    if (type === 'fase') setFormData({ name: item.name })
    if (type === 'gestion') setFormData({ gestion: item.gestion, typeGestion: item.typeGestion, isActive: item.isActive })
    if (type === 'area') setFormData({ name: item.name })
    if (type === 'linea') setFormData({ name: item.name, idAreaInvestigacion: item.idAreaInvestigacion })
    if (type === 'semestre') setFormData({ code: item.code, name: item.name })
    if (type === 'doctype') setFormData({ name: item.name, description: item.description, slug: item.slug })

    setIsDialogOpen(true)
  }

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("¿Estás seguro de eliminar este elemento?")) return
    try {
      if (type === 'member') await apiClient.memberTypes.delete(id)
      if (type === 'gestion') await apiClient.gestiones.delete(id)
      if (type === 'area') await apiClient.researchAreas.delete(id)
      if (type === 'linea') await apiClient.researchLines.delete(id)
      if (type === 'semestre') await apiClient.semesters.delete(id) // Missing implementation, assuming exists or skipping
      if (type === 'doctype') await apiClient.documentTypes.delete(id)

      toast({ title: "Eliminado correctamente" })
      loadData()
    } catch (err) { toast({ variant: "destructive", title: "Error al eliminar" }) }
  }

  const handleSave = async () => {
    try {
      if (dialogType === 'role' && editItem) {
        await apiClient.roles.update(editItem.id, formData.name)
      }
      else if (dialogType === 'member') {
        if (editItem) await apiClient.memberTypes.update(editItem.id, formData)
        else await apiClient.memberTypes.create(formData)
      }
      else if (dialogType === 'fase') {
        if (editItem) await apiClient.phases.update(editItem.id, formData.name)
        else await apiClient.phases.create(formData.name)
      }
      else if (dialogType === 'gestion') {
        if (editItem) await apiClient.gestiones.update(editItem.id, formData)
        else await apiClient.gestiones.create({ ...formData, isActive: true }) // Default active on create
      }
      else if (dialogType === 'area') {
        if (editItem) await apiClient.researchAreas.update(editItem.id, formData.name)
        else await apiClient.researchAreas.create(formData.name)
      }
      else if (dialogType === 'linea') {
        if (editItem) await apiClient.researchLines.update(editItem.id, formData)
        else await apiClient.researchLines.create(formData)
      }
      else if (dialogType === 'semestre') {
        // Semesters usually managed by API for values, but here we can create
        if (editItem) await apiClient.semesters.update(editItem.id, formData)
        else await apiClient.semesters.create(formData)
      }
      else if (dialogType === 'doctype') {
        if (editItem) await apiClient.documentTypes.update(editItem.id, formData)
        else await apiClient.documentTypes.create(formData)
      }

      toast({ title: "Guardado exitosamente" })
      setIsDialogOpen(false)
      loadData()
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "Error al guardar", description: "Verifica los datos e intenta nuevamente." })
    }
  }

  // Renderers for compact tables
  const renderActions = (type: string, item: any) => (
    <div className="flex justify-end gap-2">
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEdit(type, item)}><Edit2 className="w-3 h-3" /></Button>
      {!['role', 'fase'].includes(type) && ( // Roles and Fases have restrictions or different delete patterns (phases usually not deleted)
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => handleDelete(type, item.id)}><Trash2 className="w-3 h-3" /></Button>
      )}
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary">Configuraciones</h1>
          <p className="text-muted-foreground text-xs">Gestión general del sistema</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-3 h-3 mr-2 ${loading ? 'animate-spin' : ''}`} /> Recargar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
          <TabsTrigger value="miembros" className="text-xs">Miembros</TabsTrigger>
          <TabsTrigger value="fases" className="text-xs">Fases</TabsTrigger>
          <TabsTrigger value="gestion" className="text-xs">Gestión</TabsTrigger>
          <TabsTrigger value="investigacion" className="text-xs">Investigación</TabsTrigger>
          <TabsTrigger value="documentacion" className="text-xs">Docs</TabsTrigger>
        </TabsList>

        {/* ROLES */}
        <TabsContent value="roles" className="pt-2">
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {roles.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium text-xs">{r.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.description}</TableCell>
                    <TableCell><Badge variant={r.isActive ? "default" : "secondary"} className="text-[10px]">{r.isActive ? 'Activo' : 'Inactivo'}</Badge></TableCell>
                    <TableCell className="text-right">{renderActions('role', r)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* MIEMBROS */}
        <TabsContent value="miembros" className="pt-2 space-y-2">
          <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('member')}><Plus className="w-3 h-3 mr-2" /> Nuevo Miembro</Button></div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Descripción</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {memberTypes.map(m => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium text-xs">{m.name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{m.description}</TableCell>
                    <TableCell className="text-right">{renderActions('member', m)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* FASES */}
        <TabsContent value="fases" className="pt-2 space-y-2">
          <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('fase')}><Plus className="w-3 h-3 mr-2" /> Nueva Fase</Button></div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Proyectos</TableHead><TableHead className="text-right">Editar</TableHead></TableRow></TableHeader>
              <TableBody>
                {fases.map(f => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-xs">{f.name}</TableCell>
                    <TableCell className="text-xs">{f.projectsCount || 0}</TableCell>
                    <TableCell className="text-right">{renderActions('fase', f)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* GESTION */}
        <TabsContent value="gestion" className="pt-2 space-y-2">
          <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('gestion')}><Plus className="w-3 h-3 mr-2" /> Nueva Gestión</Button></div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Año</TableHead><TableHead>Semestre</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {gestiones.map(g => (
                  <TableRow key={g.id}>
                    <TableCell className="font-bold text-xs">{g.gestion}</TableCell>
                    <TableCell className="text-xs">{g.typeGestion}</TableCell>
                    <TableCell><Badge className={g.isActive ? "bg-green-600 text-[10px]" : "bg-gray-400 text-[10px]"}>{g.isActive ? 'Activa' : 'Cerrada'}</Badge></TableCell>
                    <TableCell className="text-right">{renderActions('gestion', g)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

        {/* INVESTIGACION */}
        <TabsContent value="investigacion" className="pt-2">
          <Tabs defaultValue="areas" className="w-full">
            <div className="flex justify-between items-center mb-2">
              <TabsList className="h-8">
                <TabsTrigger value="areas" className="text-xs">Áreas</TabsTrigger>
                <TabsTrigger value="lineas" className="text-xs">Líneas</TabsTrigger>
                <TabsTrigger value="semestres" className="text-xs">Semestres</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="areas" className="space-y-2">
              <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('area')}><Plus className="w-3 h-3 mr-2" /> Nueva Área</Button></div>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Nombre</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {researchAreas.map(a => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs font-mono">{a.id}</TableCell>
                        <TableCell className="text-xs font-medium">{a.name}</TableCell>
                        <TableCell className="text-right">{renderActions('area', a)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="lineas" className="space-y-2">
              <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('linea')}><Plus className="w-3 h-3 mr-2" /> Nueva Línea</Button></div>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Área</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {researchLines.map(l => (
                      <TableRow key={l.id}>
                        <TableCell className="text-xs font-medium">{l.name}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{l.areaInvestigacion?.name || '-'}</TableCell>
                        <TableCell className="text-right">{renderActions('linea', l)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>

            <TabsContent value="semestres" className="space-y-2">
              <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('semestre')}><Plus className="w-3 h-3 mr-2" /> Nuevo Semestre</Button></div>
              <Card><CardContent className="p-0">
                <Table>
                  <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Nombre</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {semesters.map(s => (
                      <TableRow key={s.id}>
                        <TableCell className="text-xs font-mono">{s.code}</TableCell>
                        <TableCell className="text-xs">{s.name}</TableCell>
                        <TableCell className="text-right">{renderActions('semestre', s)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent></Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* DOCUMENTACION */}
        <TabsContent value="documentacion" className="pt-2 space-y-2">
          <div className="flex justify-end"><Button size="sm" onClick={() => openCreate('doctype')}><Plus className="w-3 h-3 mr-2" /> Nuevo Tipo Doc</Button></div>
          <Card><CardContent className="p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Nombre</TableHead><TableHead>Slug</TableHead><TableHead>Descripción</TableHead><TableHead className="text-right">Acciones</TableHead></TableRow></TableHeader>
              <TableBody>
                {docTypes.map(d => (
                  <TableRow key={d.id}>
                    <TableCell className="font-medium text-xs">{d.name}</TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{d.slug}</TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{d.description}</TableCell>
                    <TableCell className="text-right">{renderActions('doctype', d)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent></Card>
        </TabsContent>

      </Tabs>

      {/* GLOBAL DIALOG */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editItem ? 'Editar' : 'Crear'} {
                dialogType === 'role' ? 'Rol' :
                  dialogType === 'member' ? 'Tipo de Miembro' :
                    dialogType === 'fase' ? 'Fase' :
                      dialogType === 'gestion' ? 'Gestión' :
                        dialogType === 'area' ? 'Área de Inv.' :
                          dialogType === 'linea' ? 'Línea de Inv.' :
                            dialogType === 'semestre' ? 'Semestre' : 'Tipo de Documento'
              }
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* DYNAMIC FORM FIELDS */}
            {dialogType === 'role' && (
              <div className="grid gap-2">
                <Label>Nombre</Label>
                <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
            )}

            {(dialogType === 'member' || dialogType === 'doctype') && (
              <>
                <div className="grid gap-2">
                  <Label>Nombre</Label>
                  <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Descripción</Label>
                  <Input value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>
                {dialogType === 'doctype' && (
                  <div className="grid gap-2">
                    <Label>Slug (Opcional)</Label>
                    <Input value={formData.slug || ''} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="ej. perfil-proyecto" />
                  </div>
                )}
              </>
            )}

            {(dialogType === 'fase' || dialogType === 'area') && (
              <div className="grid gap-2">
                <Label>Nombre</Label>
                <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
            )}

            {dialogType === 'gestion' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Año</Label>
                  <Input type="number" value={formData.gestion || ''} onChange={e => setFormData({ ...formData, gestion: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Tipo</Label>
                  <Select value={formData.typeGestion} onValueChange={v => setFormData({ ...formData, typeGestion: v })}>
                    <SelectTrigger><SelectValue placeholder="Semestre" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="I">I (Primero)</SelectItem>
                      <SelectItem value="II">II (Segundo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {editItem && (
                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                    <Label>Activo</Label>
                  </div>
                )}
              </div>
            )}

            {dialogType === 'linea' && (
              <>
                <div className="grid gap-2">
                  <Label>Nombre de la Línea</Label>
                  <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Área Perteneciente</Label>
                  <Select value={formData.idAreaInvestigacion?.toString()} onValueChange={v => setFormData({ ...formData, idAreaInvestigacion: Number(v) })}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar Área" /></SelectTrigger>
                    <SelectContent>
                      {researchAreas.map(a => (
                        <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {dialogType === 'semestre' && (
              <>
                <div className="grid gap-2">
                  <Label>Código (e.j. 2025-1)</Label>
                  <Input value={formData.code || ''} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Nombre descriptivo</Label>
                  <Input value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                </div>
              </>
            )}

          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
