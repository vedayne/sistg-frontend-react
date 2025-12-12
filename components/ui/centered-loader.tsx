"use client"

import { Spinner } from "./spinner"
import { cn } from "@/lib/utils"

type CenteredLoaderProps = {
  label?: string
  className?: string
}

export function CenteredLoader({ label = "Cargando...", className }: CenteredLoaderProps) {
  return (
    <div className={cn("flex w-full h-full min-h-[220px] items-center justify-center", className)}>
      <div className="inline-flex items-center gap-3 rounded-xl border bg-card/70 px-4 py-3 shadow-sm">
        <div className="p-2 rounded-full bg-primary/10">
          <Spinner className="size-5 text-primary" />
        </div>
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}
