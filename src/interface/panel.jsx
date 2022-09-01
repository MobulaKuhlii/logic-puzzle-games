import React from "react";

class BrowserTextFileParser extends React.Component {
    constructor(props) {
        super(props);
        this.state = { text: "Paste here." };

        this.handleTextInput = this.handleTextInput.bind(this);
        this.handleFileInput = this.handleFileInput.bind(this);
        this.handleTextParse = this.handleTextParse.bind(this);
    }
    async handleTextInput(event) {
        const text = await new Blob([ event.target.value ]).text();
        this.setState({ text });
    }
    async handleFileInput() {
        const { files } = document.getElementById("file-picker");
        const text = await files[0].text();
        this.setState({ text });
    }
    handleTextParse() {
        this.props.onTextParse(this.state);
    }
    handleOption(prop, event) {
        this.setState({ [prop]: event.value.target });
    }
    render() {
        return (
            <div id="text-file-parser">
                <span>Paste or select a local file to parse and click the button or save current board state as a text file.</span>
                <textarea value={this.state.text} onChange={this.handleTextInput} />
                <input type="file" id="file-picker" accept=".txt" onChange={this.handleFileInput} />
                {this.props.textParseOptions.map(({prop, label}, idx) => (
                    <div key={idx}>
                        <label htmlFor={"text-parse-option-" + idx}>{label}</label>
                        <input id={"text-parse-option-" + idx} onChange={this.handleOption.bind(this, prop)}></input>
                    </div>
                ))}
                <button onClick={this.handleTextParse}>Parse</button>
            </div>
        );
    }
}

