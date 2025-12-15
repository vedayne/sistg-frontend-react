"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Spinner } from "@/components/ui/spinner"

/**
 * Ruta /dashboard ahora redirige a /perfil por defecto.
 * El sistema ya no funciona como SPA, cada página tiene su propia ruta.
 */
export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Si no hay usuario, redirigir a login
        router.replace("/login")
      } else {
        // Si hay usuario, redirigir a perfil
        router.replace("/perfil")
      }
    }
  }, [loading, user, router])

  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Spinner />
    </div>
  )
}
