"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, API_BASE_URL } from "@/lib/api-client"
import type { Semester } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { Camera, Lock, LogOut, Smartphone, Copy } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfilePage() {
  const {
    user,
    loading,
    updatePassword,
    fetchSessions,
    logoutAllDevices,
    logoutDevice,
    uploadProfileImage,
    refreshProfile,
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
  const [isFetchingSessions, setIsFetchingSessions] = useState(false)
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [semestres, setSemestres] = useState<Semester[]>([])
  const [selectedSemestreId, setSelectedSemestreId] = useState("")
  const [isLoadingSemestres, setIsLoadingSemestres] = useState(false)
  const [isUpdatingSemestre, setIsUpdatingSemestre] = useState(false)
  const [semestreMessage, setSemestreMessage] = useState("")
  const [semestreError, setSemestreError] = useState("")
  const isStudent = Boolean(user?.academico?.codAlumno)

  useEffect(() => {
    let objectUrl: string | null = null

    const loadProfileImage = async () => {
      const imageUrl = user?.imageUrl
      if (imageUrl) {
        const isAbsolute = imageUrl.startsWith("http://") || imageUrl.startsWith("https://")
        let shouldFetch = !isAbsolute
        if (isAbsolute) {
          try {
            const apiOrigin = new URL(API_BASE_URL).origin
            const imageOrigin = new URL(imageUrl).origin
            shouldFetch = apiOrigin === imageOrigin
          } catch {
            shouldFetch = false
          }
        }
        if (!shouldFetch) {
          setProfileImage(imageUrl)
          return
        }
        try {
          const blob = await apiClient.profile.fetchImage(imageUrl)
          if (blob) {
            objectUrl = URL.createObjectURL(blob)
            setProfileImage(objectUrl)
          }
          return
        } catch (err) {
          console.error("[v0] No se pudo obtener la foto de perfil:", err)
        }
      }

      if (user?.fotoPerfil?.remotepath?.startsWith("http")) {
        setProfileImage(user.fotoPerfil.remotepath)
        return
      }

      setProfileImage(null)
    }

    loadProfileImage()

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [user?.imageUrl, user?.fotoPerfil?.remotepath])

  useEffect(() => {
    if (!user || !isStudent) return

    let isActive = true

    const loadSemestres = async () => {
      try {
        setIsLoadingSemestres(true)
        const res = await apiClient.semesters.list()
        const data = Array.isArray(res) ? res : (res as any).data || []
        if (isActive) {
          setSemestres(data)
        }
      } catch (err) {
        if (isActive) {
          const message = err instanceof Error ? err.message : "No se pudieron cargar los semestres"
          setSemestreError(message)
        }
      } finally {
        if (isActive) setIsLoadingSemestres(false)
      }
    }

    loadSemestres()

    return () => {
      isActive = false
    }
  }, [user, isStudent])

  useEffect(() => {
    if (!user || !isStudent) return

    const semestre = user.academico?.semestreActual
    if (typeof semestre === "object" && semestre?.id) {
      setSelectedSemestreId(String(semestre.id))
    } else if (semestre === null || semestre === undefined) {
      setSelectedSemestreId("")
    }
  }, [user, isStudent, user?.academico?.semestreActual])

  useEffect(() => {
    if (activeTab === "sesiones") {
      fetchSessionsWithLoading()
    }
  }, [activeTab])

  const fetchSessionsWithLoading = async () => {
    setIsFetchingSessions(true)
    try {
      await fetchSessions()
    } finally {
      setIsFetchingSessions(false)
    }
  }

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
      await uploadProfileImage(file)
      setUploadMessage("Foto de perfil actualizada")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo subir la imagen"
      setUploadMessage(message)
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleUpdateSemestre = async () => {
    if (!selectedSemestreId) {
      setSemestreError("Selecciona un semestre válido")
      setSemestreMessage("")
      return
    }

    setSemestreError("")
    setSemestreMessage("")
    setIsUpdatingSemestre(true)

    try {
      await apiClient.profile.updateSemester(Number(selectedSemestreId))
      await refreshProfile()
      setSemestreMessage("Semestre actualizado correctamente")
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo actualizar el semestre"
      setSemestreError(message)
    } finally {
      setIsUpdatingSemestre(false)
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

  const userType: "estudiante" | "docente" | "administrativo" =
    user.academico?.codAlumno ? "estudiante" : user.academico?.codDocente ? "docente" : "administrativo"
  const userTypeLabel = userType === "docente" ? "Docente" : userType === "administrativo" ? "Administrativo" : "Estudiante"
  const roles = user.roles?.map((r) => r.name).join(", ") || userTypeLabel
  const fuerzaLabel = user.persona?.fuerza ? (user.persona.fuerza === "Militar" ? "Militar" : "Civil") : "N/A"
  const semestreActual = (() => {
    const semestre = user.academico?.semestreActual
    if (typeof semestre === "string" || semestre === null || semestre === undefined) return semestre
    return semestre.name || semestre.code
  })()
  const semestreActualId = (() => {
    const semestre = user.academico?.semestreActual
    if (typeof semestre === "object" && semestre?.id) return String(semestre.id)
    return ""
  })()

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
  const otherSessions = currentSession ? sessions.filter((s) => s.id !== currentSession.id).slice(0, 5) : []

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
    <div className="min-h-screen bg-background p-6 max-w-6xl mx-auto space-y-6">
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
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo de Usuario</label>
                    <p className="font-medium text-foreground">{userTypeLabel}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Carnet de Identidad</label>
                    <p className="font-medium text-foreground">{user.persona?.ci || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Grado</label>
                    <p className="font-medium text-foreground">{user.persona?.grado || user.academico?.grado || "N/A"}</p>
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
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Fuerza / Condición
                    </label>
                    <p className="font-medium text-foreground">{fuerzaLabel}</p>
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
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Tipo</label>
                  <p className="font-medium text-foreground">{userTypeLabel}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">
                    {userType === "docente" ? "Código Docente" : "Código SAGA"}
                  </label>
                  <p className="font-medium text-foreground">
                    {userType === "docente"
                      ? user.academico?.codDocente || user.academico?.idSaga || "N/A"
                      : user.academico?.codAlumno || user.academico?.idSaga || "N/A"}
                  </p>
                </div>
                {userType === "estudiante" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-muted-foreground">Semestre Actual</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={selectedSemestreId}
                        onValueChange={(value) => {
                          setSelectedSemestreId(value)
                          setSemestreError("")
                          setSemestreMessage("")
                        }}
                        disabled={isLoadingSemestres || isUpdatingSemestre}
                      >
                        <SelectTrigger className="w-full sm:w-52">
                          <SelectValue
                            placeholder={isLoadingSemestres ? "Cargando..." : semestreActual || "Selecciona semestre"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {semestres.length > 0 ? (
                            semestres.map((sem) => (
                              <SelectItem key={sem.id} value={String(sem.id)}>
                                {sem.name} ({sem.code})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="empty" disabled>
                              Sin semestres
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleUpdateSemestre}
                        disabled={
                          isUpdatingSemestre ||
                          !selectedSemestreId ||
                          selectedSemestreId === semestreActualId
                        }
                      >
                        {isUpdatingSemestre ? "Guardando..." : "Guardar"}
                      </Button>
                    </div>
                    {semestreMessage && <p className="text-xs text-green-600 dark:text-green-400">{semestreMessage}</p>}
                    {semestreError && <p className="text-xs text-red-600 dark:text-red-400">{semestreError}</p>}
                  </div>
                )}
                {userType === "docente" && (
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">Profesión</label>
                    <p className="font-medium text-foreground">{user.academico?.profesion || "N/A"}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Roles</label>
                  <p className="font-medium text-foreground text-sm">{roles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sesiones" className="space-y-6">
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-1">Sesiones Activas</h1>
              <p className="text-muted-foreground">Gestiona tus sesiones en diferentes dispositivos</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={fetchSessionsWithLoading}
                disabled={isFetchingSessions}
                className="bg-secondary/10 border-secondary/30 flex-1 md:flex-none"
              >
                {isFetchingSessions ? "Actualizando..." : "Actualizar"}
              </Button>
              {otherSessions.length > 0 && (
                <Button
                  onClick={handleLogoutAllDevices}
                  disabled={isLoggingOut || isFetchingSessions}
                  variant="destructive"
                  className="flex gap-2 items-center flex-1 md:flex-none"
                >
                  <LogOut className="w-4 h-4" />
                  {isLoggingOut ? "Cerrando..." : "Cerrar otras"}
                </Button>
              )}
            </div>
          </div>

          {isFetchingSessions ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="text-muted-foreground">Cargando sesiones...</p>
              </div>
            </div>
          ) : sessions.length === 0 ? (
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
                          <p className="font-semibold text-foreground">
                            {parseUserAgent(currentSession.userAgent).browser}
                          </p>
                          <p className="text-sm text-muted-foreground">{parseUserAgent(currentSession.userAgent).os}</p>
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
                  ) : null}
                </CardContent>
              </Card>

              {otherSessions.length > 0 && (
                <Card className="border-orange-200/50 dark:border-orange-900/30 shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                      <LogOut className="w-4 h-4" />
                      Otras sesiones ({otherSessions.length}
                      {sessions.length - otherSessions.length - 1 > 0 ? ` de ${sessions.length - 1}` : ""})
                    </CardTitle>
                    <CardDescription>Controla el acceso desde otros dispositivos (mostrando hasta 5)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {otherSessions.map((session) => {
                      const { browser, os } = parseUserAgent(session.userAgent)
                      const timeRemaining = calculateTimeRemaining(session.expiresAt)
                      return (
                        <div
                          key={session.id}
                          className="border rounded-lg p-4 space-y-2 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{browser}</p>
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
                            <div className="flex flex-col gap-2 flex-shrink-0">
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
                    })}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {showPasswordDialog && (
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary">Cambiar Contraseña</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {passwordError && (
                <Alert className="bg-red-50 text-red-800 border-red-200">
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}
              {passwordSuccess && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}

              {/* Contraseña Actual */}
              <div>
                <label className="block text-sm font-medium mb-2">Contraseña Actual</label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    placeholder="Ingresa tu contraseña actual"
                    value={passwordData.current}
                    onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Nueva Contraseña */}
              <div>
                <label className="block text-sm font-medium mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Ingresa tu nueva contraseña"
                    value={passwordData.new}
                    onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-sm font-medium mb-2">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirma tu nueva contraseña"
                    value={passwordData.confirm}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                    disabled={isSubmittingPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-4.803m5.596-3.856a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleChangePassword}
                  disabled={isSubmittingPassword}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isSubmittingPassword ? "Guardando..." : "Guardar"}
                </Button>
                <Button onClick={() => setShowPasswordDialog(false)} variant="outline" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
