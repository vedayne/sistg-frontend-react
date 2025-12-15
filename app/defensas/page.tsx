"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import DefensasPage from "@/components/pages/defensas-page"

export default function Defensas() {
  return (
    <ProtectedRoute pageId="defensas">
      <DashboardShell>
        <DefensasPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
