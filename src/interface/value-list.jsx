import React from "react";

export class ValueList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            unfolded: false,
            locked: false,
            prefix: ""
        };
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }
    componentDidUpdate() {
        if(this.props.synced.textInputFlag) {
            this.props.toggleFlag("textInputFlag");
            this.setState({ locked: this.props.getCell() > 0 });
        } else if(this.props.synced.resetFlag) {
            this.props.toggleFlag("resetFlag");
            this.setState({ unfolded: false, locked: false, prefix: "" });
            if(!this.props.autoFoldFlag) {
                this.props.toggleFlag("autoFoldFlag");
            }
        }
    }
    handleMouseDown() {
        if(!this.state.unfolded) {
            this.setState({ timerStart: new Date() });
        }
    }
    handleMouseUp(index) {
        if(this.state.unfolded || new Date() - this.state.timerStart < this.props.lockDelay) {
            if(this.state.locked) {
                return;
            }
            if(this.state.unfolded) {
                this.props.setCell(index);
            }
            this.setState({ unfolded: !this.state.unfolded, prefix: "" });
        } else {
            this.setState({ locked: !this.state.locked });
        }
    }
    handleMouseLeave(event) {
        event.preventDefault();
        if(this.state.locked || !this.state.unfolded || !this.props.synced.autoFoldFlag) {
            return;
        }
        const index = this.props.synced.values.findIndex(val => val.startsWith(this.state.prefix));
        if(index > 0 && index !== this.props.getCell()) {
            this.props.setCell(index);
        }
        setTimeout(() => {
            this.setState({ unfolded: false, prefix: "" });
        }, this.props.synced.autoFoldDelay);
    }
    handleInput(event) {
        this.setState({ prefix: event.target.value });
    }
    handleInputMouseOver() {
        document.getElementById("value-list-input").focus();
    }
    render() {
        const currentValue = this.props.getCell();
        let ordered = Array.from(this.props.synced.values.keys());
        
        if(this.state.prefix) {
            ordered = ordered.filter(idx => this.props.synced.values[idx].startsWith(this.state.prefix));
            if(ordered.length < 1) {
                ordered.push(0);
            }
        } else {
            ordered[0] = currentValue;
            ordered[currentValue] = 0;
        }

        let className = "value-list-item";
        if(this.state.unfolded) {
            className += " on-top";
        } else if(this.state.locked) {
            className += " locked";
        }

        const topItem = this.state.unfolded && (<input
            id="value-list-input"
            className={className}
            type="text"
            onInput={this.handleInput}
            onMouseOver={this.handleInputMouseOver}
        ></input>);

        const items = (this.state.unfolded ? ordered : [currentValue]).map((valueIndex, idx) => (<div
            key={idx}
            className={className}
            onMouseDown={this.handleMouseDown}
            onMouseUp={this.handleMouseUp.bind(this, valueIndex)}>
            <span>{this.props.synced.values[valueIndex]}</span>
        </div>));

        return (
            <div className={"value-list " + this.props.className} onMouseLeave={this.handleMouseLeave}>
                {topItem}
                {items}
            </div>
        );
    }
}