import './index.css'
import { useGameStore } from './store/gameStore.ts'
import { TitleScreen } from './components/Game/TitleScreen.tsx'
import { TeamSelect } from './components/DeckBuilder/TeamSelect.tsx'
import { DeckBuilder } from './components/DeckBuilder/DeckBuilder.tsx'
import { GameBoard } from './components/Game/GameBoard.tsx'
import { GameOverScreen } from './components/Game/GameOverScreen.tsx'

function App() {
  const screen = useGameStore((s) => s.screen)

  switch (screen) {
    case 'title':
      return <TitleScreen />
    case 'team-select':
      return <TeamSelect />
    case 'deck-build':
      return <DeckBuilder />
    case 'game':
      return <GameBoard />
    case 'game-over':
      return <GameOverScreen />
    default:
      return <TitleScreen />
  }
}

export default App
