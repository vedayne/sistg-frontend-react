"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import ManualPage from "@/components/pages/manual-page"

export default function Manual() {
  return (
    <ProtectedRoute pageId="manual">
      <DashboardShell>
        <ManualPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
