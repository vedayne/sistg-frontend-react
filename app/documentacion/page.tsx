"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import DocumentacionPage from "@/components/pages/documentacion-page"

export default function Documentacion() {
  return (
    <ProtectedRoute pageId="documentacion">
      <DashboardShell>
        <DocumentacionPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
