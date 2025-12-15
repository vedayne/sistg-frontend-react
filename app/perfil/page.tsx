"use client"

import ProtectedRoute from "@/components/protected-route"
import DashboardShell from "@/components/dashboard-shell"
import ProfilePage from "@/components/pages/profile-page"
import PasswordChangeModal from "@/components/password-change-modal"
import { useAuth } from "@/contexts/auth-context"

export default function PerfilPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute pageId="perfil">
      <DashboardShell>
        <ProfilePage />
      </DashboardShell>
      {user?.mustChangePassword && <PasswordChangeModal />}
    </ProtectedRoute>
  )
}
