"use client"

import { useCallback, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { Pagination, UserBasicInfo } from "@/lib/types"

const ROLES_MAP: Record<string, string> = {
  ADMINISTRADOR: "Administrador",
  DOCENTE_TG: "Docente de TG",
  SECRETARIA: "Secretaria",
  UTIC: "UTIC",
  TUTOR: "Tutor",
  REVISOR: "Revisor",
  JEFE_CARRERA: "Jefe de Carrera",
  DDE: "DDE",
}

export default function ListadoUsuarioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [usuarios, setUsuarios] = useState<UserBasicInfo[]>([])
  const [selectedUsuario, setSelectedUsuario] = useState<UserBasicInfo | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchUsuarios = useCallback(
    async (pageValue: number, limitValue: number, term: string) => {
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
    },
    [],
  )

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsuarios(page, limit, searchTerm)
    }, 350)
    return () => clearTimeout(handler)
  }, [page, limit, searchTerm, fetchUsuarios])

  const canChangePassword = (rol?: string) => ["ADMINISTRADOR", "UTIC", "DOCENTE_TG"].includes(rol || "")

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Listado de Usuarios</h1>
        <p className="text-muted-foreground">Directorio de usuarios del sistema</p>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <Input
              placeholder="Busca por nombre, email, CI..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setPage(1)
              }}
              className="max-w-md"
            />
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Por página</label>
              <select
                className="border rounded-md px-3 py-2 bg-background"
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
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
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
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold">No.</th>
                  <th className="text-left py-3 px-4 font-bold">Foto</th>
                  <th className="text-left py-3 px-4 font-bold">Usuario</th>
                  <th className="text-left py-3 px-4 font-bold">Rol</th>
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
                      <td className="py-3 px-4 text-sm font-medium">
                        {usuario.fullName || usuario.email}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {usuario.roles?.[0] ? ROLES_MAP[usuario.roles[0]] || usuario.roles[0] : "Sin rol"}
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
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
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

      {/* Modal de Detalles */}
      <Dialog open={!!selectedUsuario} onOpenChange={() => setSelectedUsuario(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUsuario && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={"/diverse-avatars.png"}
                  alt={selectedUsuario.fullName || selectedUsuario.email}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Usuario</label>
                  <p className="font-medium">{selectedUsuario.fullName || selectedUsuario.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Estado</label>
                  <Badge variant="outline" className="uppercase">
                    {selectedUsuario.status}
                  </Badge>
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Correo</label>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUsuario.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Código / SAGA</label>
                  <p className="font-medium">{selectedUsuario.cod || selectedUsuario.idSaga || "N/A"}</p>
                </div>

                {selectedUsuario.especialidad && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Especialidad</label>
                    <p className="font-medium">{selectedUsuario.especialidad}</p>
                  </div>
                )}
              </div>

              {canChangePassword(selectedUsuario.roles?.[0]) && (
                <Button
                  onClick={() => console.log("Cambiar contraseña para:", selectedUsuario.email)}
                  className="w-full bg-primary hover:bg-primary/90 text-white flex gap-2 mt-4"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
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
