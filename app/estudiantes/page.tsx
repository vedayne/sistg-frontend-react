"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import EstudiantesPage from "@/components/pages/estudiantes-page"

export default function Estudiantes() {
  return (
    <ProtectedRoute pageId="estudiantes">
      <DashboardShell>
        <EstudiantesPage />
      </DashboardShell>
    </ProtectedRoute>
  )
}
