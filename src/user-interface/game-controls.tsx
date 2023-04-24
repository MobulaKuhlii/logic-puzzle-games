import React from "react";


type Props = Readonly<{
    handleUndo?: () => void,
    handleRedo?: () => void,
    handleCheck?: () => void,
    handleSolve?: () => void,
    handleReset?: () => void
}>;

class GameControls extends React.Component<Props> {
    render() {
        return (
            <div id="game-controls">
                {this.props.handleUndo && (
                    <button onClick={this.props.handleUndo}>
                        Undo
                    </button>
                )}
                {this.props.handleRedo && (
                    <button onClick={this.props.handleRedo}>
                        Redo
                    </button>
                )}
                {this.props.handleCheck && (
                    <button onClick={this.props.handleCheck}>
                        Check
                    </button>
                )}
                {this.props.handleSolve && (
                    <button onClick={this.props.handleSolve}>
                        Solve
                    </button>
                )}
                {this.props.handleReset && (
                    <button onClick={this.props.handleReset}>
                        Reset
                    </button>
                )}
            </div>
        );
    }
}

export default GameControls;