import { useQuoridor } from '../hooks/useQuoridor';

interface ControlPanelProps {
  game: ReturnType<typeof useQuoridor>;
  scaleBase: number;
}

export default function ControlPanel({ game, scaleBase }: ControlPanelProps) {
  const btnStyle = {
    width: `${8 * scaleBase}px`,
    height: `${4 * scaleBase}px`,
    fontSize: `${Math.floor((5 * scaleBase) / 3)}px`,
    borderRadius: '7% / 14%',
  };

  const buttons = [
    { label: 'BACK', onClick: game.undoMove, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
    { label: 'RESET', onClick: game.resetGame, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
    { label: 'HL', onClick: game.toggleHighlight, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
    { label: 'WALL', onClick: game.toggleGrayWalls, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
  ];

  return (
    <div
      className="flex flex-col gap-4 sticky top-0"
    >
      {buttons.map((btn, i) => (
        <button
          key={i}
          className={`${btn.colorClass} text-[#F7F2EE] font-bold border-none outline-none cursor-pointer text-center shadow whitespace-nowrap`}
          style={btnStyle}
          onClick={btn.onClick}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
