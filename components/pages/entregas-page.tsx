"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Loader2, RefreshCw, CalendarClock, Plus, Info, ShieldCheck, UserCheck } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import type { AdmEntrega, Gestion, Pagination, Semester, SpecialityInfo } from "@/lib/types"

type WindowStatus = "NO_INICIADA" | "EN_CURSO" | "CERRADA"

export default function EntregasPage() {
  const { user } = useAuth()
  const [entregas, setEntregas] = useState<AdmEntrega[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  // Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  // Crear cronograma
  const canCreate = (user?.roles ?? []).some((role) => role.name === "DOCENTETG")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [createMessage, setCreateMessage] = useState("")
  const [catalogLoading, setCatalogLoading] = useState(false)
  const [gestiones, setGestiones] = useState<Gestion[]>([])
  const [semestres, setSemestres] = useState<Semester[]>([])
  const [especialidades, setEspecialidades] = useState<SpecialityInfo[]>([])
  const [form, setForm] = useState({
    title: "",
    descripcion: "",
    startAt: "",
    endAt: "",
    idGestion: "",
    idSemestre: "",
    idEspecialidad: "",
    idDocente: user?.docenteId ? String(user.docenteId) : "",
    estudiantes: "",
    isActive: true,
  })

  useEffect(() => {
    if (user?.docenteId) {
      setForm((prev) => ({ ...prev, idDocente: String(user.docenteId ?? "") }))
    }
  }, [user?.docenteId])

  const loadCatalogs = useCallback(async () => {
    setCatalogLoading(true)
    try {
      const [gestRes, semRes, espRes] = await Promise.all([
        apiClient.gestiones.list(),
        apiClient.semesters.list(),
        apiClient.specialities.list({ limit: 100 }),
      ])
      setGestiones(gestRes?.data ?? [])
      setSemestres(semRes?.data ?? [])
      setEspecialidades((espRes as any)?.data ?? [])
    } catch (err) {
      console.error("Error cargando catálogos de entregas:", err)
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  const fetchEntregas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiClient.admEntregas.list({
        page,
        limit,
      })
      setEntregas(response.data)
      setPagination(response.pagination)
    } catch (err) {
      console.error("Error fetching entregas:", err)
      setError("No se pudieron cargar las entregas. Intente nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [page, limit])

  useEffect(() => {
    fetchEntregas()
  }, [fetchEntregas])

  useEffect(() => {
    if (canCreate) loadCatalogs()
  }, [canCreate, loadCatalogs])

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("es-BO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (isActive: boolean) =>
    isActive ? (
      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</Badge>
    ) : (
      <Badge variant="secondary">Inactivo</Badge>
    )

  const getWindowStatus = (entrega: AdmEntrega): WindowStatus => {
    const now = Date.now()
    const start = new Date(entrega.startAt).getTime()
    const end = new Date(entrega.endAt).getTime()
    if (now < start) return "NO_INICIADA"
    if (now > end) return "CERRADA"
    return "EN_CURSO"
  }

  const renderWindowBadge = (entrega: AdmEntrega) => {
    const status = getWindowStatus(entrega)
    const map: Record<WindowStatus, { label: string; className: string }> = {
      NO_INICIADA: { label: "No iniciada", className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40" },
      EN_CURSO: { label: "En curso", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60" },
      CERRADA: { label: "Cerrada", className: "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-100" },
    }
    return <Badge className={`${map[status].className}`}>{map[status].label}</Badge>
  }

  const getDocenteLabel = (entrega: AdmEntrega) => {
    const details = entrega.docente?.usuario?.usuarioDetalles
    if (details) {
      return `${details.apPaterno ?? ""} ${details.apMaterno ?? ""} ${details.nombre ?? ""}`.trim()
    }
    if (entrega.docente?.nombreCompleto) return entrega.docente.nombreCompleto
    return `Docente ${entrega.idDocente}`
  }

  const totalActivos = useMemo(() => entregas.filter((e) => e.isActive).length, [entregas])

  const handleCreateCronograma = async () => {
    setCreateError("")
    setCreateMessage("")

    if (!form.title || !form.startAt || !form.endAt || !form.idGestion || !form.idSemestre || !form.idEspecialidad) {
      setCreateError("Completa título, fechas, gestión, semestre y especialidad.")
      return
    }
    if (!form.idDocente) {
      setCreateError("Necesitamos el ID de docente responsable.")
      return
    }

    const startDate = new Date(form.startAt)
    const endDate = new Date(form.endAt)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setCreateError("Las fechas no son válidas.")
      return
    }
    if (endDate <= startDate) {
      setCreateError("La fecha de fin debe ser posterior al inicio.")
      return
    }

    const especialidad = especialidades.find((e) => e.idEspecialidad === Number(form.idEspecialidad))
    if (!especialidad) {
      setCreateError("Selecciona una especialidad válida.")
      return
    }

    const estudiantesIds =
      form.estudiantes.trim().length > 0
        ? form.estudiantes
            .split(/[,\\s]+/)
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id))
        : []

    const payload = {
      title: form.title,
      descripcion: form.descripcion || null,
      idDocente: Number(form.idDocente),
      idGestion: Number(form.idGestion),
      idEspecialidad: Number(form.idEspecialidad),
      especialidad: especialidad.especialidad,
      idSemestre: Number(form.idSemestre),
      startAt: startDate.toISOString(),
      endAt: endDate.toISOString(),
      isActive: form.isActive,
      estudiantes: estudiantesIds,
    }

    try {
      setCreating(true)
      await apiClient.admEntregas.create(payload as any)
      setCreateMessage("Cronograma creado correctamente.")
      setShowCreateForm(false)
      setForm((prev) => ({
        ...prev,
        title: "",
        descripcion: "",
        startAt: "",
        endAt: "",
        estudiantes: "",
      }))
      fetchEntregas()
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo crear el cronograma"
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-1">Cronograma de Entregas</h1>
          <p className="text-muted-foreground">
            Gestión y visualización de las ventanas de entrega y revisiones.
          </p>
        </div>
        <div className="flex gap-2">
          {canCreate && (
            <Button onClick={() => setShowCreateForm((v) => !v)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Crear cronograma
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchEntregas} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-primary/5 border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-primary">
              <CalendarClock className="w-4 h-4" />
              Flujo de entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1) Crear cronograma con docente, gestión, semestre, especialidad y estudiantes.</p>
            <p>2) Estudiante sube Word y PDF dentro del rango de fechas.</p>
            <p>3) Revisores descargan, revisan y suben su PDF (TG, Tutor, Rev1, opcional Rev2).</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Datos que mostramos
            </CardTitle>
            <CardDescription>Lo que llega desde el backend por cronograma.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Ventana de tiempo (startAt/endAt) y estado activo.</p>
            <p>• Gestión y semestre vinculados.</p>
            <p>• Especialidad y docente responsable.</p>
            <p>• Cantidad de estudiantes asignados y entregas registradas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Reglas de acceso
            </CardTitle>
            <CardDescription>Control por rol y periodo.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p>• Estudiantes: ven sus entregas y suben dentro del rango.</p>
            <p>• Docentes: solo revisan las entregas asignadas.</p>
            <p>• Admin/UTIC: ven todo el cronograma.</p>
            <p>• DOCENTETG es el único rol que puede crear cronogramas aquí.</p>
          </CardContent>
        </Card>
      </div>

      {canCreate && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Crear cronograma</CardTitle>
            <CardDescription>
              Completa los campos requeridos. Para asignar estudiantes puedes pegar sus IDs separados por coma o espacio.
            </CardDescription>
          </CardHeader>
          {showCreateForm && (
            <CardContent className="space-y-4">
              {createError && (
                <div className="bg-red-50 text-red-700 border border-red-200 text-sm rounded-md p-3">{createError}</div>
              )}
              {createMessage && (
                <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm rounded-md p-3">
                  {createMessage}
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Ej: Entrega final de proyecto"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Docente responsable (ID)</label>
                  <Input
                    value={form.idDocente}
                    onChange={(e) => setForm({ ...form, idDocente: e.target.value })}
                    placeholder="ID interno de docente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Gestión</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.idGestion}
                    onChange={(e) => setForm({ ...form, idGestion: e.target.value })}
                    disabled={catalogLoading}
                  >
                    <option value="">Seleccione gestión</option>
                    {gestiones.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.gestion} {g.typeGestion ? `(${g.typeGestion})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Semestre</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.idSemestre}
                    onChange={(e) => setForm({ ...form, idSemestre: e.target.value })}
                    disabled={catalogLoading}
                  >
                    <option value="">Seleccione semestre</option>
                    {semestres.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Especialidad</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={form.idEspecialidad}
                    onChange={(e) => setForm({ ...form, idEspecialidad: e.target.value })}
                    disabled={catalogLoading}
                  >
                    <option value="">Seleccione especialidad</option>
                    {especialidades.map((e) => (
                      <option key={e.idEspecialidad} value={e.idEspecialidad}>
                        {e.especialidad} ({e.nivelAcad})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ventana de inicio</label>
                  <Input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ventana de cierre</label>
                  <Input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm({ ...form, endAt: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descripción</label>
                <Textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Instrucciones para la entrega, formatos, etc."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">IDs de estudiantes asignados (opcional)</label>
                <Input
                  value={form.estudiantes}
                  onChange={(e) => setForm({ ...form, estudiantes: e.target.value })}
                  placeholder="Ej: 12, 45 56 78"
                />
                <p className="text-xs text-muted-foreground">
                  Se validan en backend. También puedes asignar más tarde con el endpoint /adm-entregas/:id/estudiantes.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm">
                  Activar cronograma al crear
                </label>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleCreateCronograma} disabled={creating}>
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                  {creating ? "Creando..." : "Guardar cronograma"}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancelar
                </Button>
              </div>
            </CardContent>
          )}
          {!showCreateForm && (
            <CardContent className="text-sm text-muted-foreground">
              {canCreate
                ? "Completa el formulario para registrar un nuevo cronograma con su ventana, gestión y especialidad."
                : "Solo DOCENTETG puede crear cronogramas desde esta vista."}
            </CardContent>
          )}
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Listado de Entregas Programadas</CardTitle>
          <CardDescription>
            Activos: {totalActivos} • Total: {entregas.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 text-sm">{error}</div>}

          {loading && !entregas.length ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-primary/20 bg-muted/40">
                      <th className="text-left py-3 px-4 font-bold">Cronograma</th>
                      <th className="text-left py-3 px-4 font-bold">Responsable</th>
                      <th className="text-left py-3 px-4 font-bold">Gestión / Semestre</th>
                      <th className="text-left py-3 px-4 font-bold">Ventana</th>
                      <th className="text-left py-3 px-4 font-bold">Estado</th>
                      <th className="text-left py-3 px-4 font-bold">Asignaciones</th>
                      <th className="text-left py-3 px-4 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.length > 0 ? (
                      entregas.map((entrega) => {
                        const totalEstudiantes =
                          entrega._count?.estudiantes ?? entrega.estudiantes?.length ?? 0
                        const totalEntregas = entrega._count?.entregas ?? entrega.entregas?.length ?? 0
                        return (
                          <tr key={entrega.id} className="border-b hover:bg-muted/50 transition-colors align-top">
                            <td className="py-3 px-4">
                              <div className="font-semibold text-foreground">{entrega.title}</div>
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {entrega.descripcion || "-"}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{getDocenteLabel(entrega)}</div>
                              <div className="text-xs text-muted-foreground">ID {entrega.idDocente}</div>
                            </td>
                            <td className="py-3 px-4 text-sm">
                              <div className="font-medium">
                                {entrega.gestion?.gestion ?? entrega.idGestion} • {entrega.semestre?.name ?? entrega.idSemestre}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Especialidad: {entrega.especialidad ?? entrega.idEspecialidad}
                              </div>
                            </td>
                            <td className="py-3 px-4 space-y-1">
                              <div className="text-xs text-muted-foreground">
                                Inicio: {formatDateTime(entrega.startAt)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Fin: {formatDateTime(entrega.endAt)}
                              </div>
                              {renderWindowBadge(entrega)}
                            </td>
                            <td className="py-3 px-4 space-y-1">
                              {getStatusBadge(entrega.isActive)}
                            </td>
                            <td className="py-3 px-4 text-sm space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Estudiantes: {totalEstudiantes}</Badge>
                                <Badge variant="outline">Entregas: {totalEntregas}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Created: {formatDateTime(entrega.createdAt)}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                Ver detalles
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No hay entregas programadas disponibles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={!pagination.hasNextPage || loading}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-300 space-y-1">
        <p>
          <strong>Archivos requeridos de estudiante:</strong> Word y PDF (máx 25MB c/u). Debe estar dentro del periodo y
          asignado al cronograma.
        </p>
        <p>
          <strong>Revisores y estados:</strong> DocTG, Tutor, Rev1 y opcional Rev2 pasan de PENDIENTE → EN_REVISION
          (cuando descargan) → REVISADO (al subir PDF).
        </p>
      </div>
    </div>
  )
}