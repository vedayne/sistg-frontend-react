"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Eye, EyeOff, Mail } from "lucide-react"
import logo from "@/public/logo-emi-postgrado.png"

interface LoginFormProps {
  onBackToHome?: () => void
  onLoginSuccess?: () => void
}

function ForgotPasswordModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)

    try {
      setSuccess(true)
      setTimeout(() => {
        setEmail("")
        onClose()
      }, 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error requesting password reset")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Recuperar Contraseña</DialogTitle>
          <DialogDescription>Ingresa tu correo institucional para recibir un enlace de recuperación</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <Alert className="bg-green-50 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
              <Mail className="h-4 w-4" />
              <AlertDescription>
                Se ha enviado un enlace de recuperación a tu correo institucional. Por favor revisa tu bandeja de
                entrada y sigue las instrucciones.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!success && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Correo Institucional</label>
                <Input
                  type="email"
                  placeholder="usuario@emi.edu.bo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 bg-transparent"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Enviar Enlace"}
                </Button>
              </div>
            </>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResumeSessionModal({
  isOpen,
  onResume,
  onNewSession,
}: {
  isOpen: boolean
  onResume: () => void
  onNewSession: () => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary">Sesión Activa Detectada</DialogTitle>
          <DialogDescription>Ya tienes una sesión activa en este sistema.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-foreground">¿Qué deseas hacer?</p>

          <div className="flex gap-2">
            <Button onClick={onResume} className="flex-1 bg-primary hover:bg-primary/90">
              Volver al Panel
            </Button>
            <Button onClick={onNewSession} variant="outline" className="flex-1 bg-transparent">
              Iniciar Nueva Sesión
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function LoginForm({ onBackToHome, onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [errorType, setErrorType] = useState<"email" | "password" | "">("")
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showResumeSession, setShowResumeSession] = useState(false)
  const { login, hasValidSession } = useAuth()

  useEffect(() => {
    if (hasValidSession) {
      setShowResumeSession(true)
    }
  }, [hasValidSession])

  useEffect(() => {
    if (showErrorModal) {
      const timer = setTimeout(() => {
        setShowErrorModal(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showErrorModal])

  const handleResume = () => {
    setShowResumeSession(false)
    onLoginSuccess?.()
  }

  const handleNewSession = () => {
    setShowResumeSession(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorType("")
    setIsLoading(true)

    try {
      console.log("[v0] Iniciando proceso de login...")
      await login(email, password)
      console.log("[v0] Login exitoso!")
      onLoginSuccess?.()
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <img src="/sistg-03.jpg" alt="Fondo SISTG" className="w-full h-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-linear-to-br from-background/65 via-background/70 to-background/75 dark:from-background/60 dark:via-background/65 dark:to-background/70" />
      </div>

      <header className="border-b bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={onBackToHome} className="flex items-center gap-3 hover:opacity-80">
            <div className="w-30 h-full bg-white rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-primary/30">
              <img src={logo.src} alt="Logo EMI" className="w-full h-full" />
            </div>
            <div className="text-left">
              <h1 className="font-bold text-xl text-primary leading-tight dark:text-white">RTG</h1>
              <p className="text-xs text-muted-foreground">Sistema de Gestión de Trabajos de Grado</p>
            </div>
          </button>
        </div>
      </header>

      <main className="relative flex items-center justify-center p-4 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-lg">
          <Card className="shadow-xl border-primary/10">
            <CardHeader className="space-y-2">
              <CardTitle className="text-3xl text-primary dark:text-white">Iniciar Sesión</CardTitle>
              <CardDescription>Usa tu correo institucional EMI y contraseña</CardDescription>
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

              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-primary hover:text-primary/80 underline font-medium dark:text-white"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <span className="absolute bottom-4 right-4 text-[5px] opacity-40 tracking-wide">development malydev</span>

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

      <ForgotPasswordModal isOpen={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
      <ResumeSessionModal isOpen={showResumeSession} onResume={handleResume} onNewSession={handleNewSession} />
    </div>
  )
}
