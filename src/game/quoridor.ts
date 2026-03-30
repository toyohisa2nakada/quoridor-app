// ============================================================
// Quoridor AI Logic (TypeScript Version)
// ============================================================

export type Player = 0 | 1;
export type WallType = number; // 0/1 or 1/2 depending on the internal function
export type MoveCommand = 0 | 1 | 2; // 0: Move, 1: H-Wall, 2: V-Wall
export type MoveAction = [MoveCommand, number, number]; // [cmd, index, eval_score]

export interface AIStateInput {
  p0: number;
  p1: number;
  n_p0_wall: number;
  n_p1_wall: number;
  h_walls_str: string;
  v_walls_str: string;
  g_line: number;
}

export interface GameState {
  p0: number;
  p1: number;
  n_p0_wall: number;
  n_p1_wall: number;
  h_walls: number[];
  v_walls: number[];
  g_line: number;
}

interface WallIndexInfo {
  p: number;
  w: [number, number][]; // [w_type, w_index]
}

// Get the target index and blocking wall indices based on move direction
export function m2windex(p: number, hv: number, di: number): WallIndexInfo {
  const d = di === 1 ? 0 : -1;
  const w_type = hv === 1 ? 0 : 1;
  if (hv === 0) {
    // Horizontal move
    return { p: p + di, w: [[w_type, p + d], [w_type, p + d - 9]] };
  } else {
    // Vertical move
    return { p: p + 9 * di, w: [[w_type, p - 1 + 9 * d], [w_type, p + 9 * d]] };
  }
}

// Check if there is NO wall at a specific wall index
export function nowall(w_type: number, i: number, ws: number[][]): boolean {
  if (i <= -2 || i >= 72) return w_type === 1; // Outer boundaries
  if ((i % 9 + 9) % 9 === 8) return w_type === 0;

  const wi = i - Math.floor(i / 9);
  if (wi < 0 || wi >= 64) return true; // If out of bounds of walls array, it means no wall

  return ws[w_type][wi] === 0;
}

// Filter valid actions from candidates
function actions(w_indexes: WallIndexInfo[], ws: number[][]): number[] {
  const acts: number[] = [];
  for (const wi of w_indexes) {
    let blocked = false;
    for (const w of wi.w) {
      if (!nowall(w[0], w[1], ws)) { blocked = true; break; }
    }
    if (!blocked) acts.push(wi.p);
  }
  return acts;
}

// Get valid movement candidates for a piece (without jump considering yet)
export function find_p_candidates(p_index: number, h_walls: number[], v_walls: number[]): number[] {
  const ws = [h_walls, v_walls];
  const w_indexes = [[0, 1], [0, -1], [1, 1], [1, -1]].map(x => m2windex(p_index, x[0], x[1]));
  return actions(w_indexes, ws);
}

// Add jump actions if moving onto enemy piece
export function trans_p_candidate_with_jump(
  acts1: number[], p_index: number, e_index: number, h_walls: number[], v_walls: number[]
): [number[], number[]] {
  const p0 = p_index, p1 = e_index;
  const ws = [h_walls, v_walls];
  const acts2: number[] = [];
  const jumped_acts: number[] = [];

  for (const a of acts1) {
    if (a === p1) {
      const hv = Math.abs(p1 - p0) <= 1 ? 0 : 1;
      const di = hv === 0 ? p1 - p0 : Math.floor((p1 - p0) / 9);
      const wi = m2windex(p1, hv, di);
      let act = actions([wi], ws);

      if (act.length === 0) {
        // Can't jump straight, check diagonal jump (side steps)
        const hv2 = hv === 0 ? 1 : 0;
        const w_indexes = [[hv2, 1], [hv2, -1]].map(x => m2windex(p1, x[0], x[1]));
        act = actions(w_indexes, ws);
      }
      acts2.push(...act);
      jumped_acts.push(...act);
    } else {
      acts2.push(a);
    }
  }
  return [acts2, jumped_acts];
}

