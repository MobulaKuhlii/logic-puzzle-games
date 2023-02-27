namespace SidebarT {
    export type Block = string | [string, SidebarT.Block[]];

    export type Node = Readonly<{
        value: string,
        depth: number,
        hidden: boolean,
        children: Node[]
    }>;

    export type Props = Readonly<{
        root: SidebarT.Block,
        handleClick: (node: SidebarT.Node) => void,
        id?: number | string
    }>;

    export type State = Node;
}

export default SidebarT;