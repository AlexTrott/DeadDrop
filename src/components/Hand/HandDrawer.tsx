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
      <div className="px-2 py-1.5 text-center text-xs text-gray-600">
        Opponent's turn...
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Backdrop when open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          relative z-30 bg-gray-900/95 border-t border-gray-700 backdrop-blur-sm
          transition-all duration-300 ease-out
          ${isOpen ? 'max-h-[50vh]' : 'max-h-10'}
          overflow-hidden
        `}
      >
        {/* Handle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-xs text-gray-400 hover:text-gray-200 transition-colors active:bg-gray-800/50"
        >
          <span className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▲</span>
          <span className="font-medium">
            Hand ({cardIds.length}){playableCount > 0 && <span className="text-green-400 ml-1">{playableCount} playable</span>}
          </span>
          <span className={`text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▲</span>
        </button>

        {/* Cards grid */}
        {isOpen && (
          <div className="px-2 pb-3 overflow-y-auto max-h-[calc(50vh-40px)]">
            {cardIds.length === 0 ? (
              <div className="text-center text-gray-600 text-xs py-4">No cards in hand</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
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
                      size="sm"
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
