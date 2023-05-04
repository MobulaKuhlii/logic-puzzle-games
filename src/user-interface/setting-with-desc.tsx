import React from "react";
import GameWithPanelT from "../types/user-interface/game-with-panel";
import SettingWithDescT from "../types/user-interface/setting-with-desc";


const format = (s: string): string => {
    return s.replace(/^[a-z]*(?=[A-Z])/g, "")
            .replace(/\w+/g, m => m[0].toUpperCase() + m.slice(1).toLowerCase());
}

class SettingWithDesc extends React.Component<SettingWithDescT.Props> {
    render() {
        return (
            <div className="item-with-desc">
                <header>
                    <span>{format(this.props.name)}</span>
                </header>
                <section className="desc-text">{this.props.desc}</section>
                {this.props.name && (
                    <label>
                        <span>Enabled</span>
                        <input
                            type="checkbox"
                            checked={(
                                this.props.synced[this.props.name] as GameWithPanelT.Option
                            ).input}
                            onChange={(e) => this.props.handleInput(this.props.name, e)}
                        ></input>
                    </label>
                )}
                {this.props.inp && (
                    <label>
                        <span>{format(this.props.inp)}</span>
                        <div>
                            <input
                                type="text"
                                placeholder={(
                                    this.props.synced[this.props.inp] as GameWithPanelT.Option
                                ).value.toString()}
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

export default SettingWithDesc;