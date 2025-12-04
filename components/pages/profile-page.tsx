"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Camera, Lock, LogOut, Smartphone, X, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const { user, loading, updatePassword, fetchSessions, logoutAllDevices, logoutDevice, sessions } = useAuth()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showSessionsPopup, setShowSessionsPopup] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.fotoPerfil?.remotepath) {
      setProfileImage(user.fotoPerfil.remotepath)
    }
  }, [user?.fotoPerfil])

  const handleOpenSessionsPopup = async () => {
    setShowSessionsPopup(true)
    await fetchSessions()
  }

  const handleLogoutAllDevices = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar todas las sesiones en otros dispositivos?")) {
      setIsLoggingOut(true)
      try {
        await logoutAllDevices()
        setShowSessionsPopup(false)
        alert("Todas las sesiones han sido cerradas exitosamente")
      } catch (err) {
        alert("Error al cerrar las sesiones: " + (err instanceof Error ? err.message : "Error desconocido"))
      } finally {
        setIsLoggingOut(false)
      }
    }
  }

  const handleLogoutDevice = async (sessionId: string) => {
    if (confirm("¿Estás seguro de que quieres cerrar la sesión en este dispositivo?")) {
      setIsLoggingOut(true)
      try {
        await logoutDevice(sessionId)
        alert("La sesión ha sido cerrada exitosamente")
      } catch (err) {
        alert("Error al cerrar la sesión: " + (err instanceof Error ? err.message : "Error desconocido"))
      } finally {
        setIsLoggingOut(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertDescription>Usuario no autenticado</AlertDescription>
        </Alert>
      </div>
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError("")
    setPasswordSuccess("")

    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("Las contraseñas no coinciden")
      return
    }

    if (passwordData.new.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (passwordData.new === passwordData.current) {
      setPasswordError("La nueva contraseña debe ser diferente a la actual")
      return
    }

    setIsSubmittingPassword(true)

    try {
      await updatePassword(passwordData.current, passwordData.new)
      setPasswordSuccess("Contraseña actualizada exitosamente")
      setTimeout(() => {
        setShowPasswordDialog(false)
        setPasswordData({ current: "", new: "", confirm: "" })
      }, 1500)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error al cambiar contraseña"
      setPasswordError(message)
    } finally {
      setIsSubmittingPassword(false)
    }
  }

  const roles = user.roles?.map((r) => r.name).join(", ") || "Estudiante"

  const parseUserAgent = (ua: string) => {
    const isChromeMatch = ua.match(/Chrome\/(\d+)/)
    const isFirefoxMatch = ua.match(/Firefox\/(\d+)/)
    const isSafariMatch = ua.match(/Version\/(\d+)/)
    const isWindowsMatch = ua.match(/Windows NT/i)
    const isMacMatch = ua.match(/Macintosh/i)
    const isLinuxMatch = ua.match(/Linux/i)

    let browser = "Navegador desconocido"
    if (isChromeMatch) browser = `Chrome ${isChromeMatch[1]}`
    else if (isFirefoxMatch) browser = `Firefox ${isFirefoxMatch[1]}`
    else if (isSafariMatch) browser = `Safari ${isSafariMatch[1]}`

    let os = "SO desconocido"
    if (isWindowsMatch) os = "Windows"
    else if (isMacMatch) os = "macOS"
    else if (isLinuxMatch) os = "Linux"

    return { browser, os }
  }

  const currentSessionId = sessions.length > 0 ? sessions[0]?.id : null
  const otherSessions = sessions.filter((s) => s.id !== currentSessionId)

  const calculateTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expires = new Date(expiresAt).getTime()
    const diffMs = expires - now
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Tabs defaultValue="perfil" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="sesiones">Sesiones Activas</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Mi Perfil</h1>
            <p className="text-muted-foreground">Información personal y datos académicos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Foto de Perfil y Acciones */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-center">Foto de Perfil</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={profileImage || "/placeholder.svg?height=200&width=200&query=profile"}
                    alt="Perfil"
                    className="w-40 h-40 rounded-lg object-cover border-4 border-primary/20"
                  />
                  <label className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/90">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled />
                  </label>
                </div>
                <p className="text-xs text-muted-foreground">Subida de imagen disponible próximamente</p>
                <Button
                  onClick={() => setShowPasswordDialog(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white flex gap-2"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </Button>
              </CardContent>
            </Card>

            {/* Información Personal */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Datos de tu perfil desde SAGA</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Nombre Completo</label>
                    <p className="font-medium text-foreground">{user.persona?.nombreCompleto}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Carné de Identidad</label>
                    <p className="font-medium text-foreground">{user.persona?.ci || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Personal</label>
                    <p className="font-medium text-foreground">{user.persona?.emailPersonal || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Institucional</label>
                    <p className="font-medium text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Teléfono</label>
                    <p className="font-medium text-foreground">{user.persona?.telefono || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Celular</label>
                    <p className="font-medium text-foreground">{user.persona?.celular || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Género</label>
                    <p className="font-medium text-foreground">{user.persona?.sexo || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Grado</label>
                    <p className="font-medium text-foreground">{user.persona?.grado || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información Académica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Académica</CardTitle>
              <CardDescription>Datos de tu perfil académico en la institución</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Especialidad</label>
                  <p className="font-medium text-foreground">{user.academico?.especialidad || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Unidad Académica</label>
                  <p className="font-medium text-foreground">{user.academico?.unidadAcademica || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Nivel Académico</label>
                  <p className="font-medium text-foreground">{user.academico?.nivelAcad || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo de Estudiante</label>
                  <p className="font-medium text-foreground">
                    {user.persona?.fuerza === "Militar" ? "Estudiante Militar" : "Estudiante Civil"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    Códigos de Identificación
                  </label>
                  <p className="font-medium text-foreground">{user.academico?.codAlumno || "N/A"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Roles</label>
                  <p className="font-medium text-foreground text-sm">{roles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sesiones" className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">Sesiones Activas</h1>
            <p className="text-muted-foreground">Gestiona tus sesiones en diferentes dispositivos</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button
                onClick={handleOpenSessionsPopup}
                className="flex gap-2 items-center bg-primary hover:bg-primary/90 text-white"
              >
                <Smartphone className="w-4 h-4" />
                Ver y Gestionar Sesiones
              </Button>
            </CardContent>
          </Card>

          {/* PopUp de Sesiones */}
          {showSessionsPopup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-card border rounded-lg shadow-lg max-w-2xl w-full max-h-96 overflow-y-auto dark:bg-slate-900">
                <div className="sticky top-0 bg-card dark:bg-slate-900 border-b p-4 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-primary">Gestionar Sesiones</h2>
                  <button
                    onClick={() => setShowSessionsPopup(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {sessions.length > 0 && (
                    <>
                      {/* Este dispositivo */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-blue-600 dark:text-blue-400 text-sm uppercase">
                          Este dispositivo
                        </h3>
                        {sessions.slice(0, 1).map((session) => {
                          const { browser, os } = parseUserAgent(session.userAgent)
                          const timeRemaining = calculateTimeRemaining(session.expiresAt)
                          return (
                            <div key={session.id} className="border rounded-lg p-4 bg-blue-50 dark:bg-slate-800">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="font-semibold text-foreground">{browser}</p>
                                  <p className="text-sm text-muted-foreground">{os}</p>
                                  <p className="text-xs text-muted-foreground mt-1">IP: {session.ip}</p>
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                                    Tiempo disponible: {timeRemaining}
                                  </p>
                                </div>
                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 px-2 py-1 rounded">
                                  Activa
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>

                      {/* Botón cerrar todas las sesiones */}
                      {otherSessions.length > 0 && (
                        <Button
                          onClick={handleLogoutAllDevices}
                          disabled={isLoggingOut}
                          variant="destructive"
                          className="w-full"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          {isLoggingOut ? "Cerrando sesiones..." : "Cerrar Todas las Otras Sesiones"}
                        </Button>
                      )}

                      {/* Sesiones activas */}
                      {otherSessions.length > 0 && (
                        <div className="space-y-3 border-t pt-6">
                          <h3 className="font-semibold text-slate-600 dark:text-slate-300 text-sm uppercase">
                            Otras Sesiones Activas ({otherSessions.length})
                          </h3>
                          {otherSessions.map((session) => {
                            const { browser, os } = parseUserAgent(session.userAgent)
                            const date = new Date(session.expiresAt)
                            const timeRemaining = calculateTimeRemaining(session.expiresAt)
                            return (
                              <div key={session.id} className="border rounded-lg p-4 dark:border-slate-700">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <p className="font-semibold text-foreground">{browser}</p>
                                    <p className="text-sm text-muted-foreground">{os}</p>
                                    <p className="text-xs text-muted-foreground mt-1">IP: {session.ip}</p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
                                      Tiempo disponible: {timeRemaining}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {date.toLocaleDateString("es-ES", {
                                        month: "short",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </p>
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(session.id)
                                        setCopiedSessionId(session.id)
                                        setTimeout(() => setCopiedSessionId(null), 2000)
                                      }}
                                      variant="ghost"
                                      className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                                      title="Copiar ID de sesión"
                                    >
                                      <Copy className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="h-8 px-2"
                                      onClick={() => handleLogoutDevice(session.id)}
                                      title="Cerrar sesión en este dispositivo"
                                    >
                                      {isLoggingOut ? "..." : "Cerrar"}
                                    </Button>
                                  </div>
                                </div>
                                {copiedSessionId === session.id && (
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                                    Copiado al portapapeles
                                  </p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {sessions.length === 0 && (
                    <Alert>
                      <AlertDescription>No hay sesiones activas registradas</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de cambio de contraseña */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Cambiar Contraseña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {passwordError && (
              <Alert variant="destructive">
                <AlertDescription>{passwordError}</AlertDescription>
              </Alert>
            )}

            {passwordSuccess && (
              <Alert className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{passwordSuccess}</AlertDescription>
              </Alert>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Contraseña Actual</label>
              <Input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                disabled={isSubmittingPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
              <Input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                disabled={isSubmittingPassword}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                disabled={isSubmittingPassword}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleChangePassword}
                disabled={isSubmittingPassword}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                {isSubmittingPassword ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                onClick={() => setShowPasswordDialog(false)}
                variant="outline"
                className="flex-1"
                disabled={isSubmittingPassword}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
