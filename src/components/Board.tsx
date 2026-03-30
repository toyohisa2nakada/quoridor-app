import { useQuoridor } from '../hooks/useQuoridor';
import clsx from 'clsx';
import { find_p_candidates } from '../game/quoridor';

interface BoardProps {
  game: ReturnType<typeof useQuoridor>;
  scaleBase: number;
}

export default function Board({ game, scaleBase }: BoardProps) {
  const { state, movePiece, placeWall } = game;
  const tMargin = Math.floor(scaleBase / 3);

  // Derive valid moves for the current player
  const p_candidates: number[] = [];
  if (state.winner === null) {
    p_candidates.push(...find_p_candidates(
        state.turn === 0 ? state.p0 : state.p1, 
        state.h_walls, 
        state.v_walls
    ));
    // Ideally jump candidates too, but let's keep it simple or implement trans_p_candidate_with_jump
    // Note: simple highlight logic might not include jumps for UI unless we fully translate it in the component
    // But let's check valid moves on click anyway.
  }

  // Generate grids (81 cells)
  const grids = Array.from({ length: 81 }).map((_, i) => {
    const row = Math.floor(i / 9);
    const col = i % 9;
    const top = 5 * scaleBase * (8 - row);
    const left = 5 * scaleBase * col;
    const isMovable = p_candidates.includes(i) && state.highlight; // Just a basic highlight
    
    // Check if UI should allow clicking
    // True game logic should handle jumps
    
    return (
      <div 
        key={`grid-${i}`}
        className="absolute rounded-[5%] bg-[#A18E80] cursor-pointer hover:bg-[#8F7D70] transition-colors"
        style={{ width: 4 * scaleBase, height: 4 * scaleBase, top, left }}
        onClick={() => {
            if (state.winner === null && state.aiPlayer !== (state.turn === 0 ? 'white' : 'black') && state.aiPlayer !== 'both') {
                movePiece(state.turn, i);
            }
        }}
      >
        {isMovable && <div className="w-full h-full bg-black/10 rounded-[5%]" />}
      </div>
    );
  });

  // Generate Horizontal Spaces
  const hSpaces = Array.from({ length: 64 }).map((_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const top = 5 * scaleBase * (7 - row) + 4 * scaleBase;
    const left = 5 * scaleBase * col;
    // Don't render hover spaces if wall already exists
    if (state.h_walls[i] || state.v_walls[i]) return null;

    return (
      <div 
        key={`hs-${i}`}
        className="absolute cursor-pointer opacity-0 hover:opacity-100 z-10 group"
        style={{ width: 4 * scaleBase, height: scaleBase, top, left }}
        onClick={() => {
            if (state.winner === null && state.aiPlayer !== (state.turn === 0 ? 'white' : 'black') && state.aiPlayer !== 'both') {
                placeWall(state.turn, 0, i);
            }
        }}
      >
        <div 
            className={clsx(
                "absolute rounded-[5%/20%] transition-colors duration-200", 
                state.turn === 0 ? "bg-[#F7F2EE]/60" : "bg-[#534B44]/60",
                state.grayWalls && "bg-[#5e564f]/60"
            )}
            style={{ width: 9 * scaleBase, height: scaleBase, top: 0, left: 0 }}
        />
      </div>
    );
  });

  // Generate Vertical Spaces
  const vSpaces = Array.from({ length: 64 }).map((_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    const top = 5 * scaleBase * (7 - row);
    const left = 5 * scaleBase * col + 4 * scaleBase;
    if (state.h_walls[i] || state.v_walls[i]) return null;

    return (
      <div 
        key={`vs-${i}`}
        className="absolute cursor-pointer opacity-0 hover:opacity-100 z-10 group"
        style={{ width: scaleBase, height: 4 * scaleBase, top, left }}
        onClick={() => {
            if (state.winner === null && state.aiPlayer !== (state.turn === 0 ? 'white' : 'black') && state.aiPlayer !== 'both') {
                placeWall(state.turn, 1, i);
            }
        }}
      >
        <div 
            className={clsx(
                "absolute rounded-[20%/5%] transition-colors duration-200", 
                state.turn === 0 ? "bg-[#F7F2EE]/60" : "bg-[#534B44]/60",
                state.grayWalls && "bg-[#5e564f]/60"
            )}
            style={{ width: scaleBase, height: 9 * scaleBase, top: 0, left: 0 }}
        />
      </div>
    );
  });

  // Render Placed Walls
  const hWallsPlaced = state.h_walls.map((val, i) => {
    if (!val) return null;
    const row = Math.floor(i / 8);
    const col = i % 8;
    const top = 5 * scaleBase * (7 - row) + 4 * scaleBase;
    const left = 5 * scaleBase * col;
    // Determine color based on who placed it ideally, 
    // but the original code assigned w/b randomly or by current turn.
    // For simplicity, let's just make it a standard wall color if gray is enabled.
    return (
        <div 
            key={`hwp-${i}`}
            className={clsx(
                "absolute rounded-[5%/20%] shadow-sm",
                state.grayWalls ? "bg-[#5E564F]" : "bg-[#D78F69]" // fallback color
            )}
            style={{ width: 9 * scaleBase, height: scaleBase, top, left }}
        />
    );
  });

  const vWallsPlaced = state.v_walls.map((val, i) => {
    if (!val) return null;
    const row = Math.floor(i / 8);
    const col = i % 8;
    const top = 5 * scaleBase * (7 - row);
    const left = 5 * scaleBase * col + 4 * scaleBase;
    return (
        <div 
            key={`vwp-${i}`}
            className={clsx(
                "absolute rounded-[20%/5%] shadow-sm",
                state.grayWalls ? "bg-[#5E564F]" : "bg-[#D78F69]"
            )}
            style={{ width: scaleBase, height: 9 * scaleBase, top, left }}
        />
    );
  });

  // Calculate coordinates for pieces
  const whiteRow = Math.floor(state.p0 / 9);
  const whiteCol = state.p0 % 9;
  const blackRow = Math.floor(state.p1 / 9);
  const blackCol = state.p1 % 9;

  return (
    <div 
      className={clsx(
          "bg-[#B0A092] absolute rounded-[5%] transition-transform duration-[1000ms] shadow-2xl",
          // The board can be flipped with inverse (missing in state maybe, let's keep it straight first)
      )}
      style={{ width: 52 * scaleBase, height: 52 * scaleBase }}
    >
      {/* Coordinates */}
      {Array.from({length: 9}).map((_, i) => (
        <div key={`cx-${i}`} className="absolute text-[#534B44] text-center font-bold" 
             style={{ width: 2*scaleBase, height: 2*scaleBase, top: 49*scaleBase, left: 5*scaleBase*i + 5*scaleBase, fontSize: 2*scaleBase }}>
          {String.fromCharCode(97 /* a */ + i)}
        </div>
      ))}
      {Array.from({length: 9}).map((_, i) => (
        <div key={`cy-${i}`} className="absolute text-[#534B44] text-center font-bold" 
             style={{ width: 2*scaleBase, height: 2*scaleBase, top: 5*scaleBase*i + 5*scaleBase, left: scaleBase, fontSize: 2*scaleBase }}>
          {9 - i}
        </div>
      ))}

      {/* Inner Game Board */}
      <div 
        className="absolute"
        style={{ width: 44 * scaleBase, height: 44 * scaleBase, top: 4 * scaleBase, left: 4 * scaleBase }}
      >
        {grids}
        {hSpaces}
        {vSpaces}
        {hWallsPlaced}
        {vWallsPlaced}

        {/* Pieces */}
        {/* White Piece */}
        <div 
            className="absolute bg-[#F7F2EE] rounded-full shadow-md transition-all duration-300 pointer-events-none z-20"
            style={{ 
                width: 4 * scaleBase - 2 * tMargin, 
                height: 4 * scaleBase - 2 * tMargin,
                top: 5 * scaleBase * (8 - whiteRow) + tMargin,
                left: 5 * scaleBase * whiteCol + tMargin,
            }}
        />
        {/* Black Piece */}
        <div 
            className="absolute bg-[#534B44] rounded-full shadow-md transition-all duration-300 pointer-events-none z-20"
            style={{ 
                width: 4 * scaleBase - 2 * tMargin, 
                height: 4 * scaleBase - 2 * tMargin,
                top: 5 * scaleBase * (8 - blackRow) + tMargin,
                left: 5 * scaleBase * blackCol + tMargin,
            }}
        />
      </div>
    </div>
  );
}
