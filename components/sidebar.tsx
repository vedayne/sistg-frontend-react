"use client"

import { useAuth } from "@/contexts/auth-context"
import { BookOpen, FileText, Settings, BarChart3, Users, HelpCircle, Zap, FolderOpen } from "lucide-react"

const MENU_ITEMS_ALL = [
  { id: "perfil", label: "Perfil", icon: Users, description: "Mi Perfil" },
  { id: "entregas", label: "Entregas", icon: FileText, description: "Gestión de entregas" },
  { id: "defensas", label: "Defensas", icon: BookOpen, description: "Defensas de TG" },
  { id: "proyectos", label: "Proyecto", icon: FolderOpen, description: "Proyectos de TG" },
  { id: "nombramiento-tutor", label: "Nombramiento Tutor", icon: Users, description: "Selecciona tutor" },
  { id: "registro-temario", label: "Registro Temario", icon: FileText, description: "Temario tentativo" },
  { id: "reporte", label: "Generar Reporte", icon: BarChart3, description: "Reportes" },
  { id: "configuraciones", label: "Configuraciones", icon: Settings, description: "Sistema" },
  { id: "documentacion", label: "Documentación", icon: FileText, description: "Documentos" },
  { id: "listado-usuario", label: "Listado Usuario", icon: Users, description: "Usuarios" },
  { id: "manual", label: "Manual de Usuario", icon: HelpCircle, description: "Manual" },
  { id: "flujograma", label: "Flujograma", icon: Zap, description: "Proceso" },
]

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
}

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const { user } = useAuth()

  const getMenuItems = () => {
    if (!user) return MENU_ITEMS_ALL

    const isStudent = user.roles?.some((r) => r.name === "ESTUDIANTE")
    const isTeacher = user.roles?.some((r) =>
      ["DOCENTE_TG", "TUTOR", "REVISOR", "JEFE_CARRERA", "DOCENTE"].includes(r.name),
    )
    const isAdmin = user.roles?.some((r) => r.name === "ADMINISTRADOR")

    if (isStudent) {
      return MENU_ITEMS_ALL.filter((item) => !["configuraciones", "listado-usuario", "reporte"].includes(item.id))
    }
    if (isTeacher) {
      return MENU_ITEMS_ALL
    }
    if (isAdmin) {
      return MENU_ITEMS_ALL
    }

    return MENU_ITEMS_ALL
  }

  const menuItems = getMenuItems()

  return (
    <aside className="w-64 bg-primary text-primary-foreground flex flex-col overflow-hidden border-r dark:border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-bold text-primary">
            EMI
          </div>
          <div>
            <h2 className="font-bold text-lg">SISTG</h2>
            <p className="text-xs opacity-90">Gestión de TG</p>
          </div>
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
              className={`w-full text-left px-4 py-3 rounded-lg transition-all font-medium flex items-center gap-3 ${
                currentPage === item.id
                  ? "bg-secondary text-secondary-foreground shadow-md"
                  : "hover:bg-primary/80 text-primary-foreground/90 hover:text-primary-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <div className="flex-1">
                <p className="text-sm">{item.label}</p>
              </div>
            </button>
          )
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-primary/20 bg-primary/50">
        <p className="text-xs font-medium opacity-75">Rol:</p>
        <p className="text-sm truncate">{user?.roles?.[0]?.name || "Estudiante"}</p>
      </div>
    </aside>
  )
}
