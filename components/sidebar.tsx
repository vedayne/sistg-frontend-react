"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { getAuthorizedMenuItems } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronUp, Shield, ChevronLeft, ChevronRight } from "lucide-react"
import { getPermissionsDebugInfo } from "@/lib/role-permissions-config"

export default function Sidebar() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Obtenemos los roles completos del usuario (con id, name, description)
  const rolesList = user?.roles || []

  // NUEVO: Usamos el sistema de permisos basado en IDs de roles
  // Esto combina automáticamente los permisos de todos los roles del usuario
  const menuItems = getAuthorizedMenuItems(rolesList)

  // Detectar la página actual desde la URL
  const currentPage = pathname?.replace("/", "") || "perfil"

  // Debug: Mostrar información de permisos cuando el usuario tiene roles
  useEffect(() => {
    if (rolesList.length > 0) {
      const roleIds = rolesList.map(r => r.id)
      const debugInfo = getPermissionsDebugInfo(roleIds)

      console.log("========================================")
      console.log("SISTEMA DE PERMISOS - INFORMACIÓN DE DEBUG")
      console.log("========================================")
      console.log("Usuario:", user?.persona?.nombreCompleto || user?.email)
      console.log("Roles del usuario:", rolesList.map(r => `${r.name} (ID: ${r.id})`).join(", "))
      console.log("\nDETALLE DE PERMISOS POR ROL:")
      debugInfo.permissionsByRole.forEach(rolePerms => {
        const roleName = rolesList.find(r => r.id === rolePerms.roleId)?.name || "Desconocido"
        console.log(`\n  Rol: ${roleName} (ID: ${rolePerms.roleId})`)
        console.log(`  Páginas permitidas: ${rolePerms.pageCount}`)
        console.log(`  Lista: ${rolePerms.pages.join(", ")}`)
      })
      console.log("\nPERMISOS COMBINADOS:")
      console.log(`  Total de roles: ${debugInfo.totalRoles}`)
      console.log(`  Total de páginas únicas: ${debugInfo.totalPages}`)
      console.log(`  Páginas permitidas: ${debugInfo.allowedPages.join(", ")}`)
      console.log("========================================")
      console.log("Ítems de menú visibles:", menuItems.map(item => item.id).join(", "))
      console.log("========================================")
    }
  }, [user, rolesList, menuItems])

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-sidebar text-sidebar-foreground flex flex-col overflow-hidden border-r border-sidebar-border transition-all duration-300`}>
      {/* Logo and Collapse Button */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/*<div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center font-bold text-sidebar-primary-foreground shrink-0">
              EMI
            </div>*/}
            <img src="/logo_emi.png" alt="Logo" className="w-32 h-16 rounded-lg object-contain" />
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-lg text-sidebar-foreground">RTG</h2>
                <p className="text-xs opacity-90">Gestión de TG</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-sidebar-accent/40 rounded-lg transition-colors shrink-0"
            title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-primary scrollbar-track-sidebar-border">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => router.push(`/${item.id}`)}
              className={`w-full text-left rounded-lg transition-all font-medium flex items-center ${
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              } ${isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                : "hover:bg-sidebar-accent/40 text-sidebar-foreground/90 hover:text-sidebar-foreground"
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && (
                <div className="flex-1">
                  <p className="text-sm">{item.label}</p>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Info with Popover */}
      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/20">
        <Popover>
          <PopoverTrigger asChild>
            <button className={`w-full flex items-center hover:bg-sidebar-accent/40 p-2 rounded-md transition-colors group ${
              isCollapsed ? 'justify-center' : 'gap-3 text-left'
            }`}>
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate text-sidebar-foreground">{user?.persona?.nombreCompleto || user?.email}</p>
                    <div className="flex items-center gap-1 text-xs opacity-75">
                      <span className="truncate">{rolesList[0]?.description || "Sin Rol"}</span>
                      {rolesList.length > 1 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">+{rolesList.length - 1}</Badge>}
                    </div>
                  </div>
                  <ChevronUp className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
                </>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3 mb-2" side="top" align={isCollapsed ? "start" : "center"}>
            <h4 className="font-semibold text-sm mb-2 text-foreground">Mis Roles Asignados</h4>
            <div className="space-y-2">
              {rolesList.map((role, idx) => (
                <div key={idx} className="bg-muted/50 p-2 rounded text-xs border border-muted-foreground/10">
                  <div className="font-medium text-primary dark:text-secondary mb-0.5">{role.name}</div>
                  <div className="text-muted-foreground">{role.description}</div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </aside>
  )
}
