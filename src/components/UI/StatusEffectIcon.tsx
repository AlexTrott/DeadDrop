import type { StatusEffect } from '../../types/index.ts'

const EFFECT_DISPLAY: Record<string, { icon: string; color: string }> = {
  POISON: { icon: '🟢', color: 'text-green-400' },
  SHIELD: { icon: '🛡️', color: 'text-blue-300' },
  BOOST: { icon: '⬆️', color: 'text-orange-400' },
  SLOW: { icon: '🐌', color: 'text-purple-400' },
}

interface StatusEffectIconProps {
  effect: StatusEffect
}

export function StatusEffectIcon({ effect }: StatusEffectIconProps) {
  const display = EFFECT_DISPLAY[effect.type] ?? { icon: '?', color: 'text-gray-400' }

  return (
    <div className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-gray-800/80 text-xs ${display.color}`}>
      <span>{display.icon}</span>
      <span className="font-mono">
        {effect.potency}
        {effect.duration !== null && <span className="text-gray-500">/{effect.duration}t</span>}
      </span>
    </div>
  )
}
