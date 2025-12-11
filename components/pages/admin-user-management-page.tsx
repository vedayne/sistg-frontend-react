"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Lock, Loader2, X, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Pagination, UserBasicInfo } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

const ROLES_MAP: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE_TG: "Docente de TG",
  SECRETARIA: "Secretaria",
  UTIC: "UTIC",
  TUTOR: "Tutor",
  REVISOR: "Revisor",
  REVISOR1: "Revisor 1",
  REVISOR2: "Revisor 2",
  JEFE_CARRERA: "Jefe de Carrera",
  DEE: "DEE",
  ESTUDIANTE: "Estudiante",
  USUARIO_INVITADO: "Usuario Invitado",
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Activo", color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" },
  INACTIVE: { label: "Inactivo", color: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200" },
  BLOCKED: { label: "Bloqueado", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
  DELETED: { label: "Eliminado", color: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200" },
  MUST_CHANGE_PASSWORD: {
    label: "Debe cambiar contraseña",
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  },
}

function PasswordResetModal({ isOpen, onClose, user, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleResetPassword = async () => {
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      // API endpoint to reset password to default (CI number)
      // This would be implemented in your backend as PUT /users/:id
      await apiClient.request(`/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          status: "MUST_CHANGE_PASSWORD",
          password: user.ci || "DEFAULT_PASSWORD",
        }),
      })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        onSuccess()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error resetting password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer Contraseña</DialogTitle>
          <DialogDescription>
            Esto restablecerá la contraseña de {user?.fullName || user?.email} a su número de carnet de identidad
          </DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
            <AlertDescription>Contraseña restablecida exitosamente</AlertDescription>
          </Alert>
        )}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Nueva contraseña: <span className="font-mono font-bold">{user?.ci || "****"}</span>
          </p>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent" disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleResetPassword}
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restableciendo...
                </>
              ) : (
                "Restablecer"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminUserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [usuarios, setUsuarios] = useState<UserBasicInfo[]>([])
  const [selectedUsuario, setSelectedUsuario] = useState<UserBasicInfo | null>(null)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = useCallback(async (pageValue: number, limitValue: number, term: string) => {
    setLoading(true)
    try {
      const response = await apiClient.users.list({
        page: pageValue,
        limit: limitValue,
        search: term || undefined,
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
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsuarios(page, limit, searchTerm || searchEmail)
    }, 350)
    return () => clearTimeout(handler)
  }, [page, limit, searchTerm, searchEmail, fetchUsuarios])

  const filteredUsuarios = usuarios.filter((u) => {
    if (statusFilter && u.status !== statusFilter) return false
    if (roleFilter && !u.roles?.includes(roleFilter)) return false
    return true
  })

  const handleClearFilters = () => {
    setSearchTerm("")
    setSearchEmail("")
    setStatusFilter("")
    setRoleFilter("")
    setPage(1)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Gestión de Usuarios</h1>
        <p className="text-muted-foreground">Administración completa del directorio de usuarios del sistema</p>
      </div>

      {/* Buscador avanzado */}
      <Card className="border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Búsqueda y Filtros</CardTitle>
            <Button size="sm" variant="outline" onClick={handleClearFilters} className="text-xs bg-transparent">
              Limpiar filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Por nombre</label>
              <Input
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Por email</label>
              <Input
                placeholder="Buscar por email..."
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value)
                  setPage(1)
                }}
                type="email"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Estado</label>
              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="ACTIVE">Activo</SelectItem>
                  <SelectItem value="INACTIVE">Inactivo</SelectItem>
                  <SelectItem value="BLOCKED">Bloqueado</SelectItem>
                  <SelectItem value="MUST_CHANGE_PASSWORD">Debe cambiar contraseña</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Rol</label>
              <Select
                value={roleFilter}
                onValueChange={(val) => {
                  setRoleFilter(val)
                  setPage(1)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(ROLES_MAP).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <label className="text-sm text-muted-foreground">Por página</label>
            <select
              className="border rounded-md px-3 py-2 bg-background text-sm"
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value))
                setPage(1)
              }}
            >
              {[5, 10, 20, 50].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
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
                <tr className="border-b-2 border-primary/30 bg-primary/5">
                  <th className="text-left py-4 px-4 font-bold">No.</th>
                  <th className="text-left py-4 px-4 font-bold">Foto</th>
                  <th className="text-left py-4 px-4 font-bold">Usuario</th>
                  <th className="text-left py-4 px-4 font-bold">Rol</th>
                  <th className="text-left py-4 px-4 font-bold">Estado</th>
                  <th className="text-left py-4 px-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.length > 0 ? (
                  filteredUsuarios.map((usuario, index) => (
                    <tr
                      key={usuario.id}
                      className="border-b hover:bg-secondary/50 dark:hover:bg-primary/5 transition-colors"
                    >
                      <td className="py-4 px-4">{(page - 1) * limit + index + 1}</td>
                      <td className="py-4 px-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {usuario.fullName?.charAt(0) || usuario.email.charAt(0)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium">{usuario.fullName || usuario.email}</p>
                          <p className="text-xs text-muted-foreground">{usuario.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {usuario.roles?.[0] ? ROLES_MAP[usuario.roles[0]] || usuario.roles[0] : "Sin rol"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className={STATUS_MAP[usuario.status]?.color || "bg-gray-100"}>
                          {STATUS_MAP[usuario.status]?.label || usuario.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedUsuario(usuario)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs"
                        >
                          DETALLES
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No se encontraron usuarios con los filtros aplicados
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
                disabled={pagination ? !pagination.hasNextPage : filteredUsuarios.length < limit}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles del Usuario */}
      <Dialog open={!!selectedUsuario} onOpenChange={() => setSelectedUsuario(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalles del Usuario</DialogTitle>
            <button
              onClick={() => setSelectedUsuario(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogHeader>
          {selectedUsuario && (
            <div className="space-y-6">
              {/* Foto y nombre */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-lg bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedUsuario.fullName?.charAt(0) || selectedUsuario.email.charAt(0)}
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg">{selectedUsuario.fullName || selectedUsuario.email}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUsuario.email}</p>
                </div>
              </div>

              {/* Información del usuario */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Estado</label>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${STATUS_MAP[selectedUsuario.status]?.color || "bg-gray-100"}`}
                  >
                    {STATUS_MAP[selectedUsuario.status]?.label || selectedUsuario.status}
                  </Badge>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Rol</label>
                  <Badge className="mt-2 bg-primary text-primary-foreground">
                    {selectedUsuario.roles?.[0]
                      ? ROLES_MAP[selectedUsuario.roles[0]] || selectedUsuario.roles[0]
                      : "Sin rol"}
                  </Badge>
                </div>

                {selectedUsuario.cod && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Código</label>
                    <p className="mt-2 font-mono font-bold text-sm">{selectedUsuario.cod}</p>
                  </div>
                )}

                {selectedUsuario.idSaga && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">SAGA ID</label>
                    <p className="mt-2 font-mono font-bold text-sm">{selectedUsuario.idSaga}</p>
                  </div>
                )}
              </div>

              {/* Correo e información de contacto */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">Correo Institucional</label>
                  <p className="mt-2 font-medium text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUsuario.email}
                  </p>
                </div>

                {selectedUsuario.especialidad && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Especialidad</label>
                    <p className="mt-2 font-medium">{selectedUsuario.especialidad}</p>
                  </div>
                )}

                {selectedUsuario.grado && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">Grado</label>
                    <p className="mt-2 font-medium">{selectedUsuario.grado}</p>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button
                  onClick={() => setShowPasswordReset(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white flex gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Restablecer Contraseña
                </Button>
                <Button onClick={() => setSelectedUsuario(null)} variant="outline" className="w-full">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de reset de contraseña */}
      <PasswordResetModal
        isOpen={showPasswordReset}
        onClose={() => setShowPasswordReset(false)}
        user={selectedUsuario}
        onSuccess={() => {
          setSelectedUsuario(null)
          // Refresh the user list
          fetchUsuarios(page, limit, searchTerm || searchEmail)
        }}
      />
    </div>
  )
}
