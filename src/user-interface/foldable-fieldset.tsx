import React from "react";


type Props = Readonly<{
    legend: string,
    id?: string,
    children: React.ReactNode[]
}>;

type State = Readonly<{
    unfolded: boolean
}>;


class FoldableFieldset extends React.Component<Props, State> {
    constructor(props: Props) {
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