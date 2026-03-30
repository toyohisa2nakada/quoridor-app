import { useQuoridor } from '../hooks/useQuoridor';
import Board from './Board';
import ControlPanel from './ControlPanel';
import InfoBar from './InfoBar';

export default function QuoridorGame() {
  const game = useQuoridor();

  // Basic scaling factor `bs` (e.g., bs = 10px -> total width = 520px)
  const scaleBase = 10;

  return (
    <div className="flex bg-white shadow-xl rounded-lg p-6 flex-col md:flex-row gap-6 items-start">
      <div className="flex flex-col relative w-max">
        {game.state.winner !== null && (
          <div className="absolute top-0 left-0 w-full z-50 p-4 text-center bg-green-100 text-green-800 font-bold rounded-lg mb-4 shadow-md">
            Player {game.state.winner === 0 ? 'White' : 'Black'} Wins!
          </div>
        )}
        <div
          className="relative select-none"
          style={{ width: `${52 * scaleBase}px`, height: `${52 * scaleBase}px` }}
        >
          <Board game={game} scaleBase={scaleBase} />
        </div>

        {/* InfoBar */}
        <InfoBar game={game} scaleBase={scaleBase} />
      </div>

      {/* <div className="flex flex-col" style={{ width: `${12 * scaleBase}px` }}>
        <ControlPanel game={game} scaleBase={scaleBase} />
      </div> */}
    </div>
  );
}
