import type { ItemCard as ItemCardType } from '../../types/index.ts'
import { COMPANY_COLOURS } from '../../engine/constants.ts'

interface ItemCardProps {
  card: ItemCardType
  onClick?: () => void
  disabled?: boolean
  count?: number
  size?: 'sm' | 'md'
}

const TYPE_BORDER: Record<string, string> = {
  HEALING: '#16a34a',
  DAMAGE: '#dc2626',
  BUFF: '#ca8a04',
  DEBUFF: '#9333ea',
  UTILITY: '#0891b2',
}

const TYPE_BG: Record<string, string> = {
  HEALING: 'rgba(22,163,74,0.15)',
  DAMAGE: 'rgba(220,38,38,0.15)',
  BUFF: 'rgba(202,138,4,0.15)',
  DEBUFF: 'rgba(147,51,234,0.15)',
  UTILITY: 'rgba(8,145,178,0.15)',
}

const TYPE_BADGE_BG: Record<string, string> = {
  HEALING: 'linear-gradient(135deg, #16a34a, #15803d)',
  DAMAGE: 'linear-gradient(135deg, #dc2626, #b91c1c)',
  BUFF: 'linear-gradient(135deg, #ca8a04, #a16207)',
  DEBUFF: 'linear-gradient(135deg, #9333ea, #7e22ce)',
  UTILITY: 'linear-gradient(135deg, #0891b2, #0e7490)',
}

export function ItemCardComponent({ card, onClick, disabled, count, size = 'md' }: ItemCardProps) {
  const borderColor = TYPE_BORDER[card.type] ?? '#666'
  const bgColor = TYPE_BG[card.type] ?? 'rgba(100,100,100,0.15)'
  const badgeBg = TYPE_BADGE_BG[card.type] ?? 'linear-gradient(135deg, #666, #555)'

  if (size === 'sm') {
    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={`
          w-full rounded-lg p-1.5 relative transition-all duration-200
          ${onClick && !disabled ? 'cursor-pointer active:scale-95 hover:shadow-lg' : ''}
          ${disabled ? 'opacity-40' : ''}
        `}
        style={{
          background: '#12161e',
          border: `1.5px solid ${borderColor}40`,
        }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
            <img
              src={`/art/items/${card.id}.webp`}
              alt={card.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
                const f = e.currentTarget.nextElementSibling as HTMLElement
                if (f) f.style.display = 'block'
              }}
            />
            <span className="text-lg hidden">{card.emoji}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] sm:text-xs font-semibold truncate">{card.name}</div>
            <div className="text-[9px] text-gray-400 truncate">{card.description}</div>
          </div>
        </div>
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-white text-[10px] flex items-center justify-center font-bold"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
        >
          {card.manaCost}
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`
        rounded-2xl overflow-hidden relative transition-all duration-200
        ${onClick && !disabled ? 'cursor-pointer hover:-translate-y-1.5 hover:shadow-xl' : ''}
        ${disabled ? 'opacity-40' : ''}
        ${count && count > 0 ? 'ring-2' : ''}
      `}
      style={{
        background: '#12161e',
        border: count && count > 0 ? `2px solid ${borderColor}` : '2px solid rgba(255,255,255,0.06)',
        boxShadow: count && count > 0
          ? `0 0 20px ${borderColor}30, 0 4px 16px rgba(0,0,0,0.4)`
          : '0 4px 16px rgba(0,0,0,0.4)',
        ringColor: borderColor,
      }}
    >
      {/* Selection glow */}
      {count && count > 0 && (
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at top, ${borderColor}15, transparent 70%)` }}
        />
      )}

      {/* Card Art — square aspect to show full artwork */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={`/art/items/${card.id}.webp`}
          alt={card.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const f = e.currentTarget.nextElementSibling as HTMLElement
            if (f) f.style.display = 'flex'
          }}
        />
        <div className="hidden items-center justify-center w-full h-full bg-gray-900 text-4xl">
          {card.emoji}
        </div>

        {/* Art fade */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#12161e] to-transparent" />

        {/* Mana cost gem */}
        <div
          className="absolute top-2 right-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 0 8px rgba(37,99,235,0.5), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        >
          {card.manaCost}
        </div>

        {/* Count badge */}
        {count !== undefined && count > 0 && (
          <div
            className="absolute top-2 left-2 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white"
            style={{
              background: borderColor,
              boxShadow: `0 0 8px ${borderColor}60`,
            }}
          >
            x{count}
          </div>
        )}

        {/* Company dot */}
        {card.company && (
          <div
            className="absolute bottom-2 left-2.5 w-3 h-3 rounded-full"
            style={{ backgroundColor: COMPANY_COLOURS[card.company], boxShadow: `0 0 6px ${COMPANY_COLOURS[card.company]}60` }}
          />
        )}
      </div>

      {/* Card Body */}
      <div className="relative z-10 px-3 pb-3 pt-0.5 sm:px-3.5 sm:pb-3.5">
        {/* Name */}
        <div className="text-xs sm:text-sm font-bold text-center" style={{ fontFamily: 'var(--font-display)' }}>
          {card.name}
        </div>

        {/* Type badge */}
        <div className="flex justify-center mt-1">
          <span
            className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
            style={{ background: badgeBg }}
          >
            {card.type}
          </span>
        </div>

        {/* Divider */}
        <div className="h-px my-1.5 sm:my-2" style={{ background: `linear-gradient(90deg, transparent, ${borderColor}30, transparent)` }} />

        {/* Description */}
        <div className="text-[10px] sm:text-[11px] text-gray-400 text-center leading-snug">
          {card.description}
        </div>
      </div>
    </div>
  )
}
