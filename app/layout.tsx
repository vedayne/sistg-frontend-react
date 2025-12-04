import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

/* Importar Montserrat como tipografía principal corporativa EMI */
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
})
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SISTG - Escuela Militar de Ingeniería",
  description: "Sistema de gestión de trabajos de grado - EMI",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/emi-logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/emi-logo-dark.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/emi-logo.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/emi-apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${montserrat.variable} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
