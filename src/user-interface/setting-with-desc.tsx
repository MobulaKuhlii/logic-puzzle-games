import React from "react";
import GameWithPanelT from "../types/user-interface/game-with-panel";


const format = (s: string): string => {
    return s.replace(/^[a-z]*(?=[A-Z])/g, "")
            .replace(/\w+/g, m => m[0].toUpperCase() + m.slice(1).toLowerCase());
}

type Props = GameWithPanelT.Synced & GameWithPanelT.Setting & Readonly<{
    key: number,
    handleInput: (name: string, event: React.ChangeEvent<HTMLInputElement>) => void,
}>;

class SettingWithDesc extends React.Component<Props> {
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