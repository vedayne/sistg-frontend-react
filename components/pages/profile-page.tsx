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
import { Camera, Lock, LogOut, Smartphone, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfilePage() {
  const {
    user,
    loading,
    updatePassword,
    fetchSessions,
    logoutAllDevices,
    logoutDevice,
    uploadProfileImage,
    sessions,
  } = useAuth()
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [activeTab, setActiveTab] = useState<"perfil" | "sesiones">("perfil")
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
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

  useEffect(() => {
    if (activeTab === "sesiones") {
      fetchSessions()
    }
  }, [activeTab, fetchSessions])

  const handleLogoutAllDevices = async () => {
    if (confirm("¿Estás seguro de que quieres cerrar todas las sesiones en otros dispositivos?")) {
      setIsLoggingOut(true)
      try {
        await logoutAllDevices()
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsUploadingImage(true)
    setUploadMessage("")
    try {
      const result = await uploadProfileImage(file)
      setProfileImage(result.archivo.remotepath || URL.createObjectURL(file))
      setUploadMessage("Foto de perfil actualizada")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir la imagen"
      setUploadMessage(message)
    } finally {
      setIsUploadingImage(false)
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

  const currentSession = (() => {
    if (!sessions.length) return null
    const currentUA = typeof window !== "undefined" ? window.navigator.userAgent : ""
    const exactMatch = currentUA ? sessions.find((s) => s.userAgent === currentUA) : null
    return exactMatch || sessions[0]
  })()
  const otherSessions = currentSession ? sessions.filter((s) => s.id !== currentSession.id) : []

  const calculateTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime()
    const expires = new Date(expiresAt).getTime()
    const diffMs = expires - now
    if (diffMs <= 0) return "Expirada"
    const hours = Math.floor(diffMs / (1000 * 60 * 60))
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "perfil" | "sesiones")}
        className="w-full"
      >
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingImage}
                    />
                  </label>
                </div>
                {uploadMessage && <p className="text-xs text-green-600 dark:text-green-400">{uploadMessage}</p>}
                {isUploadingImage && <p className="text-xs text-muted-foreground">Subiendo foto...</p>}
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
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Carnet de Identidad</label>
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
                    {/* <p className="font-medium text-foreground">{user.persona?.grado || "N/A"}</p> */}
                    {user.persona?.fuerza === "Militar" ? "Militar" : "Civil"}
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
                    Código SAGA
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Sesiones Activas</h1>
              <p className="text-muted-foreground">Gestiona tus sesiones en diferentes dispositivos</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchSessions} className="bg-secondary/10 border-secondary/30">
                Actualizar
              </Button>
              {otherSessions.length > 0 && (
                <Button
                  onClick={handleLogoutAllDevices}
                  disabled={isLoggingOut}
                  variant="destructive"
                  className="flex gap-2 items-center"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Cerrando..." : "Cerrar otras sesiones"}
                </Button>
              )}
            </div>
          </div>

          {sessions.length === 0 ? (
            <Alert>
              <AlertDescription>No hay sesiones activas registradas</AlertDescription>
            </Alert>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="border-primary/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <Smartphone className="w-4 h-4" />
                    Sesión actual
                  </CardTitle>
                  <CardDescription>Esta es la sesión que estás usando ahora</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {currentSession ? (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-foreground">{parseUserAgent(currentSession.userAgent).browser}</p>
                          <p className="text-sm text-muted-foreground">
                            {parseUserAgent(currentSession.userAgent).os}
                          </p>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100 px-2 py-1 rounded-full">
                          Activa
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">IP: {currentSession.ip}</p>
                      <p className="text-xs text-green-700 dark:text-green-300 font-semibold">
                        Expira en {calculateTimeRemaining(currentSession.expiresAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {currentSession.id}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 ml-2 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(currentSession.id)
                            setCopiedSessionId(currentSession.id)
                            setTimeout(() => setCopiedSessionId(null), 2000)
                          }}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </p>
                      {copiedSessionId === currentSession.id && (
                        <p className="text-xs text-green-600 dark:text-green-400">Copiado al portapapeles</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No se pudo identificar la sesión activa.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-secondary/30 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Otras sesiones ({otherSessions.length})
                  </CardTitle>
                  <CardDescription>Controla el acceso desde otros dispositivos</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {otherSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Solo tienes esta sesión activa.</p>
                  ) : (
                    otherSessions.map((session) => {
                      const { browser, os } = parseUserAgent(session.userAgent)
                      const timeRemaining = calculateTimeRemaining(session.expiresAt)
                      return (
                        <div key={session.id} className="border rounded-lg p-4 space-y-2 bg-secondary/10">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-semibold text-foreground">{browser}</p>
                              <p className="text-sm text-muted-foreground">{os}</p>
                              <p className="text-xs text-muted-foreground mt-1">IP: {session.ip}</p>
                              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 font-medium">
                                Tiempo disponible: {timeRemaining}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(session.expiresAt).toLocaleDateString("es-ES", {
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
                                disabled={isLoggingOut}
                              >
                                {isLoggingOut ? "..." : "Cerrar"}
                              </Button>
                            </div>
                          </div>
                          {copiedSessionId === session.id && (
                            <p className="text-xs text-green-600 dark:text-green-400">Copiado al portapapeles</p>
                          )}
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
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
