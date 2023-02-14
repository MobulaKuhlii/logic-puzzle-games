import React from "react";
import SidebarT from "../types/sidebar";
import "../css/sidebar.css";

class Sidebar extends React.Component<SidebarT.Props, SidebarT.State> {
    private _buildNestedMenu: (node: SidebarT.Node, key?: number) => React.ReactNode;

    constructor(props: SidebarT.Props) {
        super(props);

        const buildState = (node: SidebarT.Block, depth = 0): SidebarT.Node => {
            const isLeaf = typeof node === "string";
            return {
                value: isLeaf ? node : node[0],
                depth,
                hidden: depth > 1,
                children: isLeaf ? [] : node[1].map(child => buildState(child, depth + 1))
            };
        }

        this.state = buildState(this.props.root);

        const handleClick = (node: SidebarT.Node) => {
            const rebuildState = (current: SidebarT.Node, toggle = false): SidebarT.Node => {
                if(node.depth + 1 < current.depth) {
                    return current;
                }
                return {
                    ...current,
                    hidden: toggle !== current.hidden,
                    children: current.children.map(child => rebuildState(child, toggle || node === current))
                };
            }

            this.setState(rebuildState(this.state));
            this.props.handleClick(node);
        }

        const buildMenu = (node: SidebarT.Node, key: number): React.ReactNode => {
            const {value, depth, children} = node;
            return (
                <>
                    {depth > 0 && (
                        <li key={key}>
                            <button type="button" onClick={() => handleClick(node)}>{value}</button>
                        </li>
                    )}
                    {children.map(buildNestedMenu)}
                </>
            );
        }

        const buildNestedMenu = (node: SidebarT.Node, key = 0): React.ReactNode => {
            if(node.depth < 1) {
                return (
                    <div id={
                        this.props.hasOwnProperty("id") ?
                        this.props.id.toString() :
                        "sidebar"
                    }>
                        {buildMenu(node, key)}
                    </div>
                );
            }
            return !node.hidden && (
                <menu className={"sidebar-menu-depth-" + node.depth.toString()}>
                    {buildMenu(node, key)}
                </menu>
            );
        }

        this._buildNestedMenu = buildNestedMenu;
    }

    render(): React.ReactNode {
        return this._buildNestedMenu(this.state);
    }
}

export default Sidebar;