// Find path using A*
export function find_route(p_index: number, e_index: number, h_walls: number[], v_walls: number[], g_line: number = 0): number[] {
  const goals = g_line === 2 ? [] : Array.from({ length: 9 }, (_, i) => g_line * 72 + i);
  const didis_goal = (p: number) => g_line !== 2 ? Math.abs(8 * g_line - Math.floor(p / 9)) : 0;

  let opn = [{ p: p_index, g: 0, h: didis_goal(p_index) }];
  const cls: { p: number, g: number, h: number }[] = [];
  const ptr: number[][] = [];

  while (opn.length > 0) {
    const n = opn.shift()!;
    cls.push(n);

    if (goals.includes(n.p)) {
      const rt = [n.p];
      while (rt[rt.length - 1] !== p_index) {
        const idx = ptr.findIndex(x => x[1] === rt[rt.length - 1]);
        rt.push(ptr[idx][0]);
      }
      rt.reverse();
      return rt;
    }

    const [act_list, jumped] = trans_p_candidate_with_jump(
      find_p_candidates(n.p, h_walls, v_walls), n.p, e_index, h_walls, v_walls
    );
    if (g_line === 2) goals.push(...jumped);

    for (const m_p of act_list) {
      const m = { p: m_p, g: n.g + 1, h: didis_goal(m_p) };
      let found = false;
      for (const lst of [opn, cls]) {
        const idx = lst.findIndex(x => x.p === m.p);
        if (idx !== -1) {
          if (lst[idx].g + lst[idx].h > m.g + m.h) {
            lst.splice(idx, 1);
            const pidx = ptr.findIndex(x => x[1] === m.p);
            if (pidx !== -1) ptr.splice(pidx, 1);
            opn.push(m);
            ptr.push([n.p, m.p]);
          }
          found = true;
          break;
        }
      }
      if (!found) {
        opn.push(m);
        ptr.push([n.p, m.p]);
      }
    }
    opn.sort((a, b) => (a.g + a.h) - (b.g + b.h));
  }
  return []; // Route not found
}

// Check if route exists, ignoring enemy piece
export function is_route(p_index: number, h_walls: number[], v_walls: number[], g_line: number): boolean {
  const goals = Array.from({ length: 9 }, (_, i) => g_line * 72 + i);
  const candidates = g_line === 0
    ? [[1, -1], [0, 1], [0, -1], [1, 1]]
    : [[1, 1], [0, 1], [0, -1], [1, -1]];
  const ws = [h_walls, v_walls];
  const closed = new Array(81).fill(0);

  function next(p: number): boolean {
    if (goals.includes(p)) return true;
    closed[p] = 1;
    for (const c of candidates) {
      const p2 = p + (c[0] === 0 ? c[1] : c[1] * 9);
      if (p2 >= 0 && p2 < 81 && closed[p2] === 0) {
        const wi = m2windex(p, c[0], c[1]);
        if (wi.w.every(w => nowall(w[0], w[1], ws))) {
          if (next(p2)) return true;
        }
      }
    }
    return false;
  }
  return next(p_index);
}

// Check if placing a wall is prevented by other walls
export function prevents_by_walls(w_type: WallType, w_index: number, h_walls: number[], v_walls: number[]): boolean {
  const row = (i: number) => Math.floor(i / 8);
  const col = (i: number) => i % 8;

  if (h_walls[w_index] === 1 || v_walls[w_index] === 1) return true;
  if (w_type === 1 && ((col(w_index) !== 0 && h_walls[w_index - 1] === 1) || (col(w_index) !== 7 && h_walls[w_index + 1] === 1))) return true;
  if (w_type === 2 && ((row(w_index) !== 0 && v_walls[w_index - 8] === 1) || (row(w_index) !== 7 && v_walls[w_index + 8] === 1))) return true;
  return false;
}

