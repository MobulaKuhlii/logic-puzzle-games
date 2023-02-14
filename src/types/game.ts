export namespace LogicPuzzleGameT {
    export type Config = Readonly<{
        size?: number,
        grid?: Readonly<Readonly<number[]>[]>,
        region?: string
    }>;

    export type GameDesc = Readonly<{
        config: Config,
        symbols: (config: Config) => string[],
        output: {
            row: string,
            value: string
        },
        input: {
            row: string,
            value: string
        }
    }>;

    export abstract class Cell {
        public x: number;
        public y: number;
        protected _closed: boolean;
        protected _currentValue: number;
    
        constructor(x: number, y: number) {
            this.x = x;
            this.y = y;
            this._closed = false;
            this._currentValue = 0;
        }
        abstract get solved(): boolean;
        abstract get value(): number;
        abstract setValue(index: number): boolean;
        abstract serialize(): string;
        abstract deserialize(repr: string): void;
        open() {
            this._closed = false;
        }
        close() {
            this._closed = true;
            if(this._currentValue > 0) {
                this.setValue(this._currentValue);
            }
        }
        toString(): string {
            return `Cell(${this.x},${this.y})`;
        }
    }

    export interface Game {
        getCell(x: number, y: number): Cell;
        solve(): boolean;
        reset(): void;
        output(symbols?: string[], rowSep?: string, colSep?: string): string;
        serialize(): string;
        deserialize(repr: string): void;
        parse(text: string, symbols?: string[], rowSep?: string, colSep?: string): void;
    }

    /*
        helper type which ensures that return value of
        constructor function (or simply - class instance)
        is of the parameterized type T;
        argument signature specific for single argument
    */
    type Ensure<A, T> = new (arg: A) => T;

    /*
        type of Game class which uses a helper type above to ensure
        that all instances of GameT implement the Game interface
    */
    export type GameT = Ensure<Config, Game>;
}

export default LogicPuzzleGameT;