import { assert, config } from "chai";
import { describe, it } from "./utility.mjs";
import { Sudoku } from "../src/logic/sudoku.mjs";

config.truncateThreshold = 0;

describe("Sudoku tests", () => {
    const config = { length: 9 };
    const sudoku = new Sudoku(config);

    it("Cell's peers", () => {
        [
            {
                x: 2, y: 3,
                peers: [
                    [2, 0], [2, 1], [2, 2], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], // horizontal
                    [0, 3], [1, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], // vertical
                    [0, 4], [0, 5], [1, 4], [1, 5] // same sub-square, non-duplicate
                ]
            }
        ].forEach(({ x, y, peers }) => {
            assert.sameDeepMembers(
                Array.from(sudoku.board[x][y].peers, cell => [cell.x, cell.y]),
                peers,
                `Invalid peers for (${x}, ${y})`
            );
        });
    }, true);
/*
    it("Serialize and deserialize", () => {
        assert.strictEqual(
            sudoku.board[0][3].serialize(),
            '{"x":0,"y":3,"initial":0,"closed":false,"indices":[1,2,3,4,5,6,7,8,9]}'
        );
        assert.strictEqual(
            sudoku.board[0][3].serialize(true),
            '{"x":0,"y":3,"peers":[[0,0],[0,1],[1,3],[0,2],[2,3],[3,3],[0,4],[4,3],[0,5],[5,3],[0,6],[6,3],[0,7],' +
            '[7,3],[0,8],[8,3],[1,4],[1,5],[2,4],[2,5]],"initial":0,"closed":false,"indices":[1,2,3,4,5,6,7,8,9]}'
        );
    }, true);
*/
});