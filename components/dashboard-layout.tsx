"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import Sidebar from "@/components/sidebar"
import ProfilePage from "@/components/pages/profile-page"
import EntregasPage from "@/components/pages/entregas-page"
import DefensasPage from "@/components/pages/defensas-page"
import ProyectosPage from "@/components/pages/proyectos-page"
import ConfiguracionesPage from "@/components/pages/configuraciones-page"
import DocumentacionPage from "@/components/pages/documentacion-page"
import ManualPage from "@/components/pages/manual-page"
import FlujogramaPage from "@/components/pages/flujograma-page"
import GenerarReportePage from "@/components/pages/generar-reporte-page"
import PasswordChangeModal from "@/components/password-change-modal"
import ListadoUsuarioPage from "@/components/pages/listado-usuario-page"
import NombramientoTutorPage from "@/components/pages/nombramiento-tutor-page"
import RegistroTemarioPage from "@/components/pages/registro-temario-page"
import { Moon, Sun, LogOut } from "lucide-react"

export default function DashboardLayout() {
  const [currentPage, setCurrentPage] = useState("perfil")
  const [isDark, setIsDark] = useState(false)
  const { user, logout, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Spinner />
      </div>
    )
  }

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    if (isDark) {
      document.documentElement.classList.remove("dark")
    } else {
      document.documentElement.classList.add("dark")
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const renderPage = () => {
    switch (currentPage) {
      case "perfil":
        return <ProfilePage />
      case "entregas":
        return <EntregasPage />
      case "defensas":
        return <DefensasPage />
      case "proyectos":
        return <ProyectosPage />
      case "nombramiento-tutor":
        return <NombramientoTutorPage />
      case "registro-temario":
        return <RegistroTemarioPage />
      case "configuraciones":
        return <ConfiguracionesPage />
      case "documentacion":
        return <DocumentacionPage />
      case "listado-usuario":
        return <ListadoUsuarioPage />
      case "manual":
        return <ManualPage />
      case "flujograma":
        return <FlujogramaPage />
      case "reporte":
        return <GenerarReportePage />
      default:
        return <ProfilePage />
    }
  }

  return (
    <div className={`flex h-screen bg-background ${isDark ? "dark" : ""}`}>
      {user?.mustChangePassword && <PasswordChangeModal />}

      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card dark:bg-slate-900 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">SISTG EMI</h1>
              <p className="text-sm text-muted-foreground">{user?.persona?.nombreCompleto}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" onClick={toggleDarkMode} className="hover:bg-secondary/20">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleLogout}
                className="flex gap-2 items-center bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-background">{renderPage()}</main>
      </div>
    </div>
  )
}
