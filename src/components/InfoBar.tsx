import { useQuoridor } from '../hooks/useQuoridor';

interface InfoBarProps {
    game: ReturnType<typeof useQuoridor>;
    scaleBase: number;
}

export default function InfoBar({ game, scaleBase }: InfoBarProps) {
    return (
        <div
            className="flex items-center justify-between border-b-[4px] border-[#948073] mt-2 mb-2 w-full gap-1"
            style={{ width: `${52 * scaleBase}px`, height: `${6 * scaleBase}px` }}
        >
            <div className="flex flex-col justify-center">
                <button
                    className="text-[#F7F2EE] bg-gray-500 hover:bg-gray-600 active:bg-gray-700 cursor-pointer rounded whitespace-nowrap shadow-sm"
                    style={{ fontSize: `${Math.max(10, 1.4 * scaleBase)}px`, padding: `${0.4 * scaleBase}px ${0.8 * scaleBase}px` }}
                    onClick={game.resetGame}
                >リセット</button>
            </div>
            <div className="flex flex-col justify-center items-center">
                <span className="text-[#534B44] font-bold tracking-widest" style={{ fontSize: `${Math.max(9, 1 * scaleBase)}px` }}>turn</span>
                <span className="text-[#534B44] font-bold leading-none" style={{ fontSize: `${Math.max(16, 2.4 * scaleBase)}px` }}>{game.state.turnNum}</span>
            </div>
            <div className="flex flex-col justify-center items-center">
                <span className="text-[#534B44] font-bold tracking-widest whitespace-nowrap" style={{ fontSize: `${Math.max(9, 1 * scaleBase)}px` }}>W残数</span>
                <span className="text-[#534B44] font-bold leading-none" style={{ fontSize: `${Math.max(16, 2.4 * scaleBase)}px` }}>{10 - game.state.n_p0_wall}</span>
            </div>
            <div className="flex flex-col justify-center items-center">
                <span className="text-[#534B44] font-bold tracking-widest whitespace-nowrap" style={{ fontSize: `${Math.max(9, 1 * scaleBase)}px` }}>B残数</span>
                <span className="text-[#534B44] font-bold leading-none" style={{ fontSize: `${Math.max(16, 2.4 * scaleBase)}px` }}>{10 - game.state.n_p1_wall}</span>
            </div>
            <div className="flex flex-col justify-center items-center gap-[2px]">
                <span className="text-[#534B44] font-bold tracking-widest leading-none" style={{ fontSize: `${Math.max(8, 1 * scaleBase)}px` }}>AI</span>
                <select
                    className="font-bold border rounded text-gray-700 bg-gray-50 outline-none cursor-pointer text-center"
                    style={{ fontSize: `${Math.max(10, 1.2 * scaleBase)}px`, padding: `0 ${0.2 * scaleBase}px` }}
                    value={game.state.aiPlayer}
                    onChange={(e) => game.setAiPlayer(e.target.value as any)}
                >
                    <option value="none">無し</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="both">Both</option>
                </select>
            </div>
        </div>
    );
}

