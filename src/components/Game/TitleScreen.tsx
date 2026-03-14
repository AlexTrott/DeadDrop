import { useGameStore } from '../../store/gameStore.ts'

export function TitleScreen() {
  const setScreen = useGameStore((s) => s.setScreen)

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-6 sm:gap-8 p-4">
      <div className="text-center">
        <div className="text-6xl sm:text-8xl mb-3">💀</div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight bg-gradient-to-r from-red-500 via-yellow-500 to-red-500 bg-clip-text text-transparent">
          DEAD DROP
        </h1>
        <p className="text-base sm:text-xl text-gray-400 mt-2 sm:mt-3 max-w-md mx-auto">
          Gig Workers. Card Battles. No Mercy.
        </p>
        <p className="text-xs sm:text-sm text-gray-600 mt-1.5 italic">
          Pick your riders, build your deck, outsmart the AI.
        </p>
      </div>

      <button
        onClick={() => setScreen('team-select')}
        className="px-8 py-4 min-h-[48px] bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white text-lg sm:text-xl font-bold rounded-xl shadow-2xl hover:shadow-red-900/50 transition-all active:scale-95"
      >
        PLAY
      </button>

      <div className="text-[11px] sm:text-xs text-gray-700 max-w-sm text-center px-4">
        Pokemon-style unit swapping meets Hearthstone mana. Build a team of 3 gig workers, arm them with 15 item cards, and battle!
      </div>
    </div>
  )
}
