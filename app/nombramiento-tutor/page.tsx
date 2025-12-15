"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import NombramientoTutorPage from "@/components/pages/nombramiento-tutor-page"

export default function NombramientoTutor() {
  return (
    <ProtectedRoute pageId="nombramiento-tutor">
      <DashboardShell>
        <NombramientoTutorPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
