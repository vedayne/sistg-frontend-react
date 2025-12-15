"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import ListadoUsuarioPage from "@/components/pages/listado-usuario-page"

export default function ListadoUsuario() {
  return (
    <ProtectedRoute pageId="listado-usuario">
      <DashboardShell>
        <ListadoUsuarioPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
