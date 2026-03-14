import type { CombatLogEntry } from '../../types/index.ts'
import { useEffect, useRef } from 'react'

interface CombatLogProps {
  entries: CombatLogEntry[]
}

export function CombatLog({ entries }: CombatLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length])

  const recent = entries.slice(-20)

  return (
    <div
      ref={scrollRef}
      className="h-32 overflow-y-auto bg-gray-900/60 rounded-lg border border-gray-800 p-2 text-xs font-mono"
    >
      {recent.length === 0 ? (
        <div className="text-gray-600 text-center">Game log will appear here...</div>
      ) : (
        recent.map((entry, i) => (
          <div
            key={i}
            className={`py-0.5 ${
              entry.playerId === 'player1' ? 'text-green-400' : 'text-red-400'
            }`}
          >
            <span className="text-gray-600">[T{entry.turn}]</span> {entry.message}
          </div>
        ))
      )}
    </div>
  )
}
