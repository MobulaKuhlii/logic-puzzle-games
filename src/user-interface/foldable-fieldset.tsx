import React from "react";
import FFT from "../types/user-interface/foldable-fieldset";


class FoldableFieldset extends React.Component<FFT.Props, FFT.State> {
    constructor(props: FFT.Props) {
        super(props);
        this.state = {unfolded: true};
    }
    handleClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        this.setState({unfolded: !this.state.unfolded});
    }
    render(): React.ReactNode {
        return (
            <>
                {this.state.unfolded && (
                    <fieldset id={this.props?.id}>
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

export default FoldableFieldset;