"use client"

import { useAuth } from "@/contexts/auth-context"

type RoleGuardProps = {
  allowed: string[]
  children: React.ReactNode
}

export function RoleGuard({ allowed, children }: RoleGuardProps) {
  const { user } = useAuth()
  const userRoles = user?.roles?.map((r) => r.name) || []
  const isAllowed = allowed.some((role) => userRoles.includes(role))
  if (!isAllowed) return null
  return <>{children}</>
}
