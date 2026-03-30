import { useQuoridor } from '../hooks/useQuoridor';

interface InfoBarProps {
    game: ReturnType<typeof useQuoridor>;
    scaleBase: number;
}

export default function InfoBar({ game, scaleBase }: InfoBarProps) {
    return (
        <div
            className="relative flex items-center border-b-[4px] border-[#948073] mt-2"
            style={{ width: `${52 * scaleBase}px`, height: `${5 * scaleBase}px` }}
        >
            <div className="w-1/4 text-center flex flex-col justify-center">
                <span className="text-[#534B44] font-bold text-sm tracking-widest">turn</span>
                <span className="text-[#534B44] font-bold text-2xl">{game.state.turnNum}</span>
            </div>
            <div className="w-1/4 text-center flex flex-col justify-center">
                <span className="text-[#534B44] font-bold text-sm tracking-widest">white 板 残数</span>
                <span className="text-[#534B44] font-bold text-2xl">{10 - game.state.n_p0_wall}</span>
            </div>
            <div className="w-1/4 text-center flex flex-col justify-center">
                <span className="text-[#534B44] font-bold text-sm tracking-widest">black 板 残数</span>
                <span className="text-[#534B44] font-bold text-2xl">{10 - game.state.n_p1_wall}</span>
            </div>
            <div className="w-1/4 text-center flex flex-col justify-center items-center gap-1">
                <span className="text-[#534B44] font-bold text-xs tracking-widest leading-none">AI</span>
                <select
                    className="text-xs font-bold border rounded px-1 text-gray-700 bg-gray-50 outline-none cursor-pointer text-center"
                    value={game.state.aiPlayer}
                    onChange={(e) => game.setAiPlayer(e.target.value as any)}
                >
                    <option value="none">None</option>
                    <option value="white">White</option>
                    <option value="black">Black</option>
                    <option value="both">Both</option>
                </select>
            </div>
        </div>
    );
}

