"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Loader2, X, Plus, Eye, EyeOff } from "lucide-react"
import { apiClient, API_BASE_URL } from "@/lib/api-client"
import type { UserBasicInfo, UserFilters } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { CenteredLoader } from "@/components/ui/centered-loader"
import { RoleGuard } from "@/components/role-guard"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUsers } from "@/hooks/use-users"
import { ErrorDisplay } from "@/components/ui/error-display"

const ROLES_MAP: Record<string, string> = {
  ADMIN: "Administrador",
  ADMINISTRADOR: "Administrador", // Legacy
  DOCENTETG: "Docente de TG",
  DOCENTE_TG: "Docente de TG", // Legacy
  SECRETARIA: "Secretaria",
  UTIC: "UTIC",
  TUTOR: "Tutor",
  REVISOR: "Revisor",
  REVISOR1: "Revisor 1",
  REVISOR2: "Revisor 2",
  JEFECARRERA: "Jefe de Carrera",
  JEFE_CARRERA: "Jefe de Carrera", // Legacy
  DDE: "DEE",
  DEE: "DEE", // Legacy
  INVITADO: "Usuario Invitado",
  USUARIO_INVITADO: "Usuario Invitado", // Legacy
  ESTUDIANTE: "Estudiante",
}

const USER_STATUSES = [
  { value: "ACTIVE", label: "Activo" },
  { value: "INACTIVE", label: "Inactivo" },
  { value: "BLOCKED", label: "Bloqueado" },
  { value: "MUST_CHANGE_PASSWORD", label: "Debe cambiar contraseña" },
]

