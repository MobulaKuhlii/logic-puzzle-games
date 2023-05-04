import React from "react";
import AppT from "../types/user-interface/app";
import SidebarT from "../types/user-interface/sidebar";
import Sidebar from "./sidebar";
import SudokuComponent from "./sudoku";
import "../css/app.css";


const games: {
    [name: string]: AppT.GameDesc
} = {
    sudoku: {
        Component: SudokuComponent,
        menu: [
            "sudoku", [
                [
                    "square region", [
                        "classic",
                        "shi doku",
                        "sudoku x",
                        "number place challenger",
                        "sudoku the giant"
                    ]
                ], [
                    "non-square region", [
                        "go doku",
                        "roku doku",
                        "heptominal",
                        "hypersudoku",
                        "maxi"
                    ]
                ]
            ]
        ],
        menuHandler({value, depth}) {
            if(depth === 1) {
                return { name: value };
            }
            if(depth === 3) {
                console.log(`switch to ${value} game`);
                // promptOnExit();
                return {};
            }
            return null;
        }
    }
}


const sidebarRoot: SidebarT.Block = [
    "", Object.keys(games).map(name => games[name].menu)
];


class App extends React.Component<Record<string, never>, AppT.State> {
    constructor(props: Record<string, never>) {
        super(props);
        this.state = {
            alert: false,
            clipboard: false,
            name: "sudoku",
            message: ""
        };
        this.handleSidebarClick = this.handleSidebarClick.bind(this);
    }
    handleSidebarClick(node: SidebarT.Node) {
        const updated = games[this.state.name].menuHandler(node);
        if(updated !== null) {
            this.setState({ ...this.state, ...updated });
        }
    }
    render(): React.ReactNode {
        const GameComponent = games[this.state.name].Component;
        const header = (
            <header id="main-header">
                <div>
                    <a href="">
                        <h1>Logic Puzzle Games!</h1>
                    </a>
                    {/* <a href="">Logo</a> */}
                </div>
            </header>
        );
        const footer = (
            <footer id="main-footer">
                <div>
                    <a href="">Repository</a>
                    <a href="">Report issue</a>
                    <a href="">Discuss</a>
                </div>
            </footer>
        );

        return (
            <>
                {this.state.alert && (
                    <div className="alert">
                        <button onClick={() => this.setState({alert: false})}>X</button>
                        <div>{this.state.message}</div>
                    </div>
                )}
                {this.state.clipboard && (
                    <div id="clipboard" className="alert">
                        <button onClick={() => this.setState({clipboard: false})}>X</button>
                        <div><pre>{this.state.message}</pre></div>
                    </div>
                )}
                <div id="app" className={this.state.alert || this.state.clipboard ? "no-scroll" : ""}>
                    {header}
                    <Sidebar root={sidebarRoot} handleClick={this.handleSidebarClick} />
                    <GameComponent
                        handleAlert={(message: string) => this.setState({alert: true, message})}
                        handleClipboard={(message: string) => this.setState({clipboard: true, message})}
                    />
                    {footer}
                </div>
            </>
        );
    }
}

export default App;