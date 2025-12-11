"use client"
import { useState, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"
import type { AdmEntrega, Pagination } from "@/lib/types"

export default function EntregasPage() {
  const { user } = useAuth()
  const [entregas, setEntregas] = useState<AdmEntrega[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination | null>(null)

  // Filters
  const [page, setPage] = useState(1)
  const [limit] = useState(10)

  const fetchEntregas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // By default list schedules. 
      // If student, this might need to be filtered by their specialty/semester if the API supported it directly for 'my-schedules'
      // But based on docs, we use list adm-entregas.
      const response = await apiClient.admEntregas.list({
        page,
        limit,
        sortBy: "createdAt",
        sortOrder: "desc"
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

  const getStatusBadge = (isActive: boolean) => {
    return isActive
      ? <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Activo</Badge>
      : <Badge variant="secondary">Inactivo</Badge>
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-BO", {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Cronograma de Entregas</h1>
          <p className="text-muted-foreground">Gestión y visualización de fechas de entrega programadas</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchEntregas} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listado de Entregas Programadas</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4 text-sm">
              {error}
            </div>
          )}

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
                      <th className="text-left py-3 px-4 font-bold">Título</th>
                      <th className="text-left py-3 px-4 font-bold">Descripción</th>
                      <th className="text-left py-3 px-4 font-bold">Inicio</th>
                      <th className="text-left py-3 px-4 font-bold">Fin</th>
                      <th className="text-left py-3 px-4 font-bold">Estado</th>
                      <th className="text-left py-3 px-4 font-bold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entregas.length > 0 ? (
                      entregas.map((entrega) => (
                        <tr key={entrega.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 font-medium">{entrega.title}</td>
                          <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">{entrega.descripcion || "-"}</td>
                          <td className="py-3 px-4">{formatDate(entrega.startAt)}</td>
                          <td className="py-3 px-4">{formatDate(entrega.endAt)}</td>
                          <td className="py-3 px-4">{getStatusBadge(entrega.isActive)}</td>
                          <td className="py-3 px-4">
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                              Ver Detalles
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No hay entregas programadas disponibles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {pagination && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={!pagination.hasPreviousPage || loading}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => p + 1)}
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

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-lg text-sm text-blue-800 dark:text-blue-300">
        <p><strong>Nota:</strong> Como estudiante, solo podrás subir archivos cuando la entrega esté activa y dentro del rango de fechas establecido.</p>
      </div>
    </div>
  )
}
