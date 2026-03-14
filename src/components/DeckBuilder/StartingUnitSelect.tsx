import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore.ts'
import { WORKERS_BY_ID } from '../../data/workers.ts'
import { createUnitState } from '../../engine/GameState.ts'
import type { GigWorker } from '../../types/index.ts'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

function LeadCard({ worker, isSelected, onClick, index }: {
  worker: GigWorker
  isSelected: boolean
  onClick: () => void
  index: number
}) {
  const [hovered, setHovered] = useState(false)
  const color = COMPANY_ACCENT[worker.company] ?? '#666'
  const unit = createUnitState(worker)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-shadow duration-300 w-full sm:w-[280px]"
      style={{
        background: '#12161e',
        border: isSelected ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.06)',
        boxShadow: isSelected
          ? `0 0 40px ${color}50, 0 8px 32px rgba(0,0,0,0.5)`
          : hovered
            ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}15`
            : '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Selection glow */}
      {isSelected && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, ${color}18, transparent 70%)` }}
        />
      )}

      {/* Card Art */}
      <div className="relative h-44 sm:h-56 overflow-hidden">
        <img
          src={`/art/workers/${worker.id}.webp`}
          alt={worker.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const f = e.currentTarget.nextElementSibling as HTMLElement
            if (f) f.style.display = 'flex'
          }}
        />
        <div className="hidden items-center justify-center w-full h-full bg-gray-900 text-6xl">
          {worker.emoji}
        </div>

        {/* Art fade */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#12161e] to-transparent" />

        {/* Tier stars */}
        <div className="absolute top-3 left-3 flex gap-0.5">
          {Array.from({ length: worker.tier }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-sm" style={{ filter: 'drop-shadow(0 0 3px rgba(250,204,21,0.6))' }}>★</span>
          ))}
        </div>

        {/* Selected check */}
        {isSelected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: color, color: '#000' }}
          >
            ✓
          </motion.div>
        )}

        {/* HP badge */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-red-400 text-xs">♥</span>
          <span className="text-white text-sm font-bold">{worker.hp}</span>
        </div>

        {/* ATK badge */}
        <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-orange-400 text-xs">⚔</span>
          <span className="text-white text-sm font-bold">{worker.attack}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="relative z-10 px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <h3
          className="text-base sm:text-lg font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: isSelected ? color : '#e8e6e3' }}
        >
          {worker.name}
        </h3>

        <p className="text-[11px] sm:text-xs text-gray-500 italic mt-0.5 line-clamp-2 leading-tight">
          "{worker.flavourText}"
        </p>

        <div className="h-px my-2.5" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />

        {/* Abilities */}
        <div className="space-y-2">
          {worker.abilities.map((ability, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div
                className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold mt-0.5"
                style={{
                  background: i === 0 ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  boxShadow: i === 0 ? '0 0 6px rgba(37,99,235,0.4)' : '0 0 6px rgba(124,58,237,0.4)',
                  color: 'white',
                }}
              >
                {ability.manaCost}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs sm:text-sm font-bold text-gray-200">{ability.name}</div>
                <div className="text-[10px] sm:text-[11px] text-gray-500 leading-snug">{ability.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export function StartingUnitSelect() {
  const playerWorkerIds = useGameStore((s) => s.playerWorkerIds)
  const playerStartingUnit = useGameStore((s) => s.playerStartingUnit)
  const playerCompany = useGameStore((s) => s.playerCompany)
  const setPlayerStartingUnit = useGameStore((s) => s.setPlayerStartingUnit)
  const startGame = useGameStore((s) => s.startGame)
  const setScreen = useGameStore((s) => s.setScreen)

  const color = playerCompany ? (COMPANY_ACCENT[playerCompany] ?? '#888') : '#888'
  const isReady = playerStartingUnit !== null

  return (
    <div
      className="h-[100dvh] flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center top, #141a24 0%, #0a0e14 60%)' }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 text-center px-4 pt-6 sm:pt-10 pb-4"
      >
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Choose Your Lead
        </h1>
        <p className="text-gray-500 text-sm tracking-wide">
          Which worker starts in the active slot?
        </p>
      </motion.div>

      {/* Cards - scrollable on mobile */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 flex items-start sm:items-center justify-center" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 w-full sm:w-auto py-4">
          {playerWorkerIds.map((id, index) => {
            const worker = WORKERS_BY_ID[id]!
            return (
              <LeadCard
                key={id}
                worker={worker}
                isSelected={playerStartingUnit === index}
                onClick={() => setPlayerStartingUnit(index)}
                index={index}
              />
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex-shrink-0 px-5 py-3 sm:py-4 border-t flex justify-center gap-3"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,20,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <button
          onClick={() => setScreen('deck-build')}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="text-xs">←</span> Back
        </button>

        <motion.button
          whileHover={isReady ? { scale: 1.05 } : undefined}
          whileTap={isReady ? { scale: 0.97 } : undefined}
          onClick={startGame}
          disabled={!isReady}
          className="relative px-10 py-3 rounded-xl font-bold text-lg tracking-wide overflow-hidden transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            background: isReady ? 'linear-gradient(135deg, #dc2626, #b91c1c)' : '#1a1e28',
            color: isReady ? '#fff' : '#444',
            boxShadow: isReady ? '0 0 30px rgba(220,38,38,0.3), 0 4px 16px rgba(0,0,0,0.4)' : 'none',
          }}
        >
          BATTLE!
        </motion.button>
      </motion.div>
    </div>
  )
}
