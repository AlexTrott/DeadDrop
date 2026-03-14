import { useState } from 'react'
import { ITEMS_BY_ID } from '../../data/items.ts'
import { ItemCardComponent } from '../Card/ItemCard.tsx'

interface HandDrawerProps {
  cardIds: string[]
  onPlayCard?: (cardId: string) => void
  canPlay?: (cardId: string) => boolean
  disabled?: boolean
}

export function HandDrawer({ cardIds, onPlayCard, canPlay, disabled }: HandDrawerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const playableCount = cardIds.filter((id) => canPlay?.(id)).length

  if (disabled) {
    return (
      <div className="px-2 py-1.5 text-center text-xs text-gray-600 italic" style={{ fontFamily: 'var(--font-body)' }}>
        Opponent's turn...
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-[2px]"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          relative z-30 transition-all duration-300 ease-out overflow-hidden
          ${isOpen ? 'max-h-[60vh]' : 'max-h-10'}
        `}
        style={{
          background: 'rgba(12,16,22,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Handle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors active:bg-white/5"
        >
          <span className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▲</span>
          <span className="font-bold tracking-wide" style={{ fontFamily: 'var(--font-body)' }}>
            Hand ({cardIds.length})
            {playableCount > 0 && <span className="text-green-400 ml-1.5 font-normal">{playableCount} playable</span>}
          </span>
          <span className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▲</span>
        </button>

        {/* Cards grid - using md size for proper card display */}
        {isOpen && (
          <div className="px-3 sm:px-4 pb-3 overflow-y-auto max-h-[calc(60vh-40px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
            {cardIds.length === 0 ? (
              <div className="text-center text-gray-600 text-xs py-6 italic">No cards in hand</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {cardIds.map((cardId, i) => {
                  const card = ITEMS_BY_ID[cardId]
                  if (!card) return null
                  const playable = canPlay ? canPlay(cardId) : false
                  return (
                    <ItemCardComponent
                      key={`${cardId}-${i}`}
                      card={card}
                      onClick={playable ? () => { onPlayCard?.(cardId); setIsOpen(false) } : undefined}
                      disabled={!playable}
                      size="md"
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
