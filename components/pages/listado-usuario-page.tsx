"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Mail, Lock } from "lucide-react"

const USUARIOS_DATA = [
  {
    id: 1,
    nombre: "Narváez Tamayo",
    apellido: "Julio Cesar",
    usuario: "julio.narvaez@emi.edu.bo",
    foto: "/diverse-avatars.png",
    rol: "DOCENTE_TG",
    unidadAcademica: "EMI Central",
    correoPersonal: "julio.narvaez@gmail.com",
    correoInstitucional: "julio.narvaez@emi.edu.bo",
    carnet: "12345678",
    externo: "No",
  },
  {
    id: 2,
    nombre: "López",
    apellido: "María",
    usuario: "maria.lopez@emi.edu.bo",
    foto: "/diverse-avatars.png",
    rol: "SECRETARIA",
    unidadAcademica: "UALP",
    correoPersonal: "maria.lopez@gmail.com",
    correoInstitucional: "maria.lopez@emi.edu.bo",
    carnet: "87654321",
    externo: "No",
  },
  {
    id: 3,
    nombre: "García",
    apellido: "Ana",
    usuario: "ana.garcia@emi.edu.bo",
    foto: "/diverse-avatars.png",
    rol: "ADMINISTRADOR",
    unidadAcademica: "EMI Central",
    correoPersonal: "ana.garcia@gmail.com",
    correoInstitucional: "ana.garcia@emi.edu.bo",
    carnet: "11223344",
    externo: "No",
  },
  {
    id: 4,
    nombre: "Pérez",
    apellido: "Juan",
    usuario: "juan.perez@emi.edu.bo",
    foto: "/diverse-avatars.png",
    rol: "UTIC",
    unidadAcademica: "EMI Central",
    correoPersonal: "juan.perez@gmail.com",
    correoInstitucional: "juan.perez@emi.edu.bo",
    carnet: "55667788",
    externo: "No",
  },
]

const ROLES_MAP = {
  ADMINISTRADOR: "Administrador",
  DOCENTE_TG: "Docente de TG",
  SECRETARIA: "Secretaria",
  UTIC: "UTIC",
  TUTOR: "Tutor",
  REVISOR: "Revisor",
  JEFE_CARRERA: "Jefe de Carrera",
  DDE: "DDE",
}

export default function ListadoUsuarioPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsuario, setSelectedUsuario] = useState<(typeof USUARIOS_DATA)[0] | null>(null)

  const filteredUsuarios = useMemo(() => {
    if (!searchTerm) return USUARIOS_DATA
    const term = searchTerm.toLowerCase()
    return USUARIOS_DATA.filter(
      (usuario) => usuario.nombre.toLowerCase().includes(term) || usuario.apellido.toLowerCase().includes(term),
    )
  }, [searchTerm])

  const canChangePassword = (rol: string) => {
    return ["ADMINISTRADOR", "UTIC", "DOCENTE_TG"].includes(rol)
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Listado de Usuarios</h1>
        <p className="text-muted-foreground">Directorio de usuarios del sistema</p>
      </div>

      {/* Buscador */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Buscar Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Busca por nombre o apellido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Tabla de Usuarios */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 px-4 font-bold">No.</th>
                  <th className="text-left py-3 px-4 font-bold">Foto</th>
                  <th className="text-left py-3 px-4 font-bold">Usuario</th>
                  <th className="text-left py-3 px-4 font-bold">Rol</th>
                  <th className="text-left py-3 px-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsuarios.length > 0 ? (
                  filteredUsuarios.map((usuario, index) => (
                    <tr key={usuario.id} className="border-b hover:bg-secondary/50 dark:hover:bg-slate-800">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">
                        <img
                          src={usuario.foto || "/placeholder.svg"}
                          alt={usuario.nombre}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {usuario.nombre} {usuario.apellido}
                      </td>
                      <td className="py-3 px-4">
                        <Badge className="bg-primary text-primary-foreground">
                          {ROLES_MAP[usuario.rol as keyof typeof ROLES_MAP]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          size="sm"
                          onClick={() => setSelectedUsuario(usuario)}
                          className="bg-cyan-600 hover:bg-cyan-700 text-white"
                        >
                          DETALLES
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-muted-foreground">
                      No se encontraron usuarios
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalles */}
      <Dialog open={!!selectedUsuario} onOpenChange={() => setSelectedUsuario(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary">Detalles del Usuario</DialogTitle>
          </DialogHeader>
          {selectedUsuario && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={selectedUsuario.foto || "/placeholder.svg"}
                  alt={selectedUsuario.nombre}
                  className="w-20 h-20 rounded-lg object-cover"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Usuario</label>
                  <p className="font-medium">{`${selectedUsuario.nombre} ${selectedUsuario.apellido}`}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Unidad Académica</label>
                  <p className="font-medium">{selectedUsuario.unidadAcademica}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Rol</label>
                  <Badge className="bg-primary text-primary-foreground">
                    {ROLES_MAP[selectedUsuario.rol as keyof typeof ROLES_MAP]}
                  </Badge>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Personal</label>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUsuario.correoPersonal}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Correo Institucional</label>
                  <p className="font-medium text-sm flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {selectedUsuario.correoInstitucional}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Carné de Identidad</label>
                  <p className="font-medium">{selectedUsuario.carnet}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-1">Externo</label>
                  <Badge variant={selectedUsuario.externo === "Sí" ? "destructive" : "secondary"}>
                    {selectedUsuario.externo}
                  </Badge>
                </div>
              </div>

              {canChangePassword(selectedUsuario.rol) && (
                <Button
                  onClick={() => console.log("Cambiar contraseña para:", selectedUsuario.nombre)}
                  className="w-full bg-primary hover:bg-primary/90 text-white flex gap-2 mt-4"
                >
                  <Lock className="w-4 h-4" />
                  Cambiar Contraseña
                </Button>
              )}

              <Button onClick={() => setSelectedUsuario(null)} variant="outline" className="w-full mt-2">
                Cerrar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
