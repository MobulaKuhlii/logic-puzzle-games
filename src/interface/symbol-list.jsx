import React from "react";

export class SymbolList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unfolded: false,
            locked: false,
            prefix: ""
        };
        this.inputRef = React.createRef();
    }
    componentDidUpdate() {
        if(this.props.synced.parsed) {
            this.setState({ locked: this.props.synced.lock && this.props.getIndex() > 0 });
        } else if(this.props.synced.reset) {
            this.setState({ unfolded: false, locked: false, prefix: "" });
        }
    }
    handleMouseDown() {
        if(this.state.unfolded) {
            this.setState({ blur: false });
        } else if(this.props.synced.lock) {
            this.setState({ lockTimer: new Date() });
        }
    }
    handleMouseUp(index) {
        if(
            this.state.unfolded || !this.props.synced.lock ||
            new Date() - this.state.lockTimer < this.props.synced.lockDelay
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
        if(this.state.locked || !this.state.unfolded || !this.props.synced.autofold) {
            return;
        }
        const index = Math.max(0, this.props.synced.symbols.findIndex(sym =>
            sym.startsWith(this.state.prefix)
        ));
        this.props.setIndex(index);
        setTimeout(() => {
            this.setState({ unfolded: false, prefix: "" });
        }, this.props.synced.autofoldDelay);
    }
    handleInput(event) {
        this.setState({ prefix: event.target.value });
    }
    handleInputMouseOver() {
        this.inputRef.current.focus();
    }
    handleBlur(event) {
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
    render() {
        const itemClassName = [
            "sl-item",
            this.state.unfolded && "on-top",
            this.state.locked && "locked"
        ].filter(Boolean).join(' ');

        const topInput = this.state.unfolded && (
            <li id="sl-input-wrapper">
                <input
                    ref={this.inputRef}
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
                onMouseLeave={(e) => this.handleMouseLeave(e)}
                onBlur={(e) => this.handleBlur(e)}
            >
                {topInput}
                {symbols}
            </menu>
        );
    }
}