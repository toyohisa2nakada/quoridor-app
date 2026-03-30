/*






 画面横のボダン
 最初は、リセット、一手戻す、駒を動かせる位置をハイライト、壁の色を変える、の4つがあった。
 そのうちリセット以外はデバッグもできていなくまたあまり機能しないと思って消去した。
 そしてリセットボタン1つなら、画面下に配置できるためそこに移動した。
 
 そのような経緯から、このControlPanel.tsxは使用していない。
 
 2026.03.30





*/


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
    { label: 'やり直し', onClick: game.resetGame, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
    // リセットは対AIだとあまり機能しない。HLはプレイヤの動ける位置をハイライトするがいろいろデバッグしていないのでいったんカット、WALLは壁の色を変えるだけで意味がなくカット
    // { label: 'BACK', onClick: game.undoMove, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
    // { label: 'HL', onClick: game.toggleHighlight, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
    // { label: 'WALL', onClick: game.toggleGrayWalls, colorClass: 'bg-gray-500 hover:bg-gray-600 active:bg-gray-700' },
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
