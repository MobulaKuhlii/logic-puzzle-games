import React from "react";
import "../css/sudoku.css";
import { Sudoku } from "../logic/sudoku.mjs";
import { SymbolList } from "./symbol-list.jsx";
import { gameWithPanel } from "./game-panel.jsx";

class SudokuGrid extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { game, ...synced } = this.props.synced;
        const range = Array.from(game.config, (_, i) => i);
        const gridId = "grid-size-" + game.config.length.toString();
        
        const grid = (
            <div id={gridId} className="grid-container">
                {range.map(x => (
                    <>
                        {range.map(y => (
                            <SymbolList
                                key={y}
                                className={
                                    (x > 0 ? "" : "bordered-top") +
                                    (x > 0 || y > 0 ? "" : " ") +
                                    (y > 0 ? "" : "bordered-left")
                                }
                                synced={synced}
                                getIndex={() => game.getCell.call(game, x, y)}
                                setIndex={(value) => game.setCell.call(game, x, y, value)}
                            />
                        ))}
                    </>
                ))}
            </div>
        );

        return grid;
    }
}

export const SudokuComponent = gameWithPanel(SudokuGrid, Sudoku, {
    displayName: "SudokuComponent"
});