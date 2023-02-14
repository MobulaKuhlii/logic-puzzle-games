import React from "react";


type Props = Readonly<{
    text?: string,
    handleTextParse: (text: string) => void,
}>;

type State = Readonly<{
    text: string
}>;


class BrowserTextFileParser extends React.Component<Props, State> {
    private _fileInputRef: React.RefObject<HTMLInputElement>;

    constructor(props: Props) {
        super(props);
        this.state = { text: props?.text ?? "Paste here." };
        this._fileInputRef = React.createRef();
    }
    async handleTextareaInput(event: React.ChangeEvent<HTMLTextAreaElement>) {
        const text = await new Blob([ event.target.value ]).text();
        this.setState({ text });
    }
    async handleFileInput() {
        const { files } = this._fileInputRef.current;
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
                    ref={this._fileInputRef}
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

export default BrowserTextFileParser;