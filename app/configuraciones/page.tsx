"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import ConfiguracionesPage from "@/components/pages/configuraciones-page"

export default function Configuraciones() {
  return (
    <ProtectedRoute pageId="configuraciones">
      <DashboardShell>
        <ConfiguracionesPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
