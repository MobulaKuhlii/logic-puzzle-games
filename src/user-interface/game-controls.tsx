import React from "react";
import GameControlsT from "../types/user-interface/game-controls";


class GameControls extends React.Component<GameControlsT.Props> {
    condButton(action: string) {
        return (
            <>
                {this.props["handle" + action] && (
                    <button onClick={this.props["handle" + action]}>
                        {action}
                    </button>
                )}
            </>
        );
    }
    render() {
        return (
            <div id="game-controls">
                {this.condButton("Undo")}
                {this.condButton("Redo")}
                {this.condButton("Check")}
                {this.condButton("Solve")}
                {this.condButton("Reset")}
            </div>
        );
    }
}

export default GameControls;