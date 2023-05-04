import GameWithPanelT from "./game-with-panel";

namespace PanelT {
    export type Props = GameWithPanelT.Synced & Readonly<{
        settings?: string[],
        handleSymbols: (event: React.ChangeEvent<HTMLInputElement>) => void,
        handleInput: (name: string, event: React.ChangeEvent<HTMLInputElement>) => void,
        handleResetAll: () => void,
        handleApplySettings: (event: React.MouseEvent<HTMLButtonElement>) => void,
        handleOutput: () => void,
        handleTextParse: (text: string) => void,
    }>;
}

export default PanelT;