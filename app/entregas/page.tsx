"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import EntregasPage from "@/components/pages/entregas-page"

export default function Entregas() {
  return (
    <ProtectedRoute pageId="entregas">
      <DashboardShell>
        <EntregasPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