class BrowserFileSaver extends React.Component {
    constructor(props) {
        super(props);
        this.saveAsTextFile = this.saveAsTextFile.bind(this);
    }
    // violates react practices
    saveAsTextFile() {
        const text = this.props.onTextOutput();
        const blob = new Blob([ text ]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = this.props.fileName;
        document.body.appendChild(a);
        a.click();
        document.removeChild(a);
        URL.revokeObjectURL(blob);
    }
    render() {
        return (
            <button onClick={this.saveAsTextFile}>Save</button>
        );
    }
}

export function withPanel(GameComponent, Game, options) {
    const getValues = options.values || Game.defaults.values;

    class WithPanel extends React.Component {
        constructor(props) {
            super(props);
            const config = options.config || Game.defaults.config;
            this.state = {
                game: new Game(config),
                values: getValues(config),
                textInputFlag: false,
                resetFlag: false,
                autoFoldFlag: true,
                autoFoldDelay: 1000,
                boardSize: 9,
                boardSizeInput: 9
            };
            
            const propsToBind = ("toggleFlag handleTextInput handleTextOutput handleReset handleSolve handleCheck " +
            "handleUndo handleRedo handleValues handleAutoFoldDelay confirmSettings");
            
            propsToBind.split(' ').forEach(prop => {
                this[prop] = this[prop].bind(this);            
            });
        }
        toggleFlag(flag) {
            this.setState({ [flag]: !this.state[flag] });
        }
        handleTextInput({ text, ...options }) {
            this.state.game.parseText(text, { values: this.state.values, ...options });
            this.setState({ textInputFlag: true });
        }
        handleTextOutput() {
            return this.state.game.output({ values: this.state.values });
        }
        handleReset() {
            this.state.game.reset();
            this.setState({
                values: getValues(this.state.game.config),
                resetFlag: true
            });
        }
        handleSolve() {
            const tStart = performance.now();
            const solved = this.state.game.solve();
            const tEnd = performance.now();
            console.log(`solution search took ${tEnd - tStart}ms`);
            if(solved) {
                alert("Solution found.");
            } else {
                alert("No solution found.");
            }
            this.setState({}); // force re-render
        }
        handleCheck() {
            if(Game.validate(this.state.game)) {
                alert("Board correct");
            } else {
                alert("Board incorrect");
            }
        }
        handleUndo() {
            this.setState({ game: this.state.game.undo() });
        }
        handleRedo() {
            this.setState({ game: this.state.game.redo() });
        }
        handleValues(event) {
            const { config } = this.state.game;
            const custom = new Set(event.target.value);
            if(custom.size <= config.length) {
                this.state.values.forEach(val => custom.add(val));
            }
            if(custom.size <= config.length) {
                getValues(config).forEach(val => custom.add(val));
            }
            this.setState({ values: Array.from(custom).slice(0, config.length + 1) });
        }
        handleAutoFoldDelay(event) {
            this.setState({ autoFoldDelayInput: event.target.value });
        }
        handleBoardSize(value) {
            this.setState({ boardSizeInput: value });
        }
        confirmSettings(event) {
            event.preventDefault();
            const upSt = {};
            if(this.state.autoFoldDelayInput) {
                upSt.autoFoldDelay = this.state.autoFoldDelayInput;
            }
            if(this.state.boardSizeInput && this.state.boardSizeInput !== this.state.boardSize) {
                upSt.boardSize = this.state.boardSizeInput;
                upSt.game = new Game({ length: upSt.boardSize });
                upSt.values = getValues(upSt.game.config);
            }
            this.setState(upSt);
        }
        render() {
            const valueSetting = (
                <div id="value-setting">
                    <fieldset>
                        <legend>Values</legend>
                        <input
                            type="text" id="values-txt"
                            placeholder={this.state.values.join("")}
                            onChange={this.handleValues}
                        ></input>
                    </fieldset>
                </div>
            );

            const boardSizeSetting = (
                <div id="board-size-setting">
                    <fieldset>
                        <legend>Board size</legend>
                        {options.boardSizes.map((val, idx) => (
                            <div key={idx}>
                                <input
                                    type="radio" id={"size-" + val}
                                    onChange={this.handleBoardSize.bind(this, val)}
                                    checked={this.state.boardSizeInput === val}
                                    disabled={val !== 9}
                                ></input>
                                <label htmlFor={"size-" + val}>{val}{val !== 9 && (<span> (WIP)</span>)}</label>
                            </div>
                        ))}
                    </fieldset>
                </div>
            );

            const autoFoldSetting = (
                <div id="autofold-setting">
                    <fieldset>
                        <legend>Autofold</legend>
                        <div>
                            <label htmlFor="autofold-cbx">Enabled</label>
                            <input
                                type="checkbox" id="autofold-cbx"
                                checked={this.state.autoFoldFlag}
                                onChange={this.toggleFlag.bind(this, "autoFoldFlag")}
                            ></input>
                        </div>
                        <div>
                            <label htmlFor="af-delay-txt">Delay</label>
                            <input
                                type="text" id="af-delay-txt"
                                placeholder={this.state.autoFoldDelay + "ms"}
                                onChange={this.handleAutoFoldDelay}
                            ></input>
                        </div>
                    </fieldset>
                </div>
            );

            return (
                <div id="game-component">
                    <GameComponent
                        synced={this.state}
                        toggleFlag={this.toggleFlag}
                        {...options.props}
                    />
                    <div id="game-panel">
                        <div id="settings">
                            <fieldset>
                                <legend className="legend-header">Settings</legend>
                                <span>You can (un)lock cell by holding left-click on it.</span>
                                {valueSetting}
                                {boardSizeSetting}
                                {autoFoldSetting}
                                <button id="apply-button" onClick={this.confirmSettings}>Apply</button>
                            </fieldset>
                        </div>
                        <div id="file-io">
                            <fieldset>
                                <legend className="legend-header">Controls</legend>
                                <div id="control-buttons">
                                    <button onClick={this.handleCheck}>Check</button>
                                    <button onClick={this.handleUndo}>Undo</button>
                                    <button onClick={this.handleRedo}>Redo</button>
                                    <button onClick={this.handleSolve}>Solve</button>
                                    <button onClick={this.handleReset}>Reset</button>
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend className="legend-header">File Input / Output</legend>
                                <BrowserTextFileParser
                                    onTextParse={this.handleTextInput}
                                    textParseOptions={options.textInputOptions || []}
                                />
                                <BrowserFileSaver
                                    onTextOutput={this.handleTextOutput}
                                    fileName={options.displayName}
                                />
                            </fieldset>
                        </div>
                    </div>
                </div>
            );
        }
    }

    WithPanel.displayName = options.displayName;

    return WithPanel;
}