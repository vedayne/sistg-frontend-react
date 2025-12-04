"use client"

import { useAuth } from "@/contexts/auth-context"
import HomePage from "@/components/home-page"
import DashboardLayout from "@/components/dashboard-layout"
import PasswordChangeModal from "@/components/password-change-modal"
import { Spinner } from "@/components/ui/spinner"

export default function Page() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <HomePage />
  }

  return (
    <>
      <DashboardLayout />
      {user.mustChangePassword && <PasswordChangeModal />}
    </>
  )
}
