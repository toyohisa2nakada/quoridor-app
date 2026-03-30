import { useState, useCallback, useEffect } from 'react';
import type { GameState } from '../game/quoridor_ai';
import { next_ai } from '../game/quoridor_ai';

export type PlayerType = 'human' | 'ai';

export interface AppState extends GameState {
  turn: 0 | 1; // 0 for White (p0), 1 for Black (p1)
  turnNum: number;
  highlight: boolean;
  grayWalls: boolean;
  history: AppState[]; // For undo
  winner: 0 | 1 | null;
  aiPlayer: 'black' | 'white' | 'both' | 'none';
}

const createInitialState = (): AppState => ({
  p0: 4,  // White starts at bottom middle (row 0, col 4 -> 4)
  p1: 76, // Black starts at top middle (row 8, col 4 -> 76)
  n_p0_wall: 0,
  n_p1_wall: 0,
  h_walls: new Array(64).fill(0),
  v_walls: new Array(64).fill(0),
  g_line: 1, // White tries to reach top (row 8 -> g_line 1), Black tries to reach bottom (row 0 -> g_line 0)
  turn: 0,
  turnNum: 1,
  highlight: true,
  grayWalls: false,
  history: [],
  winner: null,
  aiPlayer: 'black',
});

export function useQuoridor() {
  const [state, setState] = useState<AppState>(createInitialState());

  const resetGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  const movePiece = useCallback((player: 0 | 1, targetIndex: number) => {
    setState(prev => {
      if (prev.winner !== null) return prev;

      const nextState = { ...prev };
      nextState.history = [...prev.history, { ...prev }];

      if (player === 0) {
        nextState.p0 = targetIndex;
      } else {
        nextState.p1 = targetIndex;
      }

      // Check win condition
      if (Math.floor(nextState.p0 / 9) === 8) nextState.winner = 0; // White wins at row 8
      if (Math.floor(nextState.p1 / 9) === 0) nextState.winner = 1; // Black wins at row 0

      nextState.turn = prev.turn === 0 ? 1 : 0;
      nextState.turnNum += 1;
      return nextState;
    });
  }, []);

  const placeWall = useCallback((player: 0 | 1, type: 0 | 1, index: number) => {
    setState(prev => {
      if (prev.winner !== null) return prev;

      const nextState = { ...prev };
      nextState.history = [...prev.history, { ...prev }];

      if (type === 0) { // Horizontal
        nextState.h_walls = [...prev.h_walls];
        nextState.h_walls[index] = 1;
      } else { // Vertical
        nextState.v_walls = [...prev.v_walls];
        nextState.v_walls[index] = 1;
      }

      if (player === 0) {
        nextState.n_p0_wall += 1;
      } else {
        nextState.n_p1_wall += 1;
      }

      nextState.turn = prev.turn === 0 ? 1 : 0;
      nextState.turnNum += 1;
      return nextState;
    });
  }, []);

  const undoMove = useCallback(() => {
    setState(prev => {
      if (prev.history.length === 0) return prev;
      const lastState = prev.history[prev.history.length - 1];
      return {
        ...lastState,
        history: prev.history.slice(0, -1),
        aiPlayer: prev.aiPlayer,
        highlight: prev.highlight,
        grayWalls: prev.grayWalls,
      };
    });
  }, []);

  const toggleHighlight = useCallback(() => {
    setState(prev => ({ ...prev, highlight: !prev.highlight }));
  }, []);

  const toggleGrayWalls = useCallback(() => {
    setState(prev => ({ ...prev, grayWalls: !prev.grayWalls }));
  }, []);

  // Handle AI turn
  useEffect(() => {
    if (state.winner !== null) return;

    const isAiTurn = state.aiPlayer === 'both' ||
      (state.aiPlayer === 'white' && state.turn === 0) ||
      (state.aiPlayer === 'black' && state.turn === 1);

    if (isAiTurn) {
      const timer = setTimeout(() => {
        const isBlackTurn = state.turn === 1;
        const ai_p0 = isBlackTurn ? state.p1 : state.p0;
        const ai_p1 = isBlackTurn ? state.p0 : state.p1;
        const ai_n_p0 = isBlackTurn ? state.n_p1_wall : state.n_p0_wall;
        const ai_n_p1 = isBlackTurn ? state.n_p0_wall : state.n_p1_wall;

        const aiInput = {
          p0: ai_p0,
          p1: ai_p1,
          n_p0_wall: ai_n_p0,
          n_p1_wall: ai_n_p1,
          h_walls_str: state.h_walls.join(','),
          v_walls_str: state.v_walls.join(','),
          g_line: isBlackTurn ? 0 : 1, // Black goes to row 0, White to row 8
        };

        const result = next_ai(aiInput);
        if (result.result) {
          const [cmd, place] = result.result;
          if (cmd === 0) {
            movePiece(state.turn, place);
          } else if (cmd === 1) { // h wall
            placeWall(state.turn, 0, place);
          } else if (cmd === 2) { // v wall
            placeWall(state.turn, 1, place);
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [state, movePiece, placeWall]);

  return {
    state,
    resetGame,
    movePiece,
    placeWall,
    undoMove,
    toggleHighlight,
    toggleGrayWalls,
    setAiPlayer: (ai: AppState['aiPlayer']) => setState(s => ({ ...s, aiPlayer: ai })),
  };
}
