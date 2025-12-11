"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, Loader2, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Pagination, UserBasicInfo } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"

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
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [usuarios, setUsuarios] = useState<UserBasicInfo[]>([])
  const [selectedUsuario, setSelectedUsuario] = useState<UserBasicInfo | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [changePasswordLoading, setChangePasswordLoading] = useState(false)
  const [changePasswordSuccess, setChangePasswordSuccess] = useState(false)

  const fetchUsuarios = useCallback(
    async (pageValue: number, limitValue: number, term: string, status = "", role = "") => {
      setLoading(true)
      try {
        const response = await apiClient.users.list({
          page: pageValue,
          limit: limitValue,
          search: term || undefined,
          status: status || undefined,
          role: role || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        })
        setUsuarios(response.data)
        setPagination(response.pagination)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudieron cargar los usuarios"
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsuarios(page, limit, searchTerm, statusFilter, roleFilter)
    }, 350)
    return () => clearTimeout(handler)
  }, [page, limit, searchTerm, statusFilter, roleFilter, fetchUsuarios])

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
      // Reset password to CI - the default password is the user's carnet de identidad
      const defaultPassword = usuario.cod || usuario.idSaga?.toString() || "12345678"
      await apiClient.users.update(usuario.id, { password: defaultPassword })
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

  // Updated permission check: Check if user has ADMIN or UTIC role
  const canChangePassword = () =>
    currentUser?.roles?.some((r) => ["ADMIN", "UTIC", "ADMINISTRADOR"].includes(r.name))

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
          {error && <p className="text-sm text-red-600 mt-3">{error}</p>}
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardContent className="pt-6">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando usuarios...
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary bg-primary/5">
                  <th className="text-left py-3 px-4 font-bold">N°</th>
                  <th className="text-left py-3 px-4 font-bold">Foto</th>
                  <th className="text-left py-3 px-4 font-bold">Usuario</th>
                  <th className="text-left py-3 px-4 font-bold">Rol</th>
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
                          src={"/diverse-avatars.png"}
                          alt={usuario.fullName || usuario.email}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">{usuario.fullName || usuario.email}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {usuario.roles?.[0] ? ROLES_MAP[usuario.roles[0]] || usuario.roles[0] : "Sin rol"}
                        </Badge>
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
                  <AlertDescription>Contraseña restablecida correctamente al documento de identidad.</AlertDescription>
                </Alert>
              )}

              {/* Profile picture */}
              <div className="flex justify-center mb-4">
                <img
                  src={"/diverse-avatars.png"}
                  alt={selectedUsuario.fullName || selectedUsuario.email}
                  className="w-20 h-20 rounded-lg object-cover border-2 border-primary/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Nombres y Apellidos</label>
                <p className="font-medium">
                  {selectedUsuario.fullName ||
                    `${selectedUsuario.nombres || ""} ${selectedUsuario.apPaterno || ""} ${selectedUsuario.apMaterno || ""}`.trim() ||
                    "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Unidad Académica</label>
                <p className="font-medium">{selectedUsuario.especialidad || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Rol</label>
                <Badge className="bg-primary text-primary-foreground">
                  {selectedUsuario.roles?.[0]
                    ? ROLES_MAP[selectedUsuario.roles[0]] || selectedUsuario.roles[0]
                    : "Sin rol"}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                <Badge className={getStatusBadgeVariant(selectedUsuario.status)}>
                  {getStatusLabel(selectedUsuario.status)}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Personal</label>
                <p className="font-medium text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {selectedUsuario.emailPersonal || "-"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Institucional</label>
                <p className="font-medium text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {selectedUsuario.email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Carnet de Identidad</label>
                <p className="font-medium font-mono text-sm">{selectedUsuario.cod || selectedUsuario.idSaga || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Usuario Externo</label>
                <Badge variant="outline" className="uppercase text-xs">
                  {selectedUsuario.tipo === "externo" ? "Sí" : "No"}
                </Badge>
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
    </div>
  )
}
