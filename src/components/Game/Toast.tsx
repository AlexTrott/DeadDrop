import { useEffect, useState } from 'react'
import { create } from 'zustand'

export interface ToastMessage {
  id: number
  message: string
  type: 'player' | 'opponent' | 'status' | 'system'
}

let toastId = 0

interface ToastStore {
  toasts: ToastMessage[]
  addToast: (message: string, type: ToastMessage['type']) => void
  removeToast: (id: number) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type) => {
    const id = ++toastId
    set((s) => ({
      toasts: [...s.toasts.slice(-2), { id, message, type }],
    }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
    }, 2500)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

const TYPE_STYLES: Record<ToastMessage['type'], string> = {
  player: 'bg-green-900/90 border-green-700 text-green-200',
  opponent: 'bg-red-900/90 border-red-700 text-red-200',
  status: 'bg-yellow-900/90 border-yellow-700 text-yellow-200',
  system: 'bg-gray-800/90 border-gray-600 text-gray-200',
}

function ToastItem({ toast }: { toast: ToastMessage }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={`
        px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium shadow-lg
        transition-all duration-300
        ${TYPE_STYLES[toast.type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {toast.message}
    </div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="absolute top-2 left-2 right-2 z-40 flex flex-col gap-1.5 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
