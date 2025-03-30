"use client"

import type React from "react"

import { useState, useCallback } from "react"

export type ToastProps = {
  id?: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = useCallback(({ ...props }: ToastProps) => {
    const id = props.id || String(Date.now())

    setToasts((prevToasts) => [...prevToasts, { ...props, id }])

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
    }, 3000)

    return {
      id,
      dismiss: () => setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id)),
    }
  }, [])

  const dismiss = useCallback((toastId?: string) => {
    setToasts((prevToasts) => (toastId ? prevToasts.filter((toast) => toast.id !== toastId) : []))
  }, [])

  return {
    toast,
    toasts,
    dismiss,
  }
}

