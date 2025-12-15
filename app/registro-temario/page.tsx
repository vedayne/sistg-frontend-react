"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import RegistroTemarioPage from "@/components/pages/registro-temario-page"

export default function RegistroTemario() {
  return (
    <ProtectedRoute pageId="registro-temario">
      <DashboardShell>
        <RegistroTemarioPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
