import { useState, useEffect, useRef } from 'react'
import { create } from 'zustand'

export interface LogEntry {
  id: number
  message: string
  type: 'player' | 'opponent' | 'status' | 'system' | 'emote'
  timestamp: number
}

let logId = 0

interface BattleLogStore {
  entries: LogEntry[]
  isOpen: boolean
  latestEntry: LogEntry | null
  addEntry: (message: string, type: LogEntry['type']) => void
  toggleLog: () => void
  setOpen: (open: boolean) => void
}

export const useToastStore = create<BattleLogStore>((set) => ({
  entries: [],
  isOpen: false,
  latestEntry: null,
  addEntry: (message, type) => {
    const entry: LogEntry = { id: ++logId, message, type, timestamp: Date.now() }
    set((s) => ({
      entries: [...s.entries, entry],
      latestEntry: entry,
    }))
    // Clear latest after 3s
    const currentId = entry.id
    setTimeout(() => {
      set((s) => s.latestEntry?.id === currentId ? { latestEntry: null } : {})
    }, 3000)
  },
  toggleLog: () => set((s) => ({ isOpen: !s.isOpen })),
  setOpen: (open) => set({ isOpen: open }),
  // Keep addToast as an alias for backwards compat
}))

// Backwards compat alias
;(useToastStore.getState() as any).addToast = useToastStore.getState().addEntry

const TYPE_STYLES: Record<LogEntry['type'], { bg: string; text: string; border: string }> = {
  player: { bg: 'rgba(34,197,94,0.08)', text: '#4ade80', border: 'rgba(34,197,94,0.2)' },
  opponent: { bg: 'rgba(239,68,68,0.08)', text: '#f87171', border: 'rgba(239,68,68,0.2)' },
  status: { bg: 'rgba(234,179,8,0.08)', text: '#fbbf24', border: 'rgba(234,179,8,0.2)' },
  system: { bg: 'rgba(156,163,175,0.08)', text: '#9ca3af', border: 'rgba(156,163,175,0.2)' },
  emote: { bg: 'rgba(168,85,247,0.1)', text: '#c084fc', border: 'rgba(168,85,247,0.25)' },
}

function LatestToast() {
  const latestEntry = useToastStore((s) => s.latestEntry)
  const isOpen = useToastStore((s) => s.isOpen)
  const [visible, setVisible] = useState(false)
  const [current, setCurrent] = useState<LogEntry | null>(null)

  useEffect(() => {
    if (latestEntry && !isOpen) {
      setCurrent(latestEntry)
      setVisible(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
      const timer = setTimeout(() => setVisible(false), 2500)
      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [latestEntry?.id, isOpen])

  if (!current || isOpen) return null

  const style = TYPE_STYLES[current.type]

  return (
    <div
      className={`transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
    >
      <div
        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${current.type === 'emote' ? 'italic' : ''}`}
        style={{ background: style.bg, color: style.text, border: `1px solid ${style.border}` }}
      >
        {current.message}
      </div>
    </div>
  )
}

function BattleLogPanel() {
  const entries = useToastStore((s) => s.entries)
  const isOpen = useToastStore((s) => s.isOpen)
  const setOpen = useToastStore((s) => s.setOpen)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length, isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />

      {/* Log panel */}
      <div
        className="fixed top-12 right-2 sm:right-4 z-50 w-72 sm:w-80 max-h-[60vh] rounded-xl overflow-hidden flex flex-col"
        style={{ background: '#12161eee', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <h3 className="text-xs font-bold tracking-wider uppercase text-gray-400" style={{ fontFamily: 'var(--font-display)' }}>
            Battle Log
          </h3>
          <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-400 text-sm px-1">✕</button>
        </div>

        {/* Entries */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {entries.length === 0 && (
            <div className="text-center text-gray-600 text-xs py-4 italic">No events yet</div>
          )}
          {entries.map((entry) => {
            const style = TYPE_STYLES[entry.type]
            return (
              <div
                key={entry.id}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] leading-snug ${entry.type === 'emote' ? 'italic' : ''}`}
                style={{ background: style.bg, color: style.text }}
              >
                {entry.message}
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export function ToastContainer() {
  const toggleLog = useToastStore((s) => s.toggleLog)
  const isOpen = useToastStore((s) => s.isOpen)
  const entryCount = useToastStore((s) => s.entries.length)

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggleLog}
        className="absolute top-2 right-2 z-40 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-colors"
        style={{
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
          color: isOpen ? '#e8e6e3' : '#666',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span>📜</span>
        <span className="hidden sm:inline">Log</span>
        {entryCount > 0 && (
          <span className="bg-gray-700 text-gray-300 text-[9px] px-1 rounded-full">{entryCount}</span>
        )}
      </button>

      {/* Latest toast popup (when log is closed) */}
      <div className="absolute top-2 left-2 right-14 z-40 pointer-events-none">
        <LatestToast />
      </div>

      {/* Full log panel */}
      <BattleLogPanel />
    </>
  )
}
