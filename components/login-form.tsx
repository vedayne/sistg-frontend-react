"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, EyeOff } from "lucide-react"

interface LoginFormProps {
  onBackToHome?: () => void
}

export default function LoginForm({ onBackToHome }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [errorType, setErrorType] = useState<"email" | "password" | "">("")
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  useEffect(() => {
    if (showErrorModal) {
      const timer = setTimeout(() => {
        setShowErrorModal(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showErrorModal])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorType("")
    setIsLoading(true)

    try {
      console.log("[v0] Iniciando proceso de login...")
      await login(email, password)
      console.log("[v0] Login exitoso!")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed"
      console.error("[v0] Login error:", message)

      if (message.toLowerCase().includes("email") || message.toLowerCase().includes("not found")) {
        setErrorType("email")
        setError("El correo ingresado no es correcto o no existe en el sistema.")
      } else if (message.toLowerCase().includes("password") || message.toLowerCase().includes("invalid")) {
        setErrorType("password")
        setError("La contraseña ingresada no es correcta.")
      } else {
        setErrorType("")
        setError(message)
      }
      setShowErrorModal(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary/10 to-background dark:from-primary/5 dark:to-background">
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBackToHome} className="flex items-center gap-3 hover:opacity-80">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              <img
                src={"/emi_logo_png.webp"}
                alt="Logo EMI"
                className="w-8 h-8"
              />
            </div>
            <div>
              <h1 className="font-bold text-lg text-primary">SISTG</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión de TG</p>
            </div>
          </button>
        </div>
      </header>

      <main className="flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl text-primary">Iniciar Sesión</CardTitle>
              <CardDescription>Ingresa con tu correo institucional EMI y contraseña</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && !showErrorModal && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-red-600 font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Correo Institucional</label>
                  <Input
                    type="email"
                    placeholder="usuario@emi.edu.bo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className={errorType === "email" ? "border-red-500" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Contraseña</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className={errorType === "password" ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-white">
                  {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
                </Button>
              </form>

              <div className="mt-4 p-3 bg-secondary/20 rounded-lg text-sm">
                <p className="font-medium text-foreground mb-2">Para probar el sistema:</p>
                <p className="text-muted-foreground text-xs mb-1">Email: mlipay@est.emi.edu.bo</p>
                <p className="text-muted-foreground text-xs">
                  Contraseña: Debe coincidir con la base de datos de la EMI
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600">Error de Autenticación</DialogTitle>
            <DialogDescription className="text-red-600 font-medium mt-2">{error}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button onClick={() => setShowErrorModal(false)} variant="outline" className="flex-1">
              Cerrar
            </Button>
            <Button onClick={() => setShowErrorModal(false)} className="flex-1 bg-primary hover:bg-primary/90">
              Intentar de Nuevo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