export default function ListadoUsuarioPage() {
  const { user: currentUser } = useAuth()
  const { toast } = useToast()

  // Form state
  const emptyCreateForm = {
    email: "",
    password: "",
    nombre: "",
    apPaterno: "",
    apMaterno: "",
    ci: "",
    grado: "",
    role: "",
    tipo: "ADMINISTRATIVO",
    especialidades: [] as { idEspecialidad: number; especialidad: string }[],
  }

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  // Users hook with Clean Architecture
  const { users: usuarios, pagination, loading, error, fetchUsers, refetch, clearError } = useUsers()

  // UI state
  const [selectedUsuario, setSelectedUsuario] = useState<UserBasicInfo | null>(null)
  const [userImages, setUserImages] = useState<Record<string, string>>({})
  const userImagesRef = useRef<Record<string, string>>({})
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [rolesOptions, setRolesOptions] = useState<{ id: number; name: string }[]>([])
  const [createForm, setCreateForm] = useState({ ...emptyCreateForm })
  const [specSearchTerm, setSpecSearchTerm] = useState("")
  const [specResults, setSpecResults] = useState<{ idEspecialidad: number; especialidad: string }[]>([])
  const [specLoading, setSpecLoading] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(false)
  const [statusToSet, setStatusToSet] = useState("")
  const [showCreatePassword, setShowCreatePassword] = useState(false)
  const allowedCreateRoles = ["ADMIN", "UTIC", "JEFECARRERA", "DDE", "SECRETARIA", "INVITADO"]

  // Debounced fetch with filters
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters: Partial<UserFilters> = {
        page,
        limit,
        search: searchTerm || undefined,
        status: statusFilter || undefined,
        role: roleFilter || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      }
      fetchUsers(filters)
    }, 350)
    return () => clearTimeout(handler)
  }, [page, limit, searchTerm, statusFilter, roleFilter, fetchUsers])

  useEffect(() => {
    setStatusToSet(selectedUsuario?.status || "")
  }, [selectedUsuario])

  useEffect(() => {
    userImagesRef.current = userImages
  }, [userImages])

  useEffect(() => {
    const currentIds = new Set(usuarios.map((usuario) => usuario.id))
    const staleIds = Object.keys(userImagesRef.current).filter((id) => !currentIds.has(id))

    if (!staleIds.length) return

    staleIds.forEach((id) => {
      const cachedUrl = userImagesRef.current[id]
      if (cachedUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(cachedUrl)
      }
    })

    setUserImages((prev) => {
      const next = { ...prev }
      staleIds.forEach((id) => delete next[id])
      return next
    })
  }, [usuarios])

  useEffect(() => {
    let isActive = true

    const loadUserImages = async () => {
      const pending = usuarios.filter(
        (usuario) => usuario.imageUrl && !userImagesRef.current[usuario.id],
      )
      if (!pending.length) return

      await Promise.all(
        pending.map(async (usuario) => {
          const imageUrl = usuario.imageUrl
          if (!imageUrl) return

          const isAbsolute = imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
          let shouldFetch = !isAbsolute

          if (isAbsolute) {
            try {
              const apiOrigin = new URL(API_BASE_URL).origin
              const imageOrigin = new URL(imageUrl).origin
              shouldFetch = apiOrigin === imageOrigin
            } catch {
              shouldFetch = false
            }
          }

          if (!shouldFetch) {
            if (isActive) {
              setUserImages((prev) => (prev[usuario.id] ? prev : { ...prev, [usuario.id]: imageUrl }))
            }
            return
          }

          try {
            const blob = await apiClient.profile.fetchImage(imageUrl)
            const objectUrl = URL.createObjectURL(blob)
            if (!isActive) {
              URL.revokeObjectURL(objectUrl)
              return
            }
            setUserImages((prev) => ({ ...prev, [usuario.id]: objectUrl }))
          } catch (err) {
            console.error("[v0] No se pudo obtener la foto del usuario:", err)
          }
        }),
      )
    }

    loadUserImages()

    return () => {
      isActive = false
    }
  }, [usuarios])

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await apiClient.roles.list()
        setRolesOptions(roles)
      } catch (err) {
        console.error(err)
      }
    }
    loadRoles()
  }, [])

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (specSearchTerm.length < 2) {
        setSpecResults([])
        return
      }
      try {
        setSpecLoading(true)
        const res = await apiClient.specialities.list({ search: specSearchTerm, limit: 5 })
        const data = Array.isArray(res) ? res : (res as any).data || []
        setSpecResults(
          data.map((d: any) => ({
            idEspecialidad: d.idEspecialidad ?? d.id ?? d.idNivelAcad ?? Math.random(),
            especialidad: d.especialidad || d.nivelAcad || d.name || "Especialidad",
          })),
        )
      } catch (err) {
        console.error(err)
      } finally {
        setSpecLoading(false)
      }
    }, 250)
    return () => clearTimeout(handler)
  }, [specSearchTerm])

  const getUserImageSrc = (usuario: UserBasicInfo) => userImages[usuario.id] || "/diverse-avatars.png"

  const resetCreateForm = () => {
    setCreateForm({ ...emptyCreateForm, especialidades: [] })
    setSpecSearchTerm("")
    setSpecResults([])
    setShowCreatePassword(false)
  }

  const handleAddEspecialidad = (esp: { idEspecialidad: number; especialidad: string }) => {
    if (createForm.especialidades.some((e) => e.idEspecialidad === esp.idEspecialidad)) {
      toast({ title: "Ya añadiste esta especialidad" })
      return
    }
    if (createForm.especialidades.length >= 4) {
      toast({ variant: "destructive", title: "Solo puedes asignar hasta 4 especialidades" })
      return
    }
    setCreateForm((prev) => ({ ...prev, especialidades: [...prev.especialidades, esp] }))
    setSpecSearchTerm("")
    setSpecResults([])
  }

  const handleRemoveEspecialidad = (idEspecialidad: number) => {
    setCreateForm((prev) => ({
      ...prev,
      especialidades: prev.especialidades.filter((e) => e.idEspecialidad !== idEspecialidad),
    }))
  }

  const handleClearFilters = () => {
    setSearchTerm("")
    setStatusFilter("")
    setRoleFilter("")
    setPage(1)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setPage(1)
  }

  const handleResetPassword = async (usuario: UserBasicInfo) => {
    setChangePasswordLoading(true)
    setChangePasswordSuccess(false)
    try {
      const res = await apiClient.users.resetPassword(usuario.id)
      setChangePasswordSuccess(true)
      setTimeout(() => {
        setChangePasswordSuccess(false)
        setSelectedUsuario(null)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cambiar la contraseña")
    } finally {
      setChangePasswordLoading(false)
    }
  }

  const handleCreateUser = async () => {
    if (!canCreateUser) {
      toast({ variant: "destructive", title: "No tienes permiso para crear usuarios" })
      return
    }

    if (!createForm.email || !createForm.password || !createForm.nombre || !createForm.apPaterno || !createForm.apMaterno || !createForm.ci || !createForm.role) {
      toast({ variant: "destructive", title: "Completa todos los campos obligatorios" })
      return
    }

    try {
      setCreating(true)
      const payload: any = {
        email: createForm.email,
        password: createForm.password,
        nombre: createForm.nombre,
        apPaterno: createForm.apPaterno,
        apMaterno: createForm.apMaterno,
        ci: createForm.ci,
        grado: createForm.grado || undefined,
        tipo: createForm.tipo,
      }

      if (createForm.role === "SECRETARIA") {
        const especIds = createForm.especialidades.map((e) => e.idEspecialidad).slice(0, 4)
        payload.details = { especialidades: especIds }
      }

      const created: any = await apiClient.users.create(payload)
      const newUserId = created?.data?.id || created?.id

      const roleObj = rolesOptions.find((r) => r.name === createForm.role)
      if (newUserId && roleObj) {
        await apiClient.users.assignRole(newUserId, roleObj.id)
      }

      toast({ title: "Usuario creado correctamente" })
      setShowCreate(false)
      resetCreateForm()
      refetch()
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : err?.message || "No se pudo crear el usuario"
      toast({ variant: "destructive", title: "Error al crear", description: msg })
    } finally {
      setCreating(false)
    }
  }

  const handleChangeStatus = async (usuario: UserBasicInfo, newStatus: string) => {
    setStatusUpdating(true)
    try {
      await apiClient.users.update(usuario.id, { status: newStatus })
      toast({ title: "Estado actualizado" })
      setSelectedUsuario({ ...usuario, status: newStatus as any })
      refetch()
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : err?.message || "No se pudo actualizar el estado"
      toast({ variant: "destructive", title: "Error", description: msg })
    } finally {
      setStatusUpdating(false)
    }
  }

  // Updated permission check: Check if user has ADMIN or UTIC role
  const canChangePassword = () =>
    currentUser?.roles?.some((r) => ["ADMIN", "UTIC", "ADMINISTRADOR"].includes(r.name))

  const canCreateUser = currentUser?.roles?.some((r) => allowedCreateRoles.includes(r.name))
  const canChangeStatus = currentUser?.roles?.some((r) => ["ADMIN", "UTIC", "ADMINISTRADOR"].includes(r.name))

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
      case "BLOCKED":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "MUST_CHANGE_PASSWORD":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    return USER_STATUSES.find((s) => s.value === status)?.label || status
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Listado de Usuarios</h1>
        <p className="text-muted-foreground">Administración completa del directorio de usuarios del sistema</p>
      </div>

      <RoleGuard allowed={allowedCreateRoles}>
        <div className="flex justify-end">
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </Button>
        </div>
      </RoleGuard>

      {/* Buscador y Filtros */}
      <Card className="border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Búsqueda y Filtros</CardTitle>
            {(searchTerm || statusFilter || roleFilter) && (
              <Button size="sm" variant="outline" onClick={handleClearFilters} className="text-xs bg-transparent">
                <X className="w-3 h-3 mr-1" />
                Limpiar filtros
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar por nombre, apellidos o correo</label>
              <div className="relative">
                <Input
                  placeholder="Nombre, correo..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setPage(1)
                  }}
                  className="pr-8"
                />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val === "ALL" ? "" : val)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {USER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rol</label>
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val === "ALL" ? "" : val)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos</SelectItem>
                  {Object.entries(ROLES_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Por página</label>
              <select
                className="w-full border rounded-md px-3 py-2 bg-background"
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value))
                  setPage(1)
                }}
              >
                {[5, 10, 20, 50].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt} registros
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error display with beautiful UI */}
          {error && (
            <div className="mt-4">
              <ErrorDisplay
                message={error.message}
                code={error.code}
                title="Error al cargar usuarios"
                onRetry={refetch}
                onDismiss={clearError}
                variant="destructive"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardContent className="pt-6">
          {loading && (
            <CenteredLoader label="Cargando usuarios..." className="border rounded-xl bg-card" />
          )}
          {!loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-primary/5">
                  <th className="text-left py-3 px-4 font-bold">N°</th>
                  <th className="text-left py-3 px-4 font-bold">Foto</th>
                  <th className="text-left py-3 px-4 font-bold">Usuario</th>
                  <th className="text-left py-3 px-4 font-bold">Roles</th>
                  <th className="text-left py-3 px-4 font-bold">Estado</th>
                  <th className="text-left py-3 px-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario, index) => (
                    <tr key={usuario.id} className="border-b hover:bg-secondary/50 dark:hover:bg-primary/15">
                      <td className="py-3 px-4">{(page - 1) * limit + index + 1}</td>
                      <td className="py-3 px-4">
                        <img
                          src={getUserImageSrc(usuario)}
                          alt={usuario.fullName || usuario.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{usuario.fullName || usuario.email}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {usuario.roles?.length
                            ? usuario.roles.map((r) => (
                                <Badge key={r} className="bg-primary/80 text-primary-foreground">
                                  {ROLES_MAP[r] || r}
                                </Badge>
                              ))
                            : <Badge variant="secondary">Sin rol</Badge>}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusBadgeVariant(usuario.status)} variant="outline">
                          {getStatusLabel(usuario.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedUsuario(usuario)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          DETALLES
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          )}

          {/* Paginación */}
          <div className="flex items-center justify-between mt-6 text-sm text-muted-foreground">
            <div>
              Página {pagination?.page || page} de {pagination?.totalPages || 1} •{" "}
              {pagination?.total ?? usuarios.length} registros
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={pagination ? !pagination.hasPreviousPage : page === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={pagination ? !pagination.hasNextPage : usuarios.length < limit}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles del Usuario */}
      <Dialog open={!!selectedUsuario} onOpenChange={() => setSelectedUsuario(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
              <DialogTitle className="text-primary">Detalles del Usuario</DialogTitle>
            </DialogHeader>
            {selectedUsuario && (
              <div className="space-y-4 max-h-[80vh] overflow-y-auto">
              {changePasswordSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200">
                  <AlertDescription>Contraseña restablecida correctamente al documento de identidad (via backend).</AlertDescription>
                </Alert>
              )}

              {/* Profile picture */}
              <div className="flex justify-center mb-4">
                <img
                  src={getUserImageSrc(selectedUsuario)}
                  alt={selectedUsuario.fullName || selectedUsuario.email}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-primary/20"
                />
              </div>

              <div className="grid gap-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nombres y Apellidos</label>
                  <p className="font-medium">
                    {selectedUsuario.fullName ||
                      `${selectedUsuario.nombres || ""} ${selectedUsuario.apPaterno || ""} ${selectedUsuario.apMaterno || ""}`.trim() ||
                      "-"}
                  </p>
                  <p className="text-xs text-muted-foreground">Grado: {selectedUsuario.grado || "Sin grado"}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">CI / Código</label>
                    <p className="font-medium font-mono text-sm">{selectedUsuario.cod || selectedUsuario.idSaga || "-"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo de usuario</label>
                    <Badge variant="outline" className="uppercase text-xs">
                      {selectedUsuario.tipo || "ADMINISTRATIVO"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Unidad Académica</label>
                  <p className="font-medium">{selectedUsuario.especialidad || "-"}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedUsuario.roles?.length ? (
                      selectedUsuario.roles.map((r) => (
                        <Badge key={r} className="bg-primary/80 text-primary-foreground">
                          {ROLES_MAP[r] || r}
                        </Badge>
                      ))
                    ) : (
                      <Badge variant="secondary">Sin rol</Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                    <Badge className={getStatusBadgeVariant(selectedUsuario.status)}>
                      {getStatusLabel(selectedUsuario.status)}
                    </Badge>
                  </div>
                  {canChangeStatus && (
                    <div className="flex items-center gap-2">
                      <Select value={statusToSet} onValueChange={setStatusToSet}>
                        <SelectTrigger className="w-40 h-9">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_STATUSES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="sm"
                        onClick={() => handleChangeStatus(selectedUsuario, statusToSet || selectedUsuario.status)}
                        disabled={statusUpdating || !statusToSet}
                        className="gap-2"
                      >
                        {statusUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                        Cambiar
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Personal</label>
                  <p className="font-medium text-sm flex items-center gap-2 break-all">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUsuario.emailPersonal || "-"}
                  </p>
                </div>

                <div className="grid gap-2">
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Institucional</label>
                  <p className="font-medium text-sm flex items-center gap-2 break-all">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUsuario.email}
                  </p>
                </div>
              </div>

              {canChangePassword() && (
                <Button
                  onClick={() => handleResetPassword(selectedUsuario)}
                  disabled={changePasswordLoading}
                  className="w-full bg-primary hover:bg-primary/90 text-white flex gap-2 mt-4"
                >
                  <Lock className="w-4 h-4" />
                  {changePasswordLoading ? "Cambiando..." : "Cambiar Contraseña"}
                </Button>
              )}

              <Button onClick={() => setSelectedUsuario(null)} variant="outline" className="w-full mt-2">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Creación */}
      <Dialog
        open={showCreate}
      onOpenChange={(open) => {
        setShowCreate(open)
        if (!open) resetCreateForm()
      }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear Usuario</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Email</Label>
                <Input value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
              </div>
              <div>
                <Label>Contraseña</Label>
                <div className="relative">
                  <Input
                    type={showCreatePassword ? "text" : "password"}
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label>Nombre</Label>
                <Input value={createForm.nombre} onChange={(e) => setCreateForm({ ...createForm, nombre: e.target.value })} />
              </div>
              <div>
                <Label>Apellido Paterno</Label>
                <Input value={createForm.apPaterno} onChange={(e) => setCreateForm({ ...createForm, apPaterno: e.target.value })} />
              </div>
              <div>
                <Label>Apellido Materno</Label>
                <Input value={createForm.apMaterno} onChange={(e) => setCreateForm({ ...createForm, apMaterno: e.target.value })} />
              </div>
              <div>
                <Label>CI</Label>
                <Input value={createForm.ci} onChange={(e) => setCreateForm({ ...createForm, ci: e.target.value })} />
              </div>
              <div>
                <Label>Grado (opcional)</Label>
                <Input value={createForm.grado} onChange={(e) => setCreateForm({ ...createForm, grado: e.target.value })} />
              </div>
              <div>
                <Label>Rol</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(val) => setCreateForm({ ...createForm, role: val })}
                >
                  <SelectTrigger><SelectValue placeholder="Seleccionar rol" /></SelectTrigger>
                  <SelectContent>
                    {allowedCreateRoles.map((r) => (
                      <SelectItem key={r} value={r}>
                        {ROLES_MAP[r] || r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {createForm.role === "SECRETARIA" && (
              <div className="grid gap-3 border rounded-lg p-3 bg-muted/30">
                <div>
                  <Label>Especialidades (hasta 4)</Label>
                  <p className="text-sm text-muted-foreground">Busca y asigna las especialidades de la secretaria.</p>
                </div>
                <div className="relative">
                  <Input
                    placeholder="Buscar especialidad..."
                    value={specSearchTerm}
                    onChange={(e) => setSpecSearchTerm(e.target.value)}
                  />
                  {specLoading && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  )}
                </div>
                {specSearchTerm.length >= 2 && (
                  <div className="border rounded-md bg-background shadow-sm max-h-40 overflow-y-auto p-2 space-y-1">
                    {specResults.length ? (
                      specResults.map((esp) => {
                        const selected = createForm.especialidades.some((e) => e.idEspecialidad === esp.idEspecialidad)
                        const disabled = selected || createForm.especialidades.length >= 4
                        return (
                          <button
                            key={esp.idEspecialidad}
                            type="button"
                            onClick={() => handleAddEspecialidad(esp)}
                            disabled={disabled}
                            className={`w-full text-left rounded px-2 py-1.5 hover:bg-primary/10 ${
                              disabled ? "opacity-60 cursor-not-allowed" : ""
                            }`}
                          >
                            <div className="font-medium leading-tight">{esp.especialidad}</div>
                            <div className="text-xs text-muted-foreground">ID: {esp.idEspecialidad}</div>
                          </button>
                        )
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground px-1">Sin resultados</p>
                    )}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {createForm.especialidades.length ? (
                    createForm.especialidades.map((esp) => (
                      <Badge
                        key={esp.idEspecialidad}
                        className="bg-primary/10 text-primary border border-primary/20 gap-1"
                      >
                        {esp.especialidad}
                        <button
                          type="button"
                          onClick={() => handleRemoveEspecialidad(esp.idEspecialidad)}
                          className="text-primary hover:text-primary/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No hay especialidades seleccionadas</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  resetCreateForm()
                  setShowCreate(false)
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={creating}>
                {creating && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Crear Usuario
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
