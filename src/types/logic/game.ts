export namespace LogicPuzzleGameT {
    export type Config = Readonly<Partial<{
        size: number,
        grid: Readonly<Readonly<number[]>[]>,
        region: string,
        algo: string
    }>>;

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
        public readonly y: number;
        public readonly x: number;
        protected _index: number;
        /* locks cell while solving to prevent mutation */
        protected _locked: boolean;
    
        /* uses mathematical notation for axes */
        constructor(y: number, x: number, index = 0, locked = false) {
            this.y = y;
            this.x = x;
            this._index = index;
            this._locked = locked;
        }
        
        abstract getIndex(): number;
        abstract setIndex(index: number): boolean;

        lock() {
            this._locked = true;
        }
        unlock() {
            this._locked = false;
        }
        
        toString(): string {
            return `(${this.y},${this.x}):${this._locked ? '*' : ' '}${this._index}`;
        }
    }

    export interface Game {
        getIndex(y: number, x: number): number;
        setIndex(y: number, x: number, index :number): boolean; // returns if success
        solve(name?: string): boolean; // returns if success
        output(symbols?: string[], rowSep?: string, colSep?: string): string;
        parse(text: string, symbols?: string[], rowSep?: string, colSep?: string): void;
    }

    /*
        helper type ensures that the return value of
        constructor function (or simply - class instance)
        is of the parameterized type T;
        argument signature specialized for a single argument
    */
    type Ensure<A, T> = new (arg: A) => T;

    /*
        type of Game class uses the helper type above to ensure
        that all instances of GameT implement the Game interface
    */
    export type GameT = Ensure<Config, Game>;
}

export default LogicPuzzleGameT;