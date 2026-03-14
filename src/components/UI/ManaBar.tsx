interface ManaBarProps {
  current: number
  max: number
}

export function ManaBar({ current, max }: ManaBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, i) => (
        <div
          key={i}
          className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
            i < current
              ? 'bg-blue-500 border-blue-400 shadow-[0_0_6px_rgba(59,130,246,0.5)]'
              : 'bg-gray-800 border-gray-600'
          }`}
        />
      ))}
      <span className="text-sm text-blue-400 ml-1 font-mono">{current}/{max}</span>
    </div>
  )
}
