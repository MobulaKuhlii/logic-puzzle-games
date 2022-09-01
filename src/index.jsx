import React from "react";
import * as ReactDOM from "react-dom/client";

/* css dependencies for webpack */
import "./css/index.css";
import "./css/panel.css";
import "./css/sudoku.css";

/* components */
import { SudokuGame } from "./interface/sudoku.jsx";

const gameComponents = {
    Sudoku: SudokuGame
};

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = { game: this.props.defaultGame };
    }
    render() {
        const GameComponent = gameComponents[this.state.game];
        return (
            <div id="app">
                <GameComponent />
            </div>
        );
    }
}

const root = ReactDOM.createRoot(
    document.getElementById("root")
);

root.render(<App defaultGame="Sudoku" />);