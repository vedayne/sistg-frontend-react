"use client"

import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Sidebar from "@/components/sidebar"
import { Moon, Sun, LogOut, Home } from "lucide-react"

interface DashboardShellProps {
  children: React.ReactNode
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  const toggleDarkMode = () => setTheme(theme === "dark" ? "light" : "dark")

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/80 sticky top-0 z-40">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary">SISTG EMI</h1>
              <p className="text-sm text-muted-foreground">{user?.persona?.nombreCompleto}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button size="sm" variant="ghost" onClick={() => router.push("/")} className="hover:bg-secondary/20">
                <Home className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={toggleDarkMode} className="hover:bg-secondary/20">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
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
        <main className="flex-1 overflow-auto bg-background">{children}</main>
      </div>
    </div>
  )
}
