"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { hasAccess } from "@/lib/permissions"
import { Spinner } from "@/components/ui/spinner"

interface ProtectedRouteProps {
  children: React.ReactNode
  pageId: string
}

export default function ProtectedRoute({ children, pageId }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // Si no hay usuario, redirigir al login
      if (!user) {
        router.replace("/login")
        return
      }

      // Verificar si el usuario tiene acceso a esta página
      const roles = user.roles || []
      const hasPageAccess = hasAccess(pageId, roles)

      if (!hasPageAccess) {
        // Si no tiene acceso, redirigir a perfil (todos tienen acceso a perfil)
        console.warn(`[ProtectedRoute] Usuario sin acceso a página: ${pageId}. Redirigiendo a /perfil`)
        router.replace("/perfil")
      }
    }
  }, [loading, user, pageId, router])

  // Mostrar spinner mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (se redirigirá en el useEffect)
  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  // Verificar permisos
  const roles = user.roles || []
  const hasPageAccess = hasAccess(pageId, roles)

  // Si no tiene acceso, no mostrar nada (se redirigirá en el useEffect)
  if (!hasPageAccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  // Si tiene acceso, mostrar el contenido
  return <>{children}</>
}
