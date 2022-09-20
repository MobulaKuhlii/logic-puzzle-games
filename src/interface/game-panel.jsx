import React from "react";

class FoldableFieldset extends React.Component {
    constructor(props) {
        super(props);
        this.state = { unfolded: true };
    }
    handleClick(event) {
        event.preventDefault();
        this.setState({ unfolded: !this.state.unfolded });
    }
    render() {
        return (
            <>
                {this.state.unfolded && (
                    <fieldset id={this.props.id}>
                        <legend>{this.props.legend}</legend>
                        {this.props.children}
                    </fieldset>
                )}
                <button
                    className={`ff-button ${this.state.unfolded ? "" : " folded"}`}
                    onClick={(e) => this.handleClick(e)}
                >{this.state.unfolded ? "Hide" : "Show"}</button>
            </>
        );
    }
}

const format = s => {
    return s.replace(/^[a-z]*(?=[A-Z])/g, "")
            .replace(/\w+/g, m => m[0].toUpperCase() + m.slice(1).toLowerCase());
}

class SettingWithDesc extends React.Component {
    render() {
        return (
            <div className="item-with-desc">
                <header>
                    <span>{format(this.props.cbx)}</span>
                </header>
                <section className="desc-text">{this.props.desc}</section>
                {this.props.cbx && (
                    <label>
                        <span>Enabled</span>
                        <input
                            type="checkbox"
                            checked={this.props.synced[this.props.cbx + "Input"]}
                            onChange={(e) => this.props.handleInput(this.props.cbx, e)}
                        ></input>
                    </label>
                )}
                {this.props.inp && (
                    <label>
                        <span>{format(this.props.inp)}</span>
                        <div>
                            <input
                                type="text"
                                placeholder={this.props.synced[this.props.inp]}
                                onChange={(e) => this.props.handleInput(this.props.inp, e)}
                            ></input>
                            <span className="input-suffix">{this.props.suffix}</span>
                        </div>
                    </label>
                )}
            </div>
        );
    }
}

class BrowserTextFileParser extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: "Paste here." };
        this.fileInputRef = React.createRef();
    }
    async handleTextareaInput(event) {
        const text = await new Blob([ event.target.value ]).text();
        this.setState({ text });
    }
    async handleFileInput() {
        const { files } = this.fileInputRef.current;
        const text = await files[0].text();
        this.setState({ text });
    }
    handleClick() {
        this.props.handleTextParse(this.state.text);
    }
    render() {
        return (
            <>
                <section className="desc-text">
                    Paste text or select a local file to parse.
                    Each row of input should be separated by a single newline and each symbol by a one or more spaces.
                    Leading or trailing spaces don&apos;t matter.
                </section>
                <textarea
                    value={this.state.text}
                    onChange={(e) => this.handleTextareaInput(e)}
                />
                <label id="btn-like" htmlFor="file-picker">
                    <div><span>Browse...</span></div>
                </label>
                <input
                    ref={this.fileInputRef}
                    id="file-picker"
                    type="file"
                    accept=".txt"
                    onChange={() => this.handleFileInput()}
                />
                <button onClick={() => this.handleClick()}>Parse</button>
            </>
        );
    }
}

export function gameWithPanel(GameComponent, Game, options) {
    const config = options.config || Game.defaults.config;
    const getSymbols = options.values || Game.defaults.values;

    class GameWithPanel extends React.Component {
        constructor(props) {
            super(props);
            this.clamps = {
                autofoldDelay: { min: 700, max: 1500, default: 1000 },
                lockDelay: { min: 300, max: 1500, default: 700 }
            };
            this.initialState = [
                ["autofold", false],
                ["autofoldDelay", this.clamps.autofoldDelay.default],
                ["clamp", true],
                ["lock", false],
                ["lockDelay", this.clamps.lockDelay.default]
            ].reduce((accum, [key, value]) => (
                { ...accum, [key]: value, [key + "Input"]: value }
            ), {
                clipboard: false,
                parsed: false,
                reset: false
            });
            this.state = {
                game: new Game(config),
                symbols: getSymbols(config),
                symbolsInput: "",
                ...this.initialState
            };
            this.controls = "Check Undo Redo Solve Reset".split(' ');
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
            ]
        }
        componentDidUpdate() {
            if(this.state.parsed) {
                this.setState({ parsed: false });
            } else if(this.state.reset) {
                this.setState({ reset: false });
            }
        }
        handleCheck() {
            if(Game.validate(this.state.game)) {
                this.props.handleAlert("Board correct");
            } else {
                this.props.handleAlert("Board incorrect");
            }
        }
        handleUndo() {
            this.setState({ game: this.state.game.undo() });
        }
        handleRedo() {
            this.setState({ game: this.state.game.redo() });
        }
        handleSolve() {
            const tStart = new Date();
            const solved = this.state.game.solve();
            const tEnd = new Date();
            if(solved) {
                this.props.handleAlert(`Solution found in ${tEnd - tStart}ms.`);
            } else {
                this.props.handleAlert("No solution found.");
            }
        }
        handleReset(all = false) {
            this.state.game.reset();
            const updated = all ? { symbols: getSymbols(config), ...this.initialState } : {};
            updated.reset = true;
            this.setState(updated);
        }
        handleInput(name, event) {
            const prop = name + "Input";
            let value = event.target.value;
            if(name !== "symbols" && !name.includes("Delay")) {
                value = !this.state[prop];
            }
            this.setState({ [prop]: value });
        }
        applySettings(event) {
            event.preventDefault();
            const updated = {};
            const shouldClamp = this.state.clampInput;

            for(const prop in this.state) {
                if(!prop.endsWith("Input")) {
                    continue;
                }
                let value = this.state[prop];
                const name = prop.slice(0, -5);
                if(name === "symbols") {
                    const { config } = this.state.game;
                    const custom = new Set(value);
                    if(custom.size <= config.length) {
                        getSymbols(config).forEach(sym => custom.add(sym));
                    }
                    value = [...custom].slice(0, config.length + 1);
                } else if(name.includes("Delay")) {
                    value = parseInt(value);
                    if(Number.isNaN(value)) {
                        if(shouldClamp) {
                            value = this.clamps[name].default;
                        } else {
                            alert(`Settings not applied. Expected '${name}' to be a number.`);
                            return;
                        }
                    }
                    if(shouldClamp) {
                        const { min, max } = this.clamps[name];
                        value = Math.min(Math.max(min, value), max);
                    }
                }
                updated[name] = value;
            }

            this.setState(updated);
        }
        handleTextParse(text) {
            this.state.game.parseText(text, { values: this.state.symbols });
            this.setState({ parsed: true });
        }
        outputAsText() {
            return this.state.game.output({ values: this.state.symbols });
        }
        render() {
            return (
                <div id="game-with-panel">
                    <GameComponent synced={this.state} />
                    <div id="game-controls">
                        {this.controls.map((name, idx) => (
                            <button key={idx} onClick={() => this["handle" + name]()}>
                                {name}
                            </button>
                        ))}
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
                                    handleInput={(...args) => this.handleInput(...args)}
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

    GameWithPanel.displayName = options.displayName;

    return GameWithPanel;
}