"use client"

import { useEffect, useMemo, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Plus, RefreshCw, Save, X, Trash2, Check } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Label } from "@/components/ui/label"
import type { RoleInfo, Phase, Gestion, ResearchLine, Semester, TypeDoc } from "@/lib/types"
import { CenteredLoader } from "@/components/ui/centered-loader"

type EditableType = "fase" | "gestion" | "linea" | "semestre" | "area" | "modalidad" | "tipoDoc"

type EditingState = {
  type: EditableType
  id: number | null
}

const emptyForm: Record<EditableType, any> = {
  fase: { name: "" },
  gestion: { gestion: "", typeGestion: "I", isActive: true },
  linea: { name: "", idAreaInvestigacion: "" },
  semestre: { code: "", name: "" },
  area: { name: "" },
  modalidad: { name: "", description: "" },
  tipoDoc: { name: "", description: "" },
}

export default function ConfiguracionesPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<"roles" | "fases" | "gestion" | "semestres" | "modalidades" | "investigacion" | "tipos-doc">("roles")
  const [loading, setLoading] = useState(false)

  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [fases, setFases] = useState<Phase[]>([])
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [lineas, setLineas] = useState<ResearchLine[]>([])
  const [semestres, setSemestres] = useState<Semester[]>([])
  const [areas, setAreas] = useState<any[]>([])
  const [modalidades, setModalidades] = useState<any[]>([])
  const [typeDocs, setTypeDocs] = useState<TypeDoc[]>([])

  const [editing, setEditing] = useState<EditingState | null>(null)
  const [formData, setFormData] = useState<any>(emptyForm.fase)

  const areaOptions = useMemo(
    () => areas.map((a) => ({ id: a.id, name: a.name })),
    [areas],
  )

  const loadData = async () => {
    try {
      setLoading(true)
      if (activeTab === "roles") setRoles(await apiClient.roles.list())
      if (activeTab === "fases") setFases(await apiClient.phases.list())
      if (activeTab === "gestion") setGestiones((await apiClient.gestiones.list()).data)
      if (activeTab === "investigacion") {
        const [areasRes, lineasRes] = await Promise.all([
          apiClient.researchAreas.list(),
          apiClient.researchLines.list(),
        ])
        setAreas((areasRes as any).data || areasRes || [])
        setLineas((lineasRes as any).data || lineasRes || [])
      }
      if (activeTab === "semestres") {
        const semestresRes = await apiClient.semesters.list()
        setSemestres((semestresRes as any).data || semestresRes || [])
      }
      if (activeTab === "modalidades") {
        const modRes = await apiClient.modalidades.list()
        setModalidades((modRes as any).data || modRes || [])
      }
      if (activeTab === "tipos-doc") {
        const typesRes = await apiClient.typeDocs.list()
        setTypeDocs(typesRes || [])
      }
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "No se pudo cargar la información" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [activeTab])

  const startCreate = (type: EditableType) => {
    setEditing({ type, id: null })
    setFormData({ ...emptyForm[type] })
  }

  const startEdit = (type: EditableType, item: any) => {
    setEditing({ type, id: item.id })
    if (type === "fase") setFormData({ name: item.name })
    if (type === "gestion") setFormData({ gestion: item.gestion, typeGestion: item.typeGestion, isActive: item.isActive })
    if (type === "linea")
      setFormData({
        name: item.name,
        idAreaInvestigacion: item.idAreaInvestigacion || item.areaInvestigacion?.id || "",
      })
    if (type === "semestre") setFormData({ code: item.code, name: item.name })
    if (type === "area") setFormData({ name: item.name })
    if (type === "tipoDoc") setFormData({ name: item.name, description: item.description || "" })
  }

  const cancelEdit = () => {
    setEditing(null)
    setFormData(emptyForm.fase)
  }

  const handleSave = async () => {
    if (!editing) return
    try {
      if (editing.type === "fase") {
        if (!formData.name) throw new Error("El nombre es obligatorio")
        if (editing.id) await apiClient.phases.update(editing.id, formData.name)
        else await apiClient.phases.create(formData.name)
      }
      if (editing.type === "gestion") {
        if (!formData.gestion || !formData.typeGestion) throw new Error("Año y tipo son obligatorios")
        const payload = {
          gestion: String(formData.gestion),
          typeGestion: formData.typeGestion as "I" | "II",
          isActive: formData.isActive ?? true,
        }
        if (editing.id) await apiClient.gestiones.update(editing.id, payload)
        else await apiClient.gestiones.create(payload)
      }
      if (editing.type === "linea") {
        if (!formData.name || !formData.idAreaInvestigacion) throw new Error("Nombre y área son obligatorios")
        const payload = { name: formData.name, idAreaInvestigacion: Number(formData.idAreaInvestigacion) }
        if (editing.id) await apiClient.researchLines.update(editing.id, payload)
        else await apiClient.researchLines.create(payload)
      }
      if (editing.type === "area") {
        if (!formData.name) throw new Error("El nombre es obligatorio")
        if (editing.id) await apiClient.researchAreas.update(editing.id, formData.name)
        else await apiClient.researchAreas.create(formData.name)
      }
      if (editing.type === "semestre") {
        if (!formData.code || !formData.name) throw new Error("Código y nombre son obligatorios")
        const payload = { code: String(formData.code), name: String(formData.name) }
        if (editing.id) await apiClient.semesters.update(editing.id, payload)
        else await apiClient.semesters.create(payload)
      }
      if (editing.type === "modalidad") {
        if (!formData.name) throw new Error("El nombre es obligatorio")
        const payload = { name: formData.name, description: formData.description }
        if (editing.id) await apiClient.modalidades.update(editing.id, payload)
        else await apiClient.modalidades.create(payload)
      }
      if (editing.type === "tipoDoc") {
        if (!formData.name) throw new Error("El nombre es obligatorio")
        const payload = { name: formData.name, description: formData.description || undefined }
        if (editing.id) await apiClient.typeDocs.update(editing.id, payload)
        else await apiClient.typeDocs.create(payload)
      }

      toast({ title: "Guardado correctamente" })
      setEditing(null)
      setFormData(emptyForm.fase)
      loadData()
    } catch (err: any) {
      console.error(err)
      toast({ variant: "destructive", title: "Error al guardar", description: err?.message })
    }
  }

  const toggleRoleStatus = async (role: RoleInfo) => {
    try {
      await apiClient.roles.updateStatus(role.id, !role.isActive)
      toast({ title: `Rol ${role.isActive ? "desactivado" : "activado"}` })
      loadData()
    } catch (err) {
      console.error(err)
      toast({ variant: "destructive", title: "No se pudo actualizar el rol" })
    }
  }

  const renderCardActions = (item: any, type: EditableType) => {
    const isEditing = editing?.type === type && editing.id === item.id
    return (
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <Button size="sm" className="gap-1" onClick={handleSave}>
              <Save className="w-4 h-4" /> Guardar
            </Button>
            <Button variant="outline" size="sm" onClick={cancelEdit}>
              <X className="w-4 h-4" /> Cancelar
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={() => startEdit(type, item)}>
              <Edit2 className="w-4 h-4" /> Editar
            </Button>
            {type !== "semestre" && type !== "fase" && type !== "tipoDoc" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600"
                onClick={async () => {
                  if (!confirm("¿Eliminar este registro?")) return
                  try {
                    if (type === "gestion") await apiClient.gestiones.delete(item.id)
                    if (type === "linea") await apiClient.researchLines.delete(item.id)
                    if (type === "area") await apiClient.researchAreas.delete(item.id)
                    if (type === "modalidad") await apiClient.modalidades.delete(item.id)
                    toast({ title: "Eliminado" })
                    loadData()
                  } catch (err: any) {
                    const message = err instanceof Error ? err.message : (err?.message ?? "Error desconocido")
                    toast({
                      variant: "destructive",
                      title: "No se pudo eliminar",
                      description: message,
                    })
                  }
                }}
              >
                <Trash2 className="w-4 h-4" /> Eliminar
              </Button>
            )}
          </>
        )}
      </div>
    )
  }

  const renderInlineForm = (type: EditableType, item?: any) => {
    const isEditing = editing?.type === type && editing.id === (item?.id ?? null)
    if (!isEditing) return null

    if (type === "fase") {
      return (
        <div className="grid gap-2 mt-3">
          <label className="text-xs text-muted-foreground">Nombre</label>
          <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
      )
    }
    if (type === "area") {
      return (
        <div className="grid gap-2 mt-3">
          <label className="text-xs text-muted-foreground">Nombre</label>
          <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
      )
    }
    if (type === "gestion") {
      return (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Año</label>
            <Input
              type="number"
              value={formData.gestion || ""}
              onChange={(e) => setFormData({ ...formData, gestion: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Tipo</label>
            <Select value={formData.typeGestion} onValueChange={(v) => setFormData({ ...formData, typeGestion: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="I">I</SelectItem>
                <SelectItem value="II">II</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {item && (
            <div className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                checked={!!formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <span className="text-xs text-muted-foreground">Activo</span>
            </div>
          )}
        </div>
      )
    }
    if (type === "linea") {
      return (
        <div className="grid gap-3 mt-3">
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Nombre</label>
            <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <label className="text-xs text-muted-foreground">Área</label>
            {areaOptions.length > 0 ? (
              <Select
                value={formData.idAreaInvestigacion?.toString()}
                onValueChange={(v) => setFormData({ ...formData, idAreaInvestigacion: Number(v) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un área" />
                </SelectTrigger>
                <SelectContent>
                  {areaOptions.map((a) => (
                    <SelectItem key={a.id} value={a.id.toString()}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                type="number"
                value={formData.idAreaInvestigacion || ""}
                onChange={(e) => setFormData({ ...formData, idAreaInvestigacion: Number(e.target.value) })}
                placeholder="ID de área (no listado por API)"
              />
            )}
          </div>
        </div>
      )
    }
    if (type === "modalidad") {
      return (
        <div className="grid gap-3 mt-3">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Opcional"
            />
          </div>
        </div>
      )
    }
    if (type === "tipoDoc") {
      return (
        <div className="grid gap-3 mt-3">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Input
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Opcional"
            />
          </div>
        </div>
      )
    }
    return (
      <div className="grid gap-3 mt-3">
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Código</label>
          <Input value={formData.code || ""} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
        </div>
        <div className="grid gap-2">
          <label className="text-xs text-muted-foreground">Nombre</label>
          <Input value={formData.name || ""} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
      </div>
    )
  }

  const renderCreateCard = (type: EditableType, title: string, description: string) => {
    const isCreating = editing?.type === type && editing.id === null
    return (
      <div className="border rounded-xl p-4 bg-muted/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          {isCreating ? (
            <div className="flex gap-2">
              <Button size="sm" className="gap-1" onClick={handleSave}>
                <Save className="w-4 h-4" /> Guardar
              </Button>
              <Button variant="outline" size="sm" onClick={cancelEdit}>
                <X className="w-4 h-4" /> Cancelar
              </Button>
            </div>
          ) : (
            <Button size="sm" className="gap-1" onClick={() => startCreate(type)}>
              <Plus className="w-4 h-4" /> Nuevo
            </Button>
          )}
        </div>
        {isCreating && renderInlineForm(type)}
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-white">Configuraciones</h1>
          <p className="text-muted-foreground text-xs">Gestión general del sistema</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Recargar
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-7 h-auto">
          <TabsTrigger value="roles" className="text-xs">Roles</TabsTrigger>
          <TabsTrigger value="fases" className="text-xs">Fases</TabsTrigger>
          <TabsTrigger value="gestion" className="text-xs">Gestión</TabsTrigger>
          <TabsTrigger value="semestres" className="text-xs">Semestres</TabsTrigger>
          <TabsTrigger value="modalidades" className="text-xs">Modalidades</TabsTrigger>
          <TabsTrigger value="tipos-doc" className="text-xs">Tipos Doc.</TabsTrigger>
          <TabsTrigger value="investigacion" className="text-xs">Investigación</TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="pt-4 space-y-3">
          {loading ? (
            <CenteredLoader label="Cargando roles..." className="border rounded-xl bg-card" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-xl p-4 bg-card shadow-sm flex flex-col gap-3 border-l-4 border-l-primary">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{role.name}</p>
                      <p className="text-xs text-muted-foreground break-words">{role.description || "Sin descripción"}</p>
                    </div>
                    <Badge variant={role.isActive ? "default" : "secondary"} className="text-[10px] flex-shrink-0">
                      {role.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID: {role.id}</span>
                    {role.usersCount !== undefined && <span>Usuarios: {role.usersCount}</span>}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => toggleRoleStatus(role)} className="gap-2">
                    <Check className="w-4 h-4" /> {role.isActive ? "Desactivar" : "Activar"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fases" className="pt-4 space-y-3">
          {renderCreateCard("fase", "Nueva fase", "Crear una nueva fase de proyecto")}
          {loading ? (
            <CenteredLoader label="Cargando fases..." className="border rounded-xl bg-card" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {fases.map((f) => (
                <div key={f.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{f.name}</p>
                      <p className="text-[11px] text-muted-foreground">Proyectos: {f.projectsCount || 0}</p>
                    </div>
                    {renderCardActions(f, "fase")}
                  </div>
                  {renderInlineForm("fase", f)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gestion" className="pt-4 space-y-3">
          {renderCreateCard("gestion", "Nueva gestión", "Año y semestre académico")}
          {loading ? (
            <CenteredLoader label="Cargando gestiones..." className="border rounded-xl bg-card" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gestiones.map((g) => (
                <div key={g.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold break-words">{g.gestion}</p>
                      <p className="text-[11px] text-muted-foreground">Semestre: {g.typeGestion}</p>
                      <Badge className={g.isActive ? "bg-green-600 text-[10px]" : "bg-gray-400 text-[10px]"}>
                        {g.isActive ? "Activa" : "Cerrada"}
                      </Badge>
                    </div>
                    {renderCardActions(g, "gestion")}
                  </div>
                  {renderInlineForm("gestion", g)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="semestres" className="pt-4 space-y-3">
          {renderCreateCard("semestre", "Nuevo semestre", "Código y nombre descriptivo")}
          {loading ? (
            <CenteredLoader label="Cargando semestres..." className="border rounded-xl bg-card" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {semestres.map((s) => (
                  <div key={s.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold break-words">{s.code}</p>
                        <p className="text-[11px] text-muted-foreground break-words">{s.name}</p>
                      </div>
                      {renderCardActions(s, "semestre")}
                    </div>
                    {renderInlineForm("semestre", s)}
                  </div>
                ))}
              </div>
            )}
        </TabsContent>

        <TabsContent value="modalidades" className="pt-4 space-y-3">
          {renderCreateCard("modalidad", "Nueva modalidad", "Nombre y descripción")}
          {loading ? (
            <CenteredLoader label="Cargando modalidades..." className="border rounded-xl bg-card" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {modalidades.map((m) => (
                <div key={m.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{m.name}</p>
                      <p className="text-[11px] text-muted-foreground break-words">{m.description || "Sin descripción"}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">Proyectos: {m.projectsCount ?? 0}</p>
                    </div>
                    {renderCardActions(m, "modalidad")}
                  </div>
                  {renderInlineForm("modalidad", m)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tipos-doc" className="pt-4 space-y-3">
          {renderCreateCard("tipoDoc", "Nuevo tipo de documento", "Nombre y descripción del tipo")}
          {loading ? (
            <CenteredLoader label="Cargando tipos de documento..." className="border rounded-xl bg-card" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {typeDocs.map((t) => (
                <div key={t.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold break-words">{t.name}</p>
                      <p className="text-[11px] text-muted-foreground break-words">{t.description || "Sin descripción"}</p>
                    </div>
                    {renderCardActions(t, "tipoDoc")}
                  </div>
                  {renderInlineForm("tipoDoc", t)}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="investigacion" className="pt-4 space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold">Áreas de investigación</h2>
                <p className="text-xs text-muted-foreground">Crea el área primero.</p>
              </div>
              {renderCreateCard("area", "Nueva área", "Nombre del área de investigación")}
              {loading ? (
                <CenteredLoader label="Cargando áreas..." className="border rounded-xl bg-card" />
              ) : (
                <div className="grid gap-3">
                  {areas.map((a) => (
                    <div key={a.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold break-words">{a.name}</p>
                          <p className="text-[11px] text-muted-foreground">Líneas: {a.linesCount ?? "-"}</p>
                        </div>
                        {renderCardActions(a, "area")}
                      </div>
                      {renderInlineForm("area", a)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold">Líneas de investigación</h2>
                <p className="text-xs text-muted-foreground">Asigna una línea a un área existente.</p>
              </div>
              {renderCreateCard("linea", "Nueva línea", "Asigna un área existente")}
              {loading ? (
                <CenteredLoader label="Cargando líneas..." className="border rounded-xl bg-card" />
              ) : (
                <div className="grid gap-3">
                {lineas.map((l) => (
                  <div key={l.id} className="border rounded-xl p-4 bg-card shadow-sm border-l-4 border-l-primary">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold break-words">{l.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Área: {l.areaInvestigacion?.name || l.idAreaInvestigacion || "-"}
                        </p>
                      </div>
                        {renderCardActions(l, "linea")}
                      </div>
                      {renderInlineForm("linea", l)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
