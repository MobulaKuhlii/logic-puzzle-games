import GameWithPanelT from "./game-with-panel";

namespace SymbolListT {
    export type Props = GameWithPanelT.Synced & Readonly<{
        key: number,
        className: string,
        getIndex: () => number,
        setIndex: (value: number) => boolean
    }>;

    export type State = Readonly<{
        unfolded: boolean,
        locked: boolean,
        prefix: string,
        blur?: boolean,
        lockTimer?: Date
    }>;
}

export default SymbolListT;