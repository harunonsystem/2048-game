import type { Direction, MoveResult, TileData, TileMerge } from "./types";

interface Coordinate {
  row: number;
  col: number;
}

function getLineCoordinates(
  direction: Direction,
  line: number,
  size: number,
): Coordinate[] {
  return Array.from({ length: size }, (_, index) => {
    switch (direction) {
      case "left":
        return { row: line, col: index };
      case "right":
        return { row: line, col: size - 1 - index };
      case "up":
        return { row: index, col: line };
      case "down":
        return { row: size - 1 - index, col: line };
    }
  });
}

export function moveBoard(
  board: (TileData | null)[][],
  direction: Direction,
): MoveResult {
  const nextBoard = board.map((row) =>
    row.map((currentTile) => (currentTile ? { ...currentTile } : null)),
  );
  const size = nextBoard.length;
  let moved = false;
  let scoreDelta = 0;
  const merges: TileMerge[] = [];

  for (let line = 0; line < size; line++) {
    const coordinates = getLineCoordinates(direction, line, size);
    const tiles = coordinates
      .map(({ row, col }) => nextBoard[row][col])
      .filter((currentTile): currentTile is TileData => currentTile !== null);
    const mergedTiles: TileData[] = [];

    for (let index = 0; index < tiles.length; index++) {
      const currentTile = tiles[index];
      const nextTile = tiles[index + 1];
      if (nextTile && currentTile.value === nextTile.value) {
        currentTile.value *= 2;
        scoreDelta += currentTile.value;
        merges.push({ survivorId: currentTile.id, consumedId: nextTile.id });
        moved = true;
        index++;
      }
      mergedTiles.push(currentTile);
    }

    coordinates.forEach(({ row, col }) => {
      nextBoard[row][col] = null;
    });
    mergedTiles.forEach((currentTile, index) => {
      const target = coordinates[index];
      if (currentTile.row !== target.row || currentTile.col !== target.col) {
        moved = true;
      }
      currentTile.row = target.row;
      currentTile.col = target.col;
      nextBoard[target.row][target.col] = currentTile;
    });
  }

  return { board: nextBoard, moved, scoreDelta, merges };
}

export function isGameOver(board: (TileData | null)[][]): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const currentTile = board[row][col];
      if (!currentTile) return false;

      const rightTile = board[row][col + 1];
      const downTile = board[row + 1]?.[col];
      if (
        currentTile.value === rightTile?.value ||
        currentTile.value === downTile?.value
      ) {
        return false;
      }
    }
  }
  return true;
}

export function getHighestTileValue(board: (TileData | null)[][]): number {
  return board.flat().reduce(
    (highest, currentTile) => Math.max(highest, currentTile?.value ?? 0),
    0,
  );
}
