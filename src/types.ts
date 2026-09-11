export interface Translation {
  score: string;
  best: string;
  howToPlay: string;
  instructions: string;
  newGame: string;
  tryAgain: string;
  continueGame: string;
  finalScore: string;
  bestScore: string;
  highestTile: string;
  shareResult: string;
  congratulations: string;
  achievement2048: string;
  achievement4096: string;
  achievement8192: string;
  achievement16384: string;
  achievement32768: string;
  achievement65536: string;
  achievement131072: string;
  achievement262144: string;
  achievement524288: string;
  keepGoing: string;
  gameOver: string;
  noMovesLeft: string;
  newRecord: string;
  wellDone: string;
}

export interface Translations {
  ja: Translation;
  en: Translation;
}

export type Language = "ja" | "en";
export type Direction = "left" | "right" | "up" | "down";
export type GameMode = 2048 | 4096 | 8192 | 16384 | 32768 | 65536 | 131072 | 262144 | 524288;

export interface GameState {
  board: (number | null)[][];
  score: number;
  bestScore: number;
  gameWon: boolean;
  gameOver: boolean;
  currentTargetLevel: GameMode;
  completedLevels: Set<GameMode>;
}

export interface TileData {
  value: number;
  row: number;
  col: number;
  id: number;
  merged?: boolean;
  isNew?: boolean;
}

export interface TileMerge {
  survivorId: number;
  consumedId: number;
}

export interface MoveResult {
  board: (TileData | null)[][];
  moved: boolean;
  scoreDelta: number;
  merges: TileMerge[];
}

export interface DebugGame {
  board: (TileData | null)[][];
  score: number;
  gameOver: boolean;
  readonly achievementLevels: readonly GameMode[];
  currentTargetLevel: GameMode;
  createTileObject(value: number, row: number, col: number): TileData;
  removeTile(tile: TileData): void;
  updateScore(): void;
  checkGameState(): Promise<void>;
}

export interface TouchData {
  startX: number;
  startY: number;
  endX?: number;
  endY?: number;
}
