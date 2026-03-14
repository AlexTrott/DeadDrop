import { ITEMS_BY_ID } from '../../data/items.ts'
import { ItemCardComponent } from '../Card/ItemCard.tsx'

interface HandProps {
  cardIds: string[]
  onPlayCard?: (cardId: string) => void
  canPlay?: (cardId: string) => boolean
}

export function Hand({ cardIds, onPlayCard, canPlay }: HandProps) {
  if (cardIds.length === 0) {
    return (
      <div className="text-center text-gray-600 text-sm py-4">
        No cards in hand
      </div>
    )
  }

  return (
    <div className="flex gap-2 justify-center flex-wrap py-2">
      {cardIds.map((cardId, i) => {
        const card = ITEMS_BY_ID[cardId]
        if (!card) return null
        const playable = canPlay ? canPlay(cardId) : false
        return (
          <ItemCardComponent
            key={`${cardId}-${i}`}
            card={card}
            onClick={playable ? () => onPlayCard?.(cardId) : undefined}
            disabled={!playable}
          />
        )
      })}
    </div>
  )
}
