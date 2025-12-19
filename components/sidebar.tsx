"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAuthorizedMenuItems } from "@/lib/permissions"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronUp, Shield, Menu, ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Extract role names from user object
  const userRoles = user?.roles?.map((r) => r.name) || []
  const menuItems = getAuthorizedMenuItems(userRoles)
  const rolesList = user?.roles || []

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-primary text-primary-foreground flex flex-col overflow-hidden border-r dark:border-slate-800 transition-all duration-300`}>
      {/* Logo and Collapse Button */}
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-bold text-primary shrink-0">
              EMI
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <h2 className="font-bold text-lg">SISTG</h2>
                <p className="text-xs opacity-90">Gestión de TG</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-primary/40 rounded-lg transition-colors flex-shrink-0"
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-secondary scrollbar-track-primary/20">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full text-left rounded-lg transition-all font-medium flex items-center ${
                isCollapsed ? 'px-3 py-3 justify-center' : 'px-4 py-3 gap-3'
              } ${currentPage === item.id
                ? "bg-secondary text-secondary-foreground shadow-md"
                : "hover:bg-primary/80 text-primary-foreground/90 hover:text-primary-foreground"
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
      <div className="p-4 border-t border-primary/20 bg-primary/50">
        <Popover>
          <PopoverTrigger asChild>
            <button className={`w-full flex items-center hover:bg-primary/40 p-2 rounded-md transition-colors group ${
              isCollapsed ? 'justify-center' : 'gap-3 text-left'
            }`}>
              <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary-foreground shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium truncate">{user?.persona?.nombreCompleto || user?.email}</p>
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
                  <div className="font-medium text-primary mb-0.5">{role.name}</div>
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
