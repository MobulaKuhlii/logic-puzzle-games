import React from "react";
import { Sudoku } from "../logic/sudoku.mjs";
import { ValueList } from "./value-list.jsx";
import { withPanel } from "./panel.jsx";

class SudokuBoard extends React.Component {
    render() {
        const { game, ...rest } = this.props.synced;
        const indices = Array.from(game.config, (_, i) => i);
        return (
            <div className="game-board" id={`game-board-size-${rest.boardSize}`}>
                {indices.map(x => (
                    <div className={`row row-size-${rest.boardSize}`} key={x}>
                        {indices.map(y => (
                            <ValueList
                                className={` ${y + 1 < rest.boardSize  ? "vl-right" : ""}`}
                                key={y}
                                getCell={() => game.getCell.call(game, x, y)}
                                setCell={(value) => game.setCell.call(game, x, y, value)}
                                synced={rest}
                                toggleFlag={this.props.toggleFlag}
                                lockDelay={700}
                            />
                        ))}
                    </div>
                ))}
                <div id="row-bot"></div>
            </div>
        );
    }
}

export const SudokuGame = withPanel(SudokuBoard, Sudoku, {
    displayName: "SudokuGame",
    textInputOptions: [
        {prop: "rowSep", label: "Row Separator"},
        {prop: "valSep", label: "Value Separator"}
    ],
    boardSizes: [9, 16, 25]
});