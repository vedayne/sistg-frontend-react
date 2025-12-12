import { AlertCircle, RefreshCcw, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

/**
 * Props for ErrorDisplay component
 * Follows Interface Segregation Principle
 */
interface ErrorDisplayProps {
  /** Error message to display */
  message: string
  /** Optional error title */
  title?: string
  /** Optional error code for debugging */
  code?: string
  /** Callback to retry the failed operation */
  onRetry?: () => void
  /** Callback to dismiss the error */
  onDismiss?: () => void
  /** Additional CSS classes */
  className?: string
  /** Display variant */
  variant?: "default" | "destructive" | "warning"
}

/**
 * Elegant error display component
 * Follows Single Responsibility Principle - only displays errors
 *
 * Features:
 * - Clear error messaging
 * - Optional retry functionality
 * - Dismissable
 * - Accessible
 * - Beautiful UI
 *
 * @example
 * <ErrorDisplay
 *   message="Failed to load users"
 *   onRetry={handleRetry}
 *   onDismiss={handleDismiss}
 * />
 */
export function ErrorDisplay({
  message,
  title = "Error",
  code,
  onRetry,
  onDismiss,
  className,
  variant = "destructive",
}: ErrorDisplayProps) {
  const variantStyles = {
    default: "border-gray-200 bg-gray-50 text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100",
    destructive: "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-900/10 dark:text-red-200",
    warning: "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-900/50 dark:bg-yellow-900/10 dark:text-yellow-200",
  }

  const iconStyles = {
    default: "text-gray-600 dark:text-gray-400",
    destructive: "text-red-600 dark:text-red-400",
    warning: "text-yellow-600 dark:text-yellow-400",
  }

  return (
    <Alert className={cn(variantStyles[variant], "relative", className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className={cn("h-5 w-5 mt-0.5 flex-shrink-0", iconStyles[variant])} />

        <div className="flex-1 space-y-1">
          <AlertTitle className="font-semibold text-base mb-1">{title}</AlertTitle>
          <AlertDescription className="text-sm leading-relaxed">{message}</AlertDescription>

          {code && (
            <p className="text-xs font-mono opacity-70 mt-2">
              Código: {code}
            </p>
          )}

          {(onRetry || onDismiss) && (
            <div className="flex items-center gap-2 mt-3">
              {onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="gap-2 h-8 text-xs"
                >
                  <RefreshCcw className="h-3 w-3" />
                  Reintentar
                </Button>
              )}

              {onDismiss && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onDismiss}
                  className="h-8 text-xs"
                >
                  Cerrar
                </Button>
              )}
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Cerrar error"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  )
}

/**
 * Inline error display for form fields or smaller spaces
 */
interface InlineErrorProps {
  message: string
  className?: string
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm text-red-600 dark:text-red-400", className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  )
}
