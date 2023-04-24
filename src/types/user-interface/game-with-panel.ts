import LogicPuzzleGameT from "../logic/game";

namespace GameWithPanelT {
    export type Props = Readonly<{
        handleAlert: (message: string) => void,
        handleClipboard: (message: string) => void,
    }>;

    export type Option = {
        value?: string,
        on?: boolean,
        input: boolean
    };

    type StateValue =
          boolean
        | Option
        | LogicPuzzleGameT.Config
        | LogicPuzzleGameT.Game
        | string[]
        | string;

    export type InitialState = Readonly<{
        [key: string]: StateValue,
        clipboard: boolean,
        parsed: boolean,
        reset: boolean,
        autofold: Option,
        autofoldDelay: Option,
        clamp: Option,
        lock: Option,
        lockDelay: Option
    }>;

    export type State = InitialState & Readonly<{
        config: LogicPuzzleGameT.Config,
        game: LogicPuzzleGameT.Game,
        symbols: string[],
        symbolsInput: string
    }>;

    export type Synced = Readonly<{
        synced: State
    }>;

    export type Setting = Readonly<{
        name: string,
        inp?: string,
        suffix?: string,
        desc: string
    }>;

    export type Component = React.ComponentClass<Props, State>;
}

export default GameWithPanelT;