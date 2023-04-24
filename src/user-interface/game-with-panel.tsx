import React from "react";
import LogicPuzzleGameT from "../types/logic/game";
import GameWithPanelT from "../types/user-interface/game-with-panel";
import GameControls from "./game-controls";
import Panel from "./panel";


function gameWithPanel(
    GameComponent: React.ComponentClass<GameWithPanelT.Synced>,
    Game: LogicPuzzleGameT.GameT,
    displayName: string,
    desc: LogicPuzzleGameT.GameDesc
): React.ComponentClass<GameWithPanelT.Props, GameWithPanelT.State> {

    const config = desc?.config;
    const getSymbols = desc?.symbols;

    return class GameWithPanel extends React.Component<
        GameWithPanelT.Props, GameWithPanelT.State
    > {
        private initialState: GameWithPanelT.InitialState;
        private clamps: { [name: string]: { min: number, max: number, default: number } };
        public displayName: string;

        constructor(props: GameWithPanelT.Props) {
            super(props);

            this.displayName = displayName;

            this.clamps = {
                autofoldDelay: { min: 700, max: 1500, default: 1000 },
                lockDelay: { min: 300, max: 1500, default: 700 }
            };

            this.initialState = {
                autofold: { on: false, input: false },
                autofoldDelay: { value: this.clamps.autofoldDelay.default.toString(), input: false },
                clamp: { on: true, input: false },
                lock: { on: false, input: false },
                lockDelay: { value: this.clamps.lockDelay.default.toString(), input: false },
                clipboard: false,
                parsed: false,
                reset: false
            };

            this.state = {
                config,
                game: new Game(config),
                symbols: getSymbols(config),
                symbolsInput: "",
                ...this.initialState
            };
        }
        componentDidUpdate() {
            if(this.state.parsed) {
                this.setState({ parsed: false });
            } else if(this.state.reset) {
                this.setState({ reset: false });
            }
        }
        handleSolve() {
            const tStart = Number(new Date());
            const solved = this.state.game.solve();
            const tEnd = Number(new Date());
            if(solved) {
                this.props.handleAlert(`Solution found in ${tEnd - tStart}ms.`);
            } else {
                this.props.handleAlert("No solution found.");
            }
        }
        handleReset(all = false) {
            const updated: Partial<GameWithPanelT.State> = all ? {
                game: new Game(config),
                symbols: getSymbols(config),
                symbolsInput: "",
                ...this.initialState,
                reset: true
            } : {
                game: new Game(config),
                reset: true
            };
            this.setState(updated);
        }
        handleInput(name: string, event: React.ChangeEvent<HTMLInputElement>) {
            const value = event.target.value;
            if(name.includes("symbols") || name.includes("Delay")) {
                this.setState({ [name]: name === "symbols" ? value.split("") : value });
            } else {
                const option = this.state[name] as GameWithPanelT.Option;
                this.setState({ [name]: { ...option, input: !option.input } });
            }
        }
        applySettings(event: React.MouseEvent<HTMLButtonElement>) {
            event.preventDefault();
            const shouldClamp = this.state.clamp.on;

            this.setState(Object.keys(this.state).reduce((updated, prop) => {
                if(prop === "symbolsInput") {
                    const { config } = this.state;
                    const custom = new Set(this.state[prop]);
                    if(custom.size <= config.size) {
                        getSymbols(config).forEach(sym => custom.add(sym));
                    }
                    return { ...updated, symbolsInput: [...custom].slice(0, config.size + 1) };
                }
                if(!this.state[prop].hasOwnProperty("input")) {
                    return updated;
                }
                const option = this.state[prop] as GameWithPanelT.Option;
                if(prop.includes("Delay")) {
                    let value = parseInt(option.value);
                    if(Number.isNaN(value)) {
                        if(shouldClamp) {
                            value = this.clamps[prop].default;
                        } else {
                            alert(`Settings not applied. Expected '${prop}' to be a number.`);
                            return;
                        }
                    }
                    if(shouldClamp) {
                        const { min, max } = this.clamps[prop];
                        value = Math.min(Math.max(min, value), max);
                    }
                    return { ...updated, [prop]: { ...option, value: value.toString() } };
                }
                return { ...updated, [prop]: { ...option, on: !option.on } };
            }, {}));
        }
        handleTextParse(text: string) {
            this.state.game.parse(text, this.state.symbols);
            this.setState({ parsed: true });
        }
        outputAsText() {
            return this.state.game.output(this.state.symbols);
        }
        render(): React.ReactNode {
            return (
                <div id="game-with-panel">
                    <GameComponent synced={this.state} />
                    <GameControls
                        handleSolve={() => this.handleSolve()}
                        handleReset={() => this.handleReset()}
                    />
                    <Panel
                        synced={this.state}
                        handleSymbols={this.handleInput.bind(this, "symbols")}
                        handleInput={(name, e) => this.handleInput(name, e)}
                        handleResetAll={() => this.handleReset(true)}
                        handleApplySettings={(e) => this.applySettings(e)}
                        handleOutput={() => this.props.handleClipboard(this.outputAsText())}
                        handleTextParse={(o) => this.handleTextParse(o)}
                    />
                </div>
            );
        }
    }
}

export default gameWithPanel;