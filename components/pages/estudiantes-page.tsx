"use client"

import { useEffect, useState, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { hasAccess } from "@/lib/permissions"
import type { EstudianteBasicInfo } from "@/lib/types"

export default function EstudiantesPage() {
  const { user } = useAuth()
  const [estudiantes, setEstudiantes] = useState<EstudianteBasicInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filtros
  const [searchTerm, setSearchTerm] = useState("")
  const [gestionFilter, setGestionFilter] = useState("") // Currently not in BasicInfo, maybe separate logic needed or removed if API handles it

  // Note: The API defines filtering by 'search', 'especialidad', 'idSaga', 'isActive'.
  // 'gestion' and 'semestre' might come from nested properties or separate API calls if needed.
  // The provided GET /students response example has 'carrera' and 'semestre'. 
  // We'll rely on client-side filtering or API params if available. 
  // API docs say: query 'search', 'especialidad', 'idSaga', 'isActive'.

  const userRoles = user?.roles?.map(r => r.name) || []
  const canView = hasAccess("estudiantes", userRoles)

  // Cargar estudiantes
  useEffect(() => {
    const fetchEstudiantes = async () => {
      setLoading(true)
      try {
        const response = await apiClient.students.list({
          isActive: true,
          limit: 100, // Reasonable limit for now
        })

        const data = Array.isArray(response) ? response : (response as any).data || []
        setEstudiantes(data)
        setError(null)
      } catch (err) {
        const message = err instanceof Error ? err.message : "No se pudieron cargar los estudiantes"
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    if (canView) {
      fetchEstudiantes()
    }
  }, [canView])

  // Client-side filtering for search term if API search isn't enough or for quick feedback
  const filteredEstudiantes = useMemo(() => {
    return estudiantes.filter((est) => {
      const term = searchTerm.toLowerCase()
      return (
        term === "" ||
        est.nombreCompleto?.toLowerCase().includes(term) ||
        est.codEstudiante?.toLowerCase().includes(term) ||
        est.idSaga?.toString().includes(term)
      )
    })
  }, [estudiantes, searchTerm])

  if (!canView) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-2">No tienes permiso para ver este módulo.</p>
          <p className="text-xs text-muted-foreground/70">Roles actuales: {userRoles.join(", ")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">Estudiantes</h1>
        <p className="text-sm md:text-base text-muted-foreground">Listado completo de estudiantes registrados</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Búsqueda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-xs md:text-sm font-medium mb-2 block">Buscar</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nombre, código o SAGA..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            {/* Future: Add server-side pagination/search trigger if list is huge */}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de estudiantes */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-500 bg-red-50 rounded-lg">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm">
                <thead>
                  <tr className="border-b-2 border-primary bg-muted/20">
                    <th className="text-left py-3 px-2 md:px-4 font-bold">ID SAGA</th>
                    <th className="text-left py-3 px-2 md:px-4 font-bold">Código</th>
                    <th className="text-left py-3 px-2 md:px-4 font-bold">Nombre Completo</th>
                    <th className="text-left py-3 px-2 md:px-4 font-bold">Carrera</th>
                    <th className="text-left py-3 px-2 md:px-4 font-bold">Semestre</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEstudiantes.length > 0 ? (
                    filteredEstudiantes.map((est) => (
                      <tr key={est.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 md:px-4 font-mono text-xs">{est.idSaga}</td>
                        <td className="py-3 px-2 md:px-4 font-mono text-xs">{est.codEstudiante}</td>
                        <td className="py-3 px-2 md:px-4 font-medium">{est.nombreCompleto}</td>
                        <td className="py-3 px-2 md:px-4">{est.carrera || est.especialidad || "-"}</td>
                        <td className="py-3 px-2 md:px-4">
                          {est.semestre ? <Badge variant="outline">{est.semestre}</Badge> : "-"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No se encontraron estudiantes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredEstudiantes.length > 0 && (
            <div className="mt-4 text-xs text-muted-foreground text-center">
              Mostrando {filteredEstudiantes.length} resultados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
