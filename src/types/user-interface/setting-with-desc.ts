import GameWithPanelT from "./game-with-panel";

namespace SettingWithDescT {
    export type Props = GameWithPanelT.Synced & GameWithPanelT.Setting & Readonly<{
        key: number,
        handleInput: (name: string, event: React.ChangeEvent<HTMLInputElement>) => void,
    }>;
}

export default SettingWithDescT;