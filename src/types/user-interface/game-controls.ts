namespace GameControlsT {
    export type Props = Readonly<{
        handleUndo?: () => void,
        handleRedo?: () => void,
        handleCheck?: () => void,
        handleSolve?: () => void,
        handleReset?: () => void
    }>;
}

export default GameControlsT;