// Check if a new wall completely blocks any player's route to goal
// Returns [blocks_route, quality_score]
export function prevents_by_route(
  w_type: number, w_index: number, p0: number, p1: number,
  h_walls: number[], v_walls: number[], g_line: number, quality = false
): [boolean, number] {
  const hv_walls = [null, h_walls, v_walls];
  (hv_walls[w_type] as number[])[w_index] = 1;

  let ret: [boolean, number];
  if (quality) {
    const p0_r = find_route(p0, p1, h_walls, v_walls, g_line);
    const p1_r = p0_r.length === 0 ? [] : find_route(p1, p0, h_walls, v_walls, 1 - g_line);
    ret = (p0_r.length !== 0 && p1_r.length !== 0) ? [false, p1_r.length - p0_r.length] : [true, 0];
  } else {
    const t1 = is_route(p0, h_walls, v_walls, g_line);
    const t2 = t1 ? is_route(p1, h_walls, v_walls, 1 - g_line) : false;
    ret = [!t2, 0];
  }

  (hv_walls[w_type] as number[])[w_index] = 0;
  return ret;
}

// Get all possible wall placements
export function avaiable_walls(h_walls: number[], v_walls: number[]): [WallType, number][] {
  const result: [WallType, number][] = [];
  for (let i = 0; i < 64; i++) {
    if (!prevents_by_walls(1, i, h_walls, v_walls)) result.push([1, i]);
    if (!prevents_by_walls(2, i, h_walls, v_walls)) result.push([2, i]);
  }
  return result;
}

// Find all AI candidates (moves + wall placements)
export function find_candidates(state: GameState, quality = false): MoveAction[] {
  const { p0, p1, h_walls, v_walls, g_line, n_p0_wall } = state;
  const ai_r0 = find_route(p0, p1, h_walls, v_walls, g_line);
  const hu_r0 = find_route(p1, p0, h_walls, v_walls, 1 - g_line);

  const steps: MoveAction[] = [];
  if (ai_r0.length > 0) {
    steps.push([0, ai_r0[1], quality ? (hu_r0.length - ai_r0.length + 1 + Math.random()) : 0]);
  }

  if (n_p0_wall < 10) {
    const walls: [number, number][] = avaiable_walls(h_walls, v_walls);
    for (const wall of walls) {
      const [prevents, q] = prevents_by_route(wall[0], wall[1], p0, p1, h_walls, v_walls, g_line, quality);
      if (!prevents) {
        steps.push([wall[0] as MoveCommand, wall[1], quality ? (q + Math.random()) : 0]);
      }
    }
  }

  if (steps.length === 0) {
    const ai_r = find_route(p0, p1, h_walls, v_walls, 2);
    if (ai_r.length > 0) {
      steps.push([0, ai_r[1], 0]);
    } else {
      const [a] = trans_p_candidate_with_jump(
        find_p_candidates(p0, h_walls, v_walls), p0, p1, h_walls, v_walls
      );
      if (a.length > 0) steps.push([0, a[0], 0]);
    }
  }
  return steps;
}

export function next_ai(stateInput: AIStateInput): { result: MoveAction | null } {
  const state: GameState = {
    p0: stateInput.p0,
    p1: stateInput.p1,
    n_p0_wall: stateInput.n_p0_wall,
    n_p1_wall: stateInput.n_p1_wall,
    h_walls: stateInput.h_walls_str ? stateInput.h_walls_str.split(",").map(Number) : new Array(64).fill(0),
    v_walls: stateInput.v_walls_str ? stateInput.v_walls_str.split(",").map(Number) : new Array(64).fill(0),
    g_line: stateInput.g_line,
  };


  const steps = find_candidates(state, true);
  if (steps.length === 0) return { result: null };

  let best = steps[0];
  for (const s of steps) {
    if (s[2] > best[2]) best = s;
  }
  return { result: best };
}
