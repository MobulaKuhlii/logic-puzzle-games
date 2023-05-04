import React from "react";


type Props = Readonly<{
    handleUndo?: () => void,
    handleRedo?: () => void,
    handleCheck?: () => void,
    handleSolve?: () => void,
    handleReset?: () => void
}>;

class GameControls extends React.Component<Props> {
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