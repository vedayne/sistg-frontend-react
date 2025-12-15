"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import AsignacionRolesPage from "@/components/pages/asignacion-roles-page"

export default function AsignacionRoles() {
  return (
    <ProtectedRoute pageId="asignacion-roles">
      <DashboardShell>
        <AsignacionRolesPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
