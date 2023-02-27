import React from "react";
import GameWithPanelT from "../types/game-with-panel";
import Sudoku, { defaults } from "../logic/sudoku";
import SymbolList from "./symbol-list";
import gameWithPanel from "./game-with-panel";
import "../css/sudoku.css";

class SudokuGrid extends React.Component<GameWithPanelT.Synced> {
    render(): React.ReactNode {
        const { game } = this.props.synced;
        const range = [...Array(this.props.synced.config.size)].map((_, i) => i);
        const gridId = "grid-size-" + this.props.synced.config.size.toString();
        
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
                                synced={this.props.synced}
                                getIndex={() => game.getCell.call(game, x, y).value}
                                setIndex={game.getCell.call(game, x, y).setValue}
                            />
                        ))}
                    </>
                ))}
            </div>
        );

        return grid;
    }
}

const SudokuComponent = gameWithPanel(SudokuGrid, Sudoku, "SudokuComponent", defaults);

export default SudokuComponent;