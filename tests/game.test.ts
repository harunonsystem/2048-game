import { describe, expect, it } from "vitest";
import { getHighestTileValue, isGameOver, moveBoard } from "../src/game";
import type { TileData } from "../src/types";

const tile = (id: number, value: number, row: number, col: number): TileData => ({
  id,
  value,
  row,
  col,
});

describe("moveBoard", () => {
  it("moves tiles left without mutating the input board", () => {
    const board = [
      [null, tile(1, 2, 0, 1), null, tile(2, 4, 0, 3)],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "left");

    expect(result.board[0]).toEqual([
      tile(1, 2, 0, 0),
      tile(2, 4, 0, 1),
      null,
      null,
    ]);
    expect(result.moved).toBe(true);
    expect(result.scoreDelta).toBe(0);
    expect(result.merges).toEqual([]);
    expect(board[0]).toEqual([
      null,
      tile(1, 2, 0, 1),
      null,
      tile(2, 4, 0, 3),
    ]);
  });

  it("merges one pair and reports its score and tile IDs", () => {
    const board = [
      [tile(1, 2, 0, 0), tile(2, 2, 0, 1), null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "left");

    expect(result.board[0]).toEqual([tile(1, 4, 0, 0), null, null, null]);
    expect(result.scoreDelta).toBe(4);
    expect(result.merges).toEqual([{ survivorId: 1, consumedId: 2 }]);
    expect(board[0][0]?.value).toBe(2);
  });

  it("moves right and keeps the rightmost tile ID when merging", () => {
    const board = [
      [tile(1, 2, 0, 0), null, tile(2, 2, 0, 2), null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "right");

    expect(result.board[0]).toEqual([null, null, null, tile(2, 4, 0, 3)]);
    expect(result.merges).toEqual([{ survivorId: 2, consumedId: 1 }]);
  });

  it("merges each tile at most once", () => {
    const board = [
      [
        tile(1, 2, 0, 0),
        tile(2, 2, 0, 1),
        tile(3, 4, 0, 2),
        null,
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "left");

    expect(result.board[0]).toEqual([
      tile(1, 4, 0, 0),
      tile(3, 4, 0, 1),
      null,
      null,
    ]);
    expect(result.scoreDelta).toBe(4);
  });

  it("merges multiple independent pairs", () => {
    const board = [
      [
        tile(1, 2, 0, 0),
        tile(2, 2, 0, 1),
        tile(3, 4, 0, 2),
        tile(4, 4, 0, 3),
      ],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "left");

    expect(result.board[0]).toEqual([
      tile(1, 4, 0, 0),
      tile(3, 8, 0, 1),
      null,
      null,
    ]);
    expect(result.scoreDelta).toBe(12);
    expect(result.merges).toEqual([
      { survivorId: 1, consumedId: 2 },
      { survivorId: 3, consumedId: 4 },
    ]);
  });

  it("moves and merges upward", () => {
    const board = [
      [null, tile(1, 8, 0, 1), null, null],
      [null, null, null, null],
      [null, tile(2, 8, 2, 1), null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "up");

    expect(result.board[0][1]).toEqual(tile(1, 16, 0, 1));
    expect(result.board[1][1]).toBeNull();
    expect(result.merges).toEqual([{ survivorId: 1, consumedId: 2 }]);
  });

  it("moves down and keeps the bottommost tile ID when merging", () => {
    const board = [
      [null, null, tile(1, 8, 0, 2), null],
      [null, null, tile(2, 8, 1, 2), null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "down");

    expect(result.board[3][2]).toEqual(tile(2, 16, 3, 2));
    expect(result.board[2][2]).toBeNull();
    expect(result.merges).toEqual([{ survivorId: 2, consumedId: 1 }]);
  });

  it("reports an unchanged board as a no-op", () => {
    const board = [
      [tile(1, 2, 0, 0), tile(2, 4, 0, 1), null, null],
      [null, null, null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    const result = moveBoard(board, "left");

    expect(result.moved).toBe(false);
    expect(result.scoreDelta).toBe(0);
    expect(result.merges).toEqual([]);
    expect(result.board).toEqual(board);
    expect(result.board).not.toBe(board);
    expect(result.board[0][0]).not.toBe(board[0][0]);
  });
});

describe("isGameOver", () => {
  it("returns true for a full board with no adjacent matches", () => {
    const values = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    const board = values.map((row, rowIndex) =>
      row.map((value, colIndex) =>
        tile(rowIndex * 4 + colIndex + 1, value, rowIndex, colIndex),
      ),
    );

    expect(isGameOver(board)).toBe(true);
  });

  it("returns false when an empty cell remains", () => {
    const board = Array.from({ length: 4 }, () =>
      Array<TileData | null>(4).fill(null),
    );

    expect(isGameOver(board)).toBe(false);
  });

  it("returns false when horizontal or vertical merges remain", () => {
    const horizontal = [
      [tile(1, 2, 0, 0), tile(2, 2, 0, 1), tile(3, 4, 0, 2), tile(4, 8, 0, 3)],
      [tile(5, 4, 1, 0), tile(6, 8, 1, 1), tile(7, 16, 1, 2), tile(8, 32, 1, 3)],
      [tile(9, 8, 2, 0), tile(10, 16, 2, 1), tile(11, 32, 2, 2), tile(12, 64, 2, 3)],
      [tile(13, 16, 3, 0), tile(14, 32, 3, 1), tile(15, 64, 3, 2), tile(16, 128, 3, 3)],
    ];
    const vertical = horizontal.map((row) => row.map((currentTile) => ({ ...currentTile })));
    vertical[0][0].value = 4;

    expect(isGameOver(horizontal)).toBe(false);
    expect(isGameOver(vertical)).toBe(false);
  });
});

describe("getHighestTileValue", () => {
  it("returns the largest tile value", () => {
    const board = [
      [tile(1, 2, 0, 0), tile(2, 64, 0, 1), null, null],
      [null, tile(3, 16, 1, 1), null, null],
      [null, null, null, null],
      [null, null, null, null],
    ];

    expect(getHighestTileValue(board)).toBe(64);
  });

  it("returns zero for an empty board", () => {
    const board = Array.from({ length: 4 }, () =>
      Array<TileData | null>(4).fill(null),
    );

    expect(getHighestTileValue(board)).toBe(0);
  });
});
