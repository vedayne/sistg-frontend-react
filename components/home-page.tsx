"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Globe, LogIn, ChevronLeft, ChevronRight } from "lucide-react"
import LoginForm from "./login-form"
import InteractiveMapSection from "./interactive-map-section"

const unidadesAcademicas = [
  {
    id: "CENTRAL",
    nombre: "EMI Central La Paz",
    ubicacion: "Av. Lanza entre Oburo y La Paz, Zona Muyurina",
    email: "www.emi.edu.bo / contacto@emi.edu.bo",
    telefono: "(591-2) 2432266 / 2431641 / 2435285",
    web: "www.emi.edu.bo",
  },
  {
    id: "UALP",
    nombre: "Unidad Académica La Paz (UALP)",
    ubicacion: "Av. 23 de Marzo, Zona Muyurina",
    email: "lapaz@adm.emi.edu.bo",
    telefono: "(591-2) 4531133 / 4530361",
    web: "www.emi.edu.bo",
  },
  {
    id: "UASC",
    nombre: "Unidad Académica Santa Cruz (UASC)",
    ubicacion: "Santa Cruz",
    email: "santacruz@adm.emi.edu.bo",
    telefono: "Por confirmar",
    web: "www.emi.edu.bo",
  },
  {
    id: "UACB",
    nombre: "Unidad Académica Cochabamba (UACB)",
    ubicacion: "Cochabamba",
    email: "cochabamba@adm.emi.edu.bo",
    telefono: "Por confirmar",
    web: "www.emi.edu.bo",
  },
  {
    id: "UARIB",
    nombre: "Unidad Académica Riberalta (UARIB)",
    ubicacion: "Riberalta",
    email: "riberalta@adm.emi.edu.bo",
    telefono: "Por confirmar",
    web: "www.emi.edu.bo",
  },
  {
    id: "UATROPICO",
    nombre: "Unidad Académica del Trópico",
    ubicacion: "Trópico",
    email: "tropico@adm.emi.edu.bo",
    telefono: "Por confirmar",
    web: "www.emi.edu.bo",
  },
]

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const { user } = useAuth()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const carouselImages = [
    { id: 1, title: "EMI - Excelencia Académica", query: "university engineering campus modern education", name: "sistg-01.jpg" },
    { id: 2, title: "Trabajos de Grado", query: "graduation thesis research project academic work", name: "sistg-02.jpg" },
    { id: 3, title: "Innovación Tecnológica", query: "technology innovation engineering research lab", name: "sistg-03.jpg" },
    { id: 4, title: "Formación de Ingenieros", query: "engineering education students learning technology", name: "sistg-04.jpg" },
    { id: 5, title: "Sistema SISTG", query: "management system organization digital platform", name: "sistg-05.jpg" },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  if (showLogin) {
    return <LoginForm onBackToHome={() => setShowLogin(false)} />
  }

  if (user) {
    return null // El usuario verá el dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white dark:bg-slate-900 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">
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
          </div>
          <Button
            onClick={() => setShowLogin(true)}
            variant="default"
            className="bg-primary hover:bg-primary/90 text-white flex gap-2"
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión
          </Button>
        </div>
      </header>

      <section className="relative h-96 md:h-[500px] overflow-hidden">
        <div
          className="flex transition-transform duration-1000 h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {carouselImages.map((img) => (
            <div key={img.id} className="min-w-full h-full relative">
              <img
                src={`/${img.name}?key=wxaun&height=500&width=1200&query=${encodeURIComponent(img.title)}`}
                alt={img.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <h3 className="text-2xl md:text-4xl font-bold text-white text-center">{img.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* Controles del carrusel */}
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-primary" />
        </button>
        <button
          onClick={() => setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full z-10 transition-colors"
        >
          <ChevronRight className="w-6 h-6 text-primary" />
        </button>

        {/* Indicadores */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {carouselImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImageIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentImageIndex ? "bg-white w-8" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative py-16 bg-[url('/fondo-75.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            SISTEMA PARA LA GESTIÓN DE TRABAJOS DE GRADO
          </h2>
          <p className="text-lg text-gray-200 mb-8 max-w-2xl mx-auto">
            Plataforma integral para la administración, seguimiento y evaluación de trabajos de grado en la EMI
          </p>
          <Button onClick={() => setShowLogin(true)} size="lg" className="bg-primary hover:bg-primary/90 text-white">
            Acceder al Sistema
          </Button>
        </div>
      </section>

      {/* Repositorios */}
      <section className="py-12 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-center text-3xl font-bold mb-8 text-primary">
            ENLACES A LOS REPOSITORIOS DE TRABAJOS DE GRADO
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-primary">REPOSITORIO GRADO</CardTitle>
                <CardDescription>Acceso a trabajos de grado completados</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                >
                  Ir al Repositorio
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/20 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-2xl text-primary">REPOSITORIO POSGRADO</CardTitle>
                <CardDescription>Acceso a trabajos de posgrado completados</CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-white bg-transparent"
                >
                  Ir al Repositorio
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <InteractiveMapSection />

      {/* Contacto Section */}
      {/*<section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-primary">CONTACTO</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unidadesAcademicas.map((unidad) => (
              <Card key={unidad.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base text-primary">{unidad.nombre}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                    <p>{unidad.ubicacion}</p>
                  </div>
                  <div className="flex gap-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="break-all">{unidad.email}</p>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <p>{unidad.telefono}</p>
                  </div>
                  <div className="flex gap-3">
                    <Globe className="w-5 h-5 text-primary flex-shrink-0" />
                    <p>{unidad.web}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>*/}

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="mb-2">
            &copy; 2025 EMI - Sistema de Gestión de Trabajos de Grado. Todos los derechos reservados.
          </p>
          <p className="text-sm opacity-90">Plataforma desarrollada para la Escuela Militar de Ingeniería</p>
        </div>
      </footer>
    </div>
  )
}
