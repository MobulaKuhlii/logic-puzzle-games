import React from "react";
import LogicPuzzleGameT from "../types/logic/game";
import GameWithPanelT from "../types/user-interface/game-with-panel";
import FoldableFieldset from "./foldable-fieldset";
import SettingWithDesc from "./setting-with-desc";
import BrowserTextFileParser from "./browser-text-file-parser";


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
        //private controls: string[];
        private settings: GameWithPanelT.Setting[];
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

            //this.controls = "Check Undo Redo Solve Reset".split(' ');

            this.settings = [
                {
                    cbx: "lock", inp: "lockDelay", suffix: "ms",
                    desc: "Lock or unlock cell's value by holding left-click for specified duration."
                },
                {
                    cbx: "autofold", inp: "autofoldDelay", suffix: "ms",
                    desc: "Fold cell's list and set first matching value when moving cursor outside of it."
                },
                {
                    cbx: "clamp",
                    desc: "Prevent invalid or extreme values for other settings using sensible defaults."
                }
            ];
        }
        componentDidUpdate() {
            if(this.state.parsed) {
                this.setState({ parsed: false });
            } else if(this.state.reset) {
                this.setState({ reset: false });
            }
        }
        /* handleCheck() {
            if(Game.validate(this.state.game)) {
                this.props.handleAlert("Board correct");
            } else {
                this.props.handleAlert("Board incorrect");
            }
        } */
        /* handleUndo() {
            this.setState({ game: this.state.game.undo() });
        } */
        /* handleRedo() {
            this.setState({ game: this.state.game.redo() });
        } */
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
            this.state.game.reset();
            const updated: Partial<GameWithPanelT.State> = all ? {
                symbols: getSymbols(config),
                ...this.initialState,
                reset: true
            } : { reset: true };
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
                    <div id="game-controls">
                        <button onClick={() => this.handleSolve()}>
                            Solve
                        </button>
                        <button onClick={() => this.handleReset()}>
                            Reset
                        </button>
                    </div>
                    <div id="game-panel">
                        <FoldableFieldset legend="Settings">
                            <div className="item-with-desc">
                                <header>
                                    <span>Symbols</span>
                                </header>
                                <section className="desc-text">
                                    Use provided symbols, limited or padded to grid size, instead of default.
                                </section>
                                <label>
                                    <span>Symbols</span>
                                    <input
                                        type="text"
                                        placeholder={this.state.symbols.join("")}
                                        onChange={(e) => this.handleInput("symbols", e)}
                                    ></input>
                                </label>
                            </div>
                            {this.settings.map((props, key) => (
                                <SettingWithDesc
                                    key={key}
                                    {...props}
                                    synced={this.state}
                                    handleInput={(name, e) => this.handleInput(name, e)}
                                />
                            ))}
                            <div id="settings-buttons">
                                <button onClick={() => this.handleReset(true)}>
                                    Reset Everything
                                </button>
                                <button id="apply-button" onClick={(e) => this.applySettings(e)}>
                                    Apply
                                </button>
                            </div>
                        </FoldableFieldset>
                        <FoldableFieldset legend="Game IO">
                            <div className="item-with-desc">
                                <header>
                                    <span>Output</span>
                                </header>
                                <section className="desc-text">
                                    Show current game state as a plain text.
                                </section>
                                <button id="game-output" onClick={() => this.props.handleClipboard(this.outputAsText())}>
                                    Show
                                </button>
                            </div>
                            <div className="item-with-desc">
                                <header>
                                    <span>Input</span>
                                </header>
                                <BrowserTextFileParser handleTextParse={(o) => this.handleTextParse(o)} />
                            </div>
                        </FoldableFieldset>
                    </div>
                </div>
            );
        }
    }
}

export default gameWithPanel;