"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ShieldCheck, UserCheck, UserSearch } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import type { RoleInfo, UserBasicInfo } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function AsignacionRolesPage() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [results, setResults] = useState<UserBasicInfo[]>([])
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [roles, setRoles] = useState<RoleInfo[]>([])
  const [selectedUser, setSelectedUser] = useState<UserBasicInfo | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await apiClient.roles.list()
        setRoles(res)
      } catch (err) {
        console.error(err)
        toast({ variant: "destructive", title: "No se pudieron cargar los roles" })
      }
    }
    loadRoles()
  }, [toast])

  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchTerm.length < 2) {
        setResults([])
        setLoadingSearch(false)
        return
      }
      try {
        setLoadingSearch(true)
        const res = await apiClient.users.list({ search: searchTerm, limit: 8 })
        setResults((res as any).data || res || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingSearch(false)
      }
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const handleAssign = async () => {
    if (!selectedUser || !selectedRole) {
      toast({ variant: "destructive", title: "Selecciona usuario y rol" })
      return
    }
    if (selectedUser.roles?.includes(selectedRole)) {
      toast({ title: "El usuario ya tiene este rol" })
      return
    }
    try {
      setAssigning(true)
      const roleObj = roles.find((r) => r.name === selectedRole)
      if (!roleObj) throw new Error("Rol no encontrado")
      await apiClient.users.assignRole(selectedUser.id, roleObj.id)
      toast({ title: "Rol asignado correctamente" })
      setSelectedUser({ ...selectedUser, roles: Array.from(new Set([...(selectedUser.roles || []), selectedRole])) })
    } catch (err: any) {
      const msg = err instanceof Error ? err.message : err?.message || "No se pudo asignar el rol"
      toast({ variant: "destructive", title: "Error al asignar", description: msg })
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" /> Asignación de Roles
          </h1>
          <p className="text-muted-foreground text-sm">Busca usuarios y asigna roles activos.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserSearch className="w-4 h-4" /> Buscar usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Nombre o correo (mín. 2 letras)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm.length >= 2 && (
              <div className="border rounded-md max-h-64 overflow-y-auto">
                {loadingSearch && (
                  <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Buscando...
                  </div>
                )}
                {!loadingSearch && results.length === 0 && (
                  <p className="px-3 py-2 text-sm text-muted-foreground">Sin resultados</p>
                )}
                {!loadingSearch &&
                  results.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUser(u)}
                      className={`w-full text-left px-3 py-2 hover:bg-primary/10 ${selectedUser?.id === u.id ? "bg-primary/10" : ""}`}
                    >
                      <p className="text-sm font-semibold">{u.fullName || u.email}</p>
                      <p className="text-xs text-muted-foreground break-all">{u.email}</p>
                      {u.roles?.length ? (
                        <p className="text-[11px] text-muted-foreground">Roles: {u.roles.join(", ")}</p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">Sin roles</p>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Usuario seleccionado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedUser ? (
              <>
                <div>
                  <p className="font-semibold">{selectedUser.fullName || selectedUser.email}</p>
                  <p className="text-xs text-muted-foreground break-all">{selectedUser.email}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Roles actuales</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedUser.roles?.length ? (
                      selectedUser.roles.map((r) => <Badge key={r}>{r}</Badge>)
                    ) : (
                      <Badge variant="secondary">Sin roles</Badge>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Asignar nuevo rol</p>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona rol" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles
                        .filter((r) => r.isActive)
                        .map((r) => (
                          <SelectItem key={r.id} value={r.name}>
                            {r.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAssign} disabled={assigning} className="gap-2">
                    {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                    Asignar rol
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona un usuario de la lista para continuar.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
