import LogicPuzzleGameT from "../types/game";

const toRange = (config: LogicPuzzleGameT.Config): number[] => [...Array(config.size)];
/*
    configuration defaults for sudoku
*/
export const defaults: LogicPuzzleGameT.GameDesc = {
    config: {
        size: 9,
        region: "square"
    },
    symbols: (config) => ["-", ...toRange(config).map((_, i) => (i + 1).toString(36))],
    output: {
        row: '\n',
        value: ' '
    },
    input: {
        row: '\n',
        value: '/ +/'
    }
}

/*
    container for functions describing different regions in sudoku
*/
const regions: {
    [name: string]: (size: number, x: number, y: number) => number[][]
} = {
    square(size, x, y) {
        const peers: number[][] = [];
        const sq = Math.sqrt(size);

        if(!Number.isInteger(sq)) {
            throw new Error("Size is not a perfect square number.");
        }

        for(let i = 0; i < size; i++) {
            if(i !== x) { peers.push([i, y]); }
            if(i !== y) { peers.push([x, i]); }
        }

        const sqrIdx = Math.floor(x / sq) * sq;
        const sqcIdx = Math.floor(y / sq) * sq;

        for(let i = 0; i < sq; i++) {
            for(let j = 0; j < sq; j++) {
                if(sqrIdx + i !== x && sqcIdx + j !== y) {
                    peers.push([sqrIdx + i, sqcIdx + j]);
                }
            }
        }

        return peers;
    },
    squareCross(size, x, y) {
        const peers = regions.square(size, x, y);
        
        const onMainDiag = x === y;
        const onRevDiag = x === size - y - 1;

        if(onMainDiag || onRevDiag) {
            for(let i = 0; i < size; i++) {
                if(onMainDiag && i !== x) { peers.push([i, i]); }
                if(onRevDiag && i !== x) { peers.push([i, size - i - 1]); }
            }
        }

        return peers;
    },
    pentominoHoriz(size, x, y) { return []; },
    pentominoVert(size, x, y) { return []; },
    windoku(size, x, y) { return []; }
}

/*
    class describing a single field / cell in sudoku
    - currently includes implementation details of solver algorithm
*/
class SudokuCell extends LogicPuzzleGameT.Cell {
    private _values: Set<number>;
    private _range: number[];
    public peers: Set<SudokuCell>;

    constructor(range: number[], x: number, y: number) {
        super(x, y);
        this._values = new Set();
        this._range = range;
        this.peers = new Set();
    }

    toString(): string {
        return `Cell(${this.x},${this.y})`;
    }

    open() {
        super.open();
        this._range.forEach(value => this._values.add(value));
    }

    close() {
        this._closed = true;
        if(this._currentValue) {
            this.setValue(this._currentValue);
        }
    }
    
    get value(): number {
        if(!this._closed) {
            return this._currentValue;
        }
        if(this.solved) {
            return this._values.values().next().value;
        }
    }
    
    setValue(index: number): boolean {
        if(!this._closed) {
            this._currentValue = index;
            return false;
        }
        for(const other of this.peers) {
            if(other.solved && other.value === index) {
                return false;
            }
        }
        const oldValues: Set<number> = this._values;
        this._values = new Set<number>().add(index);

        for(const other of this.peers) {
            if(other.values.delete(index)) {
                if(other.solved) {
                    if(!other.setValue(other.value)) {
                        other.values.add(index);
                        this._values = oldValues;
                        return false;
                    }
                } else {
                    other.values.add(index);
                }
            }
        }
        this._currentValue = index;
        return true;
    }

    set values(newValues: Set<number>) {
        this._values = newValues;
    }

    get values(): Set<number> {
        return this._values;
    }

    get solved(): boolean {
        return this._values.size === 1;
    }

    serialize(): string {
        return JSON.stringify(this, (key, value) => {
            if(!key || key === "_currentValue") {
                return value;
            }
        });
    }
    deserialize(text: string) {
        Object.assign(this, JSON.parse(text));
    }
}

/*
    class describing a game of sudoku
    - manages game state
    - provides solver
    - includes helper functions for input / output
*/
class Sudoku implements LogicPuzzleGameT.Game {
    private _grid: SudokuCell[][];

    constructor(config: LogicPuzzleGameT.Config) {
        this.init(config);
    }
    /* re-use instance (for now?) */
    init(config: LogicPuzzleGameT.Config) {

        const createBoard = () => {
            const range: number[] = toRange(config).map(i => i + 1);
            this._grid = range.map(x => range.map(y => new SudokuCell(range, x - 1, y - 1)));
        }

        const populatePeers = () => {
            this._grid.forEach((row, x) => row.forEach((cell, y) =>
                regions[config.region](config.size, x, y).forEach(
                    ([x, y]) => cell.peers.add(this._grid[x][y]))));
        }

        const fillBoard = () => {
            config?.grid?.forEach((row, x) => {
                row.forEach((value, y) => {
                    if(value > 0) {
                        this._grid[x][y].setValue(value);
                    }
                });
            });
        }

        createBoard();
        populatePeers();
        fillBoard();
    }

    getCell(x: number, y: number): SudokuCell {
        return this._grid?.[x]?.[y];
    }

    solve(): boolean {
        this._grid.forEach(row => row.forEach(cell => cell.close()));

        const search = (): boolean => {
            const unsolved: SudokuCell[] = this._grid.flatMap(row => row.filter(cell => !cell.solved));
            if(!unsolved.length) {
                return true;
            }

            const minCell: SudokuCell = unsolved.reduce((c1, c2) => c1.values.size < c2.values.size ? c1 : c2);
            const copy: Set<number>[] = unsolved.map(cell => new Set(cell.values));

            return Array.from(minCell.values).some(index => {
                if(minCell.setValue(index) && search()) {
                    return true;
                }
                copy.forEach((oldIndices, idx) => {
                    unsolved[idx].values = oldIndices;
                });
                return false;
            });
        }

        const result: boolean = search();
        this._grid.forEach(row => row.forEach(cell => cell.open()));

        return result;
    }

    reset() {
        this._grid.forEach(row => row.forEach(cell => cell.setValue(0)));
    }

    output(
        symbols: string[] = defaults.symbols(defaults.config),
        rowSep: string = defaults.output.row,
        valSep: string = defaults.output.value,
    ): string {
        return this._grid.map(row => row.map(cell =>
            symbols[cell.value]).join(valSep)).join(rowSep);
    }

    serialize(): string {
        return JSON.stringify(this, (_key, value) => value?.serialize() ?? value);
    }
    
    deserialize(repr: string) {
        const { board, ...rest }: { board: string[][] } = JSON.parse(repr);

        board.forEach((row, x) => row.forEach((value, y) => this.getCell(x, y).deserialize(value)));

        Object.assign(this, rest);
    }

    parse(
        text: string,
        symbols: string[] = defaults.symbols(defaults.config),
        rowSep: string = defaults.input.row,
        valSep: string = defaults.input.value,
    ) {
        const convert = (val: string): string | RegExp => {
            if(typeof val === "string" && val.length > 1 && val.startsWith('/') && val.endsWith('/')) {
                return new RegExp(val);
            }
            return val;
        }

        const valSepConv: string | RegExp = convert(valSep);
        const grid: number[][] = text.trim().split(convert(rowSep)).map(rowStr =>
            rowStr.split(valSepConv).map(sym => symbols.indexOf(sym)));
        
        const config: LogicPuzzleGameT.Config = { size: grid.length, grid, region: "square" };
        this.init(config);
    }
}

export default Sudoku;