interface HPBarProps {
  current: number
  max: number
  size?: 'sm' | 'md'
}

export function HPBar({ current, max, size = 'md' }: HPBarProps) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100))
  const color = pct > 60 ? 'bg-green-500' : pct > 30 ? 'bg-yellow-500' : 'bg-red-500'
  const h = size === 'sm' ? 'h-2' : 'h-3'

  return (
    <div className="w-full">
      <div className={`w-full ${h} bg-gray-700 rounded-full overflow-hidden`}>
        <div
          className={`${h} ${color} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`text-center ${size === 'sm' ? 'text-xs' : 'text-sm'} text-gray-400 mt-0.5`}>
        {current}/{max}
      </div>
    </div>
  )
}
