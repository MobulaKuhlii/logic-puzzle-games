import GameWithPanelT from "./game-with-panel";
import SidebarT from "./sidebar";

namespace AppT {
    export type State = Readonly<{
        alert: boolean,
        clipboard: boolean,
        name: string,
        message: string
    }>;

    export type GameDesc = {
        Component: GameWithPanelT.Component,
        menu: SidebarT.Block,
        menuHandler: (node: SidebarT.Node) => Partial<State> | null
    };
}

export default AppT;