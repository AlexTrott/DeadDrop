import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store/gameStore.ts'
import { ALL_WORKERS, WORKERS_BY_COMPANY } from '../../data/workers.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'
import type { Company, GigWorker, WorkerTier } from '../../types/index.ts'

const COMPANIES: { key: Company; label: string; emoji: string; tagline: string }[] = [
  { key: 'DELIVEROO', label: 'Deliveroo', emoji: '🛵', tagline: 'Speed / Aggro / Poison' },
  { key: 'UBER', label: 'Uber', emoji: '🚗', tagline: 'Control / Tank / Shields' },
  { key: 'AMAZON', label: 'Amazon', emoji: '📦', tagline: 'Utility / Card Draw / Flex' },
  { key: 'JUST_EAT', label: 'Just Eat', emoji: '🍔', tagline: 'Sustain / Heal / Buffs' },
]

const TIER_INFO: Record<WorkerTier, { label: string; stars: number; description: string }> = {
  1: { label: 'Rookie', stars: 1, description: 'Reliable all-rounders' },
  2: { label: 'Veteran', stars: 2, description: 'Specialists with an edge' },
  3: { label: 'Legend', stars: 3, description: 'Game-changing powerhouses' },
}

// Brighter, more visible versions of company colours for UI accents
const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

function RosterCard({ worker, isSelected, isDisabled, onClick }: {
  worker: GigWorker
  isSelected: boolean
  isDisabled: boolean
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const color = COMPANY_ACCENT[worker.company] ?? '#666'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={!isDisabled ? { y: -8, scale: 1.03 } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      onClick={!isDisabled ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative flex-shrink-0 rounded-2xl overflow-hidden transition-shadow duration-300
        w-[260px] sm:w-[300px]
        ${!isDisabled ? 'cursor-pointer' : 'cursor-default opacity-40'}
      `}
      style={{
        background: '#12161e',
        border: isSelected ? `2px solid ${color}` : '2px solid rgba(255,255,255,0.06)',
        boxShadow: isSelected
          ? `0 0 30px ${color}40, 0 8px 32px rgba(0,0,0,0.5)`
          : hovered
            ? `0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${color}15`
            : '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      {/* Selection glow overlay */}
      {isSelected && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${color}15, transparent 70%)`,
          }}
        />
      )}

      {/* Card Art - Hero section */}
      <div className="relative h-48 sm:h-60 overflow-hidden">
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

        {/* Art fade to card body */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#12161e] to-transparent" />

        {/* Tier stars badge */}
        <div className="absolute top-3 left-3 flex gap-0.5">
          {Array.from({ length: worker.tier }).map((_, i) => (
            <span key={i} className="text-yellow-400 text-sm drop-shadow-lg" style={{ filter: 'drop-shadow(0 0 3px rgba(250,204,21,0.6))' }}>★</span>
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
        {/* Name */}
        <h3
          className="text-base sm:text-lg font-bold tracking-wide"
          style={{ fontFamily: 'var(--font-display)', color: isSelected ? color : '#e8e6e3' }}
        >
          {worker.name}
        </h3>

        {/* Flavour text */}
        <p className="text-[11px] sm:text-xs text-gray-500 italic mt-0.5 line-clamp-2 leading-tight">
          "{worker.flavourText}"
        </p>

        {/* Divider */}
        <div className="h-px my-2.5" style={{ background: `linear-gradient(90deg, transparent, ${color}30, transparent)` }} />

        {/* Abilities */}
        <div className="space-y-2">
          {worker.abilities.map((ability, i) => (
            <div key={i} className="flex items-start gap-2.5">
              {/* Mana cost gem */}
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

export function TeamSelect() {
  const playerCompany = useGameStore((s) => s.playerCompany)
  const playerWorkerIds = useGameStore((s) => s.playerWorkerIds)
  const aiCompany = useGameStore((s) => s.aiCompany)
  const selectCompany = useGameStore((s) => s.selectCompany)
  const toggleWorker = useGameStore((s) => s.toggleWorker)
  const setScreen = useGameStore((s) => s.setScreen)

  // Step 1: Pick a company
  if (!playerCompany) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6"
        style={{ background: 'radial-gradient(ellipse at center top, #141a24 0%, #0a0e14 60%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Choose Your Faction
          </h1>
          <p className="text-gray-500 text-sm tracking-widest uppercase">Each company has a unique playstyle</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5 max-w-2xl w-full">
          {COMPANIES.map(({ key, label, emoji, tagline }, idx) => {
            const color = COMPANY_ACCENT[key]!
            const workers = WORKERS_BY_COMPANY[key]!
            return (
              <motion.button
                key={key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => selectCompany(key)}
                className="group relative p-5 sm:p-6 rounded-2xl text-left transition-shadow duration-300 overflow-hidden"
                style={{
                  background: '#12161e',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                }}
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at center, ${color}12, transparent 70%)` }}
                />

                {/* Top accent line */}
                <div className="absolute top-0 left-4 right-4 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

                <div className="relative z-10">
                  <div className="text-4xl sm:text-5xl mb-3">{emoji}</div>
                  <div className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)', color }}>{label}</div>
                  <div className="text-xs text-gray-400 mt-1 tracking-wide">{tagline}</div>
                  <div className="text-[10px] text-gray-600 mt-2">{workers.length} workers</div>
                </div>

                {/* Bottom accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
                />
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  // Step 2: Pick 1 worker from each tier
  const companyWorkers = WORKERS_BY_COMPANY[playerCompany]!
  const selectedTiers = new Set(
    playerWorkerIds.map((id) => ALL_WORKERS.find((w) => w.id === id)?.tier)
  )
  const isReady = playerWorkerIds.length === 3
  const color = COMPANY_ACCENT[playerCompany]!
  const companyLabel = playerCompany.replace('_', ' ')

  return (
    <div
      className="h-[100dvh] flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center top, #141a24 0%, #0a0e14 60%)' }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <button
          onClick={() => useGameStore.setState({ playerCompany: null, playerWorkerIds: [], aiCompany: null, aiWorkerIds: [], aiDeck: [] })}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="text-xs">←</span> Back
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            <span style={{ color }}>{companyLabel}</span>
            <span className="text-gray-500 ml-2 text-lg">Roster</span>
          </h1>
          {aiCompany && (
            <p className="text-[10px] text-gray-600 mt-0.5 tracking-wider uppercase">
              vs <span className="font-semibold" style={{ color: COMPANY_ACCENT[aiCompany] }}>{aiCompany.replace('_', ' ')}</span>
            </p>
          )}
        </div>

        <div className="text-right">
          <div className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: isReady ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>
            {playerWorkerIds.length}<span className="text-gray-600 text-lg">/3</span>
          </div>
        </div>
      </motion.header>

      {/* Roster Content - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {([1, 2, 3] as WorkerTier[]).map((tier) => {
          const tierWorkers = companyWorkers.filter((w) => w.tier === tier)
          const tierInfo = TIER_INFO[tier]
          const hasPick = selectedTiers.has(tier)

          return (
            <motion.section
              key={tier}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: tier * 0.15 }}
            >
              {/* Tier Header */}
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: tierInfo.stars }).map((_, i) => (
                    <span key={i} className="text-yellow-400 text-sm" style={{ filter: 'drop-shadow(0 0 4px rgba(250,204,21,0.5))' }}>★</span>
                  ))}
                </div>
                <h2 className="text-base sm:text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                  {tierInfo.label}
                </h2>
                <span className="text-xs text-gray-600 italic hidden sm:inline">— {tierInfo.description}</span>
                {hasPick && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-auto text-xs font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full"
                    style={{ background: `${color}15`, color }}
                  >
                    Picked
                  </motion.span>
                )}
                <div className="flex-1 h-px ml-2 hidden sm:block" style={{ background: `linear-gradient(90deg, ${color}20, transparent)` }} />
              </div>

              {/* Cards Row */}
              <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5 pb-2" style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}>
                <div className="flex gap-3 sm:gap-4 py-3" style={{ minWidth: 'min-content' }}>
                  <AnimatePresence>
                    {tierWorkers.map((worker) => {
                      const isSelected = playerWorkerIds.includes(worker.id)
                      const tierAlreadyPicked = hasPick && !isSelected

                      return (
                        <RosterCard
                          key={worker.id}
                          worker={worker}
                          isSelected={isSelected}
                          isDisabled={tierAlreadyPicked}
                          onClick={() => toggleWorker(worker.id)}
                        />
                      )
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>
          )
        })}
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex-shrink-0 px-5 py-3 sm:py-4 border-t flex justify-center"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,20,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <motion.button
          whileHover={isReady ? { scale: 1.05 } : undefined}
          whileTap={isReady ? { scale: 0.97 } : undefined}
          onClick={() => setScreen('deck-build')}
          disabled={!isReady}
          className="relative px-10 py-3 rounded-xl font-bold text-base tracking-wide overflow-hidden transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            background: isReady ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#1a1e28',
            color: isReady ? (playerCompany === 'UBER' ? '#fff' : '#000') : '#444',
            boxShadow: isReady ? `0 0 30px ${color}30, 0 4px 16px rgba(0,0,0,0.4)` : 'none',
          }}
        >
          {isReady ? 'Build Your Deck →' : 'Pick 1 from each tier'}
        </motion.button>
      </motion.div>
    </div>
  )
}
