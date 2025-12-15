"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import ProyectosPage from "@/components/pages/proyectos-page"

export default function Proyectos() {
  return (
    <ProtectedRoute pageId="proyectos">
      <DashboardShell>
        <ProyectosPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
