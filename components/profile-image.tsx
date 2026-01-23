"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { API_BASE_URL, apiClient } from "@/lib/api-client"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { User } from "@/lib/types"

type ProfileImageProps = {
  user?: User | null
  alt?: string
  className?: string
  containerClassName?: string
  overlayClassName?: string
  fallbackSrc?: string
  showLoader?: boolean
  children?: ReactNode
}

type UseProfileImageResult = {
  src: string | null
  isLoading: boolean
}

export const useProfileImage = (user?: User | null): UseProfileImageResult => {
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isLoadingProfileImage, setIsLoadingProfileImage] = useState(false)

  useEffect(() => {
    let objectUrl: string | null = null
    let isActive = true

    const loadProfileImage = async () => {
      setIsLoadingProfileImage(true)
      const imageUrl = user?.imageUrl
      try {
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
            if (isActive) setProfileImage(imageUrl)
            return
          }
          try {
            const blob = await apiClient.profile.fetchImage(imageUrl)
            if (!isActive) return
            if (blob) {
              objectUrl = URL.createObjectURL(blob)
              setProfileImage(objectUrl)
            } else {
              setProfileImage(null)
            }
            return
          } catch (err) {
            console.error("[v0] No se pudo obtener la foto de perfil:", err)
          }
        }

        if (user?.fotoPerfil?.remotepath?.startsWith("http")) {
          if (isActive) setProfileImage(user.fotoPerfil.remotepath)
          return
        }

        if (isActive) setProfileImage(null)
      } finally {
        if (isActive) setIsLoadingProfileImage(false)
      }
    }

    loadProfileImage()

    return () => {
      isActive = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [user?.imageUrl, user?.fotoPerfil?.remotepath])

  return { src: profileImage, isLoading: isLoadingProfileImage }
}

export function ProfileImage({
  user,
  alt = "Perfil",
  className,
  containerClassName,
  overlayClassName = "rounded-lg",
  fallbackSrc = "/placeholder.svg?height=200&width=200&query=profile",
  showLoader = false,
  children,
}: ProfileImageProps) {
  const { src, isLoading } = useProfileImage(user)

  return (
    <div className={cn("relative inline-block", containerClassName)}>
      <img src={src || fallbackSrc} alt={alt} className={className} />
      {showLoader && isLoading && (
        <div className={cn("absolute inset-0 bg-background/70 flex items-center justify-center", overlayClassName)}>
          <Spinner />
        </div>
      )}
      {children}
    </div>
  )
}
