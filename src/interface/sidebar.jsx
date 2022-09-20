import React from "react";
import "../css/sidebar.css";

export class Sidebar extends React.Component {
    constructor(props) {
        super(props);

        const buildState = (node, depth = 0) => {
            const isLeaf = typeof node === "string";
            return {
                value: isLeaf ? node : node[0],
                depth,
                hidden: depth > 1,
                children: isLeaf ? [] : node[1].map(child => buildState(child, depth + 1))
            };
        }

        this.state = buildState(this.props.root);

        const handleClick = (node) => {
            const rebuildState = (current, toggle = false) => {
                // this optimization is optional
                if(node.depth + 1 < current.depth) {
                    return current;
                }
                return {
                    ...current,
                    hidden: toggle ^ current.hidden,
                    children: current.children.map(child => rebuildState(child, toggle || node === current))
                }
            }

            this.setState(rebuildState(this.state));
            this.props.handleClick(node);
        }

        const buildMenu = (node, key) => {
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

        const buildNestedMenu = (node, key) => {
            if(node.depth < 1) {
                return (
                    <div id={this.props.id || "sidebar"}>
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

        this.buildNestedMenu = buildNestedMenu;
    }

    render() {
        return this.buildNestedMenu(this.state);
    }
}