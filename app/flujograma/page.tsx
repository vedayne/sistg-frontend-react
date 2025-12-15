"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import FlujogramaPage from "@/components/pages/flujograma-page"

export default function Flujograma() {
  return (
    <ProtectedRoute pageId="flujograma">
      <DashboardShell>
        <FlujogramaPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
