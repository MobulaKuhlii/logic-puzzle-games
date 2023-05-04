import React from "react";
import GameWithPanelT from "../types/user-interface/game-with-panel";
import PanelT from "../types/user-interface/panel";
import FoldableFieldset from "./foldable-fieldset";
import SettingWithDesc from "./setting-with-desc";
import BrowserTextFileParser from "./browser-text-file-parser";


class Panel extends React.Component<PanelT.Props> {
    private gameSettings: GameWithPanelT.Setting[];

    constructor(props: PanelT.Props) {
        super(props);

        this.gameSettings = [
            {
                name: "lock", inp: "lockDelay", suffix: "ms",
                desc: "Lock or unlock cell's value by holding left-click for specified duration."
            }, {
                name: "autofold", inp: "autofoldDelay", suffix: "ms",
                desc: "Fold cell's list and set first matching value when moving cursor outside of it."
            }, {
                name: "clamp",
                desc: "Prevent invalid or extreme values for other settings using sensible defaults."
            }
        ].filter(st => !this.props.settings || this.props.settings.includes(st.name));
    }

    render(): React.ReactNode {
        return (
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
                                placeholder={this.props.synced.symbols.join("")}
                                onChange={this.props.handleSymbols}
                            ></input>
                        </label>
                    </div>
                    {this.gameSettings.map((props, key) => (
                        <SettingWithDesc
                            key={key}
                            {...props}
                            synced={this.props.synced}
                            handleInput={this.props.handleInput}
                        />
                    ))}
                    <div id="settings-buttons">
                        <button onClick={this.props.handleResetAll}>
                            Reset Everything
                        </button>
                        <button id="apply-button" onClick={this.props.handleApplySettings}>
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
                            Show current game state as plain text.
                        </section>
                        <button id="game-output" onClick={this.props.handleOutput}>
                            Show
                        </button>
                    </div>
                    <div className="item-with-desc">
                        <header>
                            <span>Input</span>
                        </header>
                        <BrowserTextFileParser handleTextParse={this.props.handleTextParse} />
                    </div>
                </FoldableFieldset>
            </div>
        );
    }
}

export default Panel;