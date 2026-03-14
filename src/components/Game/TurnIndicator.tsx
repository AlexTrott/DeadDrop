interface TurnIndicatorProps {
  turnNumber: number
  isPlayerTurn: boolean
  isAIThinking: boolean
}

export function TurnIndicator({ turnNumber, isPlayerTurn, isAIThinking }: TurnIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-2">
      <span className="text-gray-500 text-sm font-mono">Turn {turnNumber}</span>
      <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
        isPlayerTurn
          ? 'bg-green-900/60 text-green-300 border border-green-700'
          : 'bg-red-900/60 text-red-300 border border-red-700'
      }`}>
        {isAIThinking ? '🤖 AI thinking...' : isPlayerTurn ? '🎯 Your turn' : '⏳ Opponent\'s turn'}
      </div>
    </div>
  )
}
