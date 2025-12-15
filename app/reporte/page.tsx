"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import GenerarReportePage from "@/components/pages/generar-reporte-page"

export default function Reporte() {
  return (
    <ProtectedRoute pageId="reporte">
      <DashboardShell>
        <GenerarReportePage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
