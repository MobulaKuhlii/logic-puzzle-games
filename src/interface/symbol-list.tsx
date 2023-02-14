import React from "react";
import SymbolListT from "../types/symbol-list";

class SymbolList extends React.Component<SymbolListT.Props, SymbolListT.State> {
    private _inputRef: React.RefObject<HTMLInputElement>;

    constructor(props: SymbolListT.Props) {
        super(props);
        this.state = {
            unfolded: false,
            locked: false,
            prefix: ""
        };
        this._inputRef = React.createRef();
    }
    componentDidUpdate() {
        if(this.props.synced.parsed) {
            this.setState({ locked: this.props.synced.lock.on && this.props.getIndex() > 0 });
        } else if(this.props.synced.reset) {
            this.setState({ unfolded: false, locked: false, prefix: "" });
        }
    }
    handleMouseDown() {
        if(this.state.unfolded) {
            this.setState({ blur: false });
        } else if(this.props.synced.lock.on) {
            this.setState({ lockTimer: new Date() });
        }
    }
    handleMouseUp(index: number) {
        if(
            this.state.unfolded || !this.props.synced.lock.on ||
            Number(new Date()) - Number(this.state.lockTimer) < Number(this.props.synced.lockDelay.value)
        ) {
            if(this.state.locked) {
                return;
            }
            if(this.state.unfolded) {
                this.props.setIndex(index);
            }
            this.setState({ unfolded: !this.state.unfolded, blur: true, prefix: "" });
        } else {
            this.setState({ locked: !this.state.locked });
        }
    }
    handleMouseLeave() {
        if(this.state.locked || !this.state.unfolded || !this.props.synced.autofold.on) {
            return;
        }
        const index = Math.max(0, this.props.synced.symbols.findIndex(sym =>
            sym.startsWith(this.state.prefix)
        ));
        this.props.setIndex(index);
        setTimeout(() => {
            this.setState({ unfolded: false, prefix: "" });
        }, Number(this.props.synced.autofoldDelay.value));
    }
    handleInput(event: React.FormEvent<HTMLInputElement>) {
        const prefix: string = this._inputRef.current.value;
        this.setState({ prefix });
        event.preventDefault();
    }
    handleInputMouseOver() {
        this._inputRef.current.focus();
    }
    handleBlur(event: React.FocusEvent<HTMLElement, Element>) {
        if(this.state.blur) {
            this.setState({ unfolded: false });
        } else {
            event.preventDefault();
        }
    }
    buildList() {
        let ls = [...this.props.synced.symbols.keys()];
        if(this.state.prefix) {
            ls = ls.filter(i => this.props.synced.symbols[i].startsWith(this.state.prefix));
            if(ls.length < 1) {
                ls[0] = 0;
            }
        } else if(!this.state.unfolded) {
            ls.length = 1;
            ls[0] = this.props.getIndex();
        }
        return ls;
    }
    render(): React.ReactNode {
        const itemClassName: string = [
            "sl-item",
            this.state.unfolded && "on-top",
            this.state.locked && "locked"
        ].filter(Boolean).join(' ');

        const topInput = this.state.unfolded && (
            <li id="sl-input-wrapper">
                <input
                    ref={this._inputRef}
                    type="text"
                    onInput={(e) => this.handleInput(e)}
                    onMouseOver={() => this.handleInputMouseOver()}
                ></input>
            </li>
        );
        const symbols = this.buildList().map((index, key) => (
            <li
                key={key}
                className={itemClassName + (key > 0 && index === this.props.getIndex() ? " selected" : "")}
                onMouseDown={() => this.handleMouseDown()}
                onMouseUp={() => this.handleMouseUp(index)}
            >
                <span>{this.props.synced.symbols[index]}</span>
            </li>)
        );

        return (
            <menu
                className={"symbol-list " + this.props.className}
                onMouseLeave={(_e) => this.handleMouseLeave()}
                onBlur={(e) => this.handleBlur(e)}
            >
                {topInput}
                {symbols}
            </menu>
        );
    }
}

export default SymbolList;