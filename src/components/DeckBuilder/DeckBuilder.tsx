import { motion } from 'framer-motion'
import { useGameStore } from '../../store/gameStore.ts'
import { ALL_ITEMS } from '../../data/items.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'
import { ItemCardComponent } from '../Card/ItemCard.tsx'

const COMPANY_ACCENT: Record<string, string> = {
  DELIVEROO: '#00CCBC',
  UBER: '#8B8B8B',
  AMAZON: '#FF9900',
  JUST_EAT: '#E63329',
}

export function DeckBuilder() {
  const playerDeck = useGameStore((s) => s.playerDeck)
  const playerCompany = useGameStore((s) => s.playerCompany)
  const toggleDeckCard = useGameStore((s) => s.toggleDeckCard)
  const setScreen = useGameStore((s) => s.setScreen)

  const isReady = playerDeck.length === 15

  const countInDeck = (cardId: string) => playerDeck.filter((id) => id === cardId).length

  const companyCards = ALL_ITEMS.filter((c) => c.company === playerCompany)
  const neutralCards = ALL_ITEMS.filter((c) => !c.company)

  const companyLabel = playerCompany?.replace('_', ' ') ?? ''
  const color = playerCompany ? (COMPANY_ACCENT[playerCompany] ?? '#888') : '#888'

  const handleCardClick = (cardId: string) => {
    const count = countInDeck(cardId)
    if (count > 0 && (count >= 2 || playerDeck.length >= 15)) {
      // Remove one copy
      const idx = playerDeck.indexOf(cardId)
      if (idx !== -1) {
        const newDeck = [...playerDeck]
        newDeck.splice(idx, 1)
        useGameStore.setState({ playerDeck: newDeck })
      }
    } else {
      toggleDeckCard(cardId)
    }
  }

  return (
    <div
      className="h-[100dvh] flex flex-col"
      style={{ background: 'radial-gradient(ellipse at center top, #141a24 0%, #0a0e14 60%)' }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b"
        style={{ borderColor: 'rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setScreen('team-select')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="text-xs">←</span> Back
          </button>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Build Your Deck
          </h1>

          <div className="text-right">
            <div className="text-2xl font-black" style={{ fontFamily: 'var(--font-display)', color: isReady ? '#22c55e' : 'rgba(255,255,255,0.2)' }}>
              {playerDeck.length}<span className="text-gray-600 text-lg">/15</span>
            </div>
          </div>
        </div>

        {/* Mana curve */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2, 3, 4].map((cost) => {
            const count = playerDeck.filter((id) => {
              const card = ALL_ITEMS.find((c) => c.id === id)
              return card && card.manaCost === cost
            }).length
            return (
              <div key={cost} className="text-center">
                <div className="w-7 sm:w-8 rounded overflow-hidden relative" style={{ height: 32, background: 'rgba(255,255,255,0.04)' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t transition-all duration-300"
                    style={{
                      height: `${Math.min(100, (count / 5) * 100)}%`,
                      background: `linear-gradient(180deg, ${color}, ${color}88)`,
                    }}
                  />
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">{cost}💧</div>
              </div>
            )
          })}
        </div>
      </motion.header>

      {/* Card Grid - scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 py-4 sm:py-6 space-y-6 sm:space-y-8" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Company cards */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COMPANY_COLOURS[playerCompany!], boxShadow: `0 0 8px ${color}40` }} />
            <h2 className="text-base sm:text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
              {companyLabel} Cards
            </h2>
            <span className="text-xs text-gray-600 italic hidden sm:inline">— Themed to your company</span>
            <div className="flex-1 h-px ml-2" style={{ background: `linear-gradient(90deg, ${color}20, transparent)` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {companyCards.map((card, idx) => {
              const count = countInDeck(card.id)
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <ItemCardComponent
                    card={card}
                    onClick={() => handleCardClick(card.id)}
                    count={count > 0 ? count : undefined}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.section>

        {/* Neutral cards */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="w-3 h-3 rounded-full bg-gray-500 flex-shrink-0" style={{ boxShadow: '0 0 8px rgba(107,114,128,0.3)' }} />
            <h2 className="text-base sm:text-lg font-bold tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
              Neutral Cards
            </h2>
            <span className="text-xs text-gray-600 italic hidden sm:inline">— Available to all companies</span>
            <div className="flex-1 h-px ml-2" style={{ background: 'linear-gradient(90deg, rgba(107,114,128,0.2), transparent)' }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {neutralCards.map((card, idx) => {
              const count = countInDeck(card.id)
              return (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.03 }}
                >
                  <ItemCardComponent
                    card={card}
                    onClick={() => handleCardClick(card.id)}
                    count={count > 0 ? count : undefined}
                  />
                </motion.div>
              )
            })}
          </div>
        </motion.section>
      </div>

      {/* Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex-shrink-0 px-5 py-3 sm:py-4 border-t flex justify-center"
        style={{ borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(10,14,20,0.8)', backdropFilter: 'blur(12px)' }}
      >
        <motion.button
          whileHover={isReady ? { scale: 1.05 } : undefined}
          whileTap={isReady ? { scale: 0.97 } : undefined}
          onClick={() => setScreen('starting-unit')}
          disabled={!isReady}
          className="relative px-10 py-3 rounded-xl font-bold text-base tracking-wide overflow-hidden transition-all"
          style={{
            fontFamily: 'var(--font-display)',
            background: isReady ? `linear-gradient(135deg, ${color}, ${color}cc)` : '#1a1e28',
            color: isReady ? (playerCompany === 'UBER' ? '#fff' : '#000') : '#444',
            boxShadow: isReady ? `0 0 30px ${color}30, 0 4px 16px rgba(0,0,0,0.4)` : 'none',
          }}
        >
          {isReady ? 'Choose Starting Unit →' : `Need ${15 - playerDeck.length} more card${15 - playerDeck.length !== 1 ? 's' : ''}`}
        </motion.button>
      </motion.div>
    </div>
  )
}
