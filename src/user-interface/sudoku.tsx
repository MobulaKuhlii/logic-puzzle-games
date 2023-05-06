import React from "react";
import GameWithPanelT from "../types/user-interface/game-with-panel";
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
                {range.map(y => (
                    <>
                        {range.map(x => {
                            return (
                                <SymbolList
                                    key={100 * y + x}
                                    className={
                                        (y > 0 ? "" : "bordered-top") +
                                        (y > 0 || x > 0 ? "" : " ") +
                                        (x > 0 ? "" : "bordered-left") || null
                                    }
                                    synced={this.props.synced}
                                    getIndex={() => game.getIndex(y, x)}
                                    setIndex={(index) => game.setIndex(y, x, index)}
                                />
                            );
                        })}
                    </>
                ))}
            </div>
        );

        return grid;
    }
}

const SudokuComponent = gameWithPanel(SudokuGrid, Sudoku, "SudokuComponent", defaults);

export default SudokuComponent;