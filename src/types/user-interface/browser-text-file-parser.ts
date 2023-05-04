namespace BrowserTextFileParserT {
    export type Props = Readonly<{
        text?: string,
        handleTextParse: (text: string) => void,
    }>;
    
    export type State = Readonly<{
        text: string
    }>;
}

export default BrowserTextFileParserT;