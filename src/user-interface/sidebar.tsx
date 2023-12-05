import React from "react";
import SidebarT from "../types/user-interface/sidebar";
import "../css/sidebar.css";


class Sidebar extends React.Component<SidebarT.Props, SidebarT.State> {
    private _buildNestedMenu: (node: SidebarT.Node, key?: string) => React.ReactNode;

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

        const buildMenu = (node: SidebarT.Node, key: string): React.ReactNode => {
            const {value, depth, children} = node;
            /*
                despite the console warning, the keys are unique,
                which can be checked by uncommenting the line below
            */
            // console.log(key);
            return (
                <React.Fragment key={key}>
                    {depth > 0 && (
                        <li>
                            <button type="button" onClick={() => handleClick(node)}>{value}</button>
                        </li>
                    )}
                    {children.map((ch, idx) => buildNestedMenu(ch, key + idx.toString()))}
                </React.Fragment>
            );
        }

        const buildNestedMenu = (node: SidebarT.Node, key = "R"): React.ReactNode => {
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
                <menu className={node.depth > 1 ? "sidebar-node" : null}>
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