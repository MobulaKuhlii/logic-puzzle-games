import LogicPuzzleGameT from "../types/logic/game";


/*
    configuration defaults for sudoku
*/
export const defaults: LogicPuzzleGameT.GameDesc = {
    config: {
        size: 9,
        region: "square",
        algo: "cps"
    },
    symbols: (config) => [
        "-", ...Array.from({length: config.size}, (_, i) => (i + 1).toString(36))
    ],
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
    generator functions for peers of a cell based on a selected region type
*/
type ReGenT = (size: number, y: number, x: number) => Generator<number[]>;

const regions: { [name: string]: ReGenT } = {
    *square(size, y, x) {
        const k = Math.sqrt(size);

        if(!Number.isInteger(k)) {
            return;
        }

        for(let i = 0; i < size; i++) {
            if(i !== y) { yield [i, x]; }
            if(i !== x) { yield [y, i]; }
        }

        const ky = Math.floor(y / k) * k;
        const kx = Math.floor(x / k) * k;

        for(let i = 0; i < k; i++) {
            for(let j = 0; j < k; j++) {
                if(ky + i !== y && kx + j !== x) {
                    yield [ky + i, kx + j];
                }
            }
        }
    },
    *squareCross(size, y, x) {
        yield* regions.square(size, y, x);
        
        const onMainDiag = (y === x);
        const onRevDiag = (y === size - x - 1);

        if(onMainDiag || onRevDiag) {
            for(let i = 0; i < size; i++) {
                if(onMainDiag && i !== y) { yield [i, i]; }
                if(onRevDiag && i !== y) { yield [i, size - i - 1]; }
            }
        }
    } /*,
    *pentominoHoriz(size, y, x) {},
    *pentominoVert(size, y, x) {},
    *windoku(size, y, x) {} */
}


/*
    describes a single cell of sudoku game
    with CPS algorithm specific implementation
*/
class CellCPS extends LogicPuzzleGameT.Cell {
    private _msize: number;
    public indices: Set<number>;
    public peers: Set<CellCPS>;

    constructor(size: number, y: number, x: number) {
        super(y, x);
        this._msize = size + 1;
        this.peers = new Set();
    }

    get solved(): boolean {
        return this.indices.size === 1;
    }

    getIndex(): number {
        if(!this._locked) { return this._index; }
        if(this.solved) { return [...this.indices].pop(); }
    }

    setIndex(index: number) {
        if(!this._locked) {
            this._index = index;
            return false;
        }

        for(const other of this.peers) {
            if(other.solved && other.getIndex() === index) {
                return false;
            }
        }

        const indicesRef = this.indices;
        this.indices = new Set<number>().add(index);

        for(const other of this.peers) {
            if(other.indices.delete(index)) {
                if(other.solved) {
                    if(!other.setIndex(other.getIndex())) {
                        other.indices.add(index);
                        this.indices = indicesRef;
                        return false;
                    }
                } else {
                    other.indices.add(index);
                }
            }
        }

        this._index = index;
        return true;
    }

    lock() {
        super.lock();
        if(this._index > 0) {
            this.setIndex(this._index);
        }
    }

    unlock() {
        super.unlock();
        this.indices = new Set(Array(this._msize).keys());
    }
}


class Sudoku implements LogicPuzzleGameT.Game {
    private _grid: CellCPS[][];
    private _algo: string;

    constructor(config = defaults.config) {
        const createBoard = () => {
            const it = {length: config.size};
            this._grid = Array.from(it, (_, y) =>
                Array.from(it, (_, x) => new CellCPS(config.size, y, x)));
        }

        const populatePeers = () => {
            const reGen = regions[config.region];
            this._grid.forEach((row, y) => {
                row.forEach((cell, x) => {
                    for(const [yy, xx] of reGen(config.size, y, x)) {
                        cell.peers.add(this._grid[yy][xx]);
                    }
                });
            });
        }

        const fillBoard = () => {
            config?.grid?.forEach((row, y) => {
                row.forEach((idx, x) => {
                    if(idx > 0) { this._grid[x][y].setIndex(idx); }
                });
            });
        }

        createBoard();
        populatePeers();
        fillBoard();
        this._algo = config?.algo ?? defaults.config.algo;
    }

    getIndex(y: number, x: number) {
        return this._grid?.[y]?.[x]?.getIndex();
    }

    setIndex(y: number, x: number, index: number): boolean {
        return Boolean(this._grid?.[y]?.[x]?.setIndex(index));
    }

    solve(algo = this._algo): boolean {
        if(algo === "cps") {
            return this._cps();
        }
        return false;
    }

    private _cps(): boolean {
        this._grid.forEach(row => row.forEach(cell => cell.lock()));

        const search = (): boolean => {
            const unsolved = this._grid.flatMap(row => row.filter(cell => !cell.solved));
            if(!unsolved.length) {
                return true;
            }

            const minCell = unsolved.reduce((c1, c2) => c1.indices.size < c2.indices.size ? c1 : c2);
            const copy = unsolved.map(cell => new Set(cell.indices));

            return Array.from(minCell.indices).some(idx => {
                if(minCell.setIndex(idx) && search()) {
                    return true;
                }
                copy.forEach((indicesPrev, i) => {
                    unsolved[i].indices = indicesPrev;
                });
                return false;
            });
        }

        const result: boolean = search();
        this._grid.forEach(row => row.forEach(cell => cell.unlock()));

        return result;
    }

    output(
        symbols: string[] = defaults.symbols(defaults.config),
        rSep: string = defaults.output.row,
        vSep: string = defaults.output.value,
    ): string {
        return this._grid.map(row => row.map(cell =>
            symbols[cell.getIndex()]).join(vSep)).join(rSep);
    }

    parse(
        text: string,
        symbols: string[] = defaults.symbols(defaults.config),
        rSep: string = defaults.input.row,
        vSep: string = defaults.input.value,
    ): LogicPuzzleGameT.Config {
        const convert = (sep: string): RegExp | string =>
            /^\/.+\/$/.test(sep) ? new RegExp(sep) : sep;

        const vSepConv = convert(vSep);
        const grid = text.trim().split(convert(rSep)).map(rowStr =>
            rowStr.split(vSepConv).map(sym => symbols.indexOf(sym)));

        return {
            grid,
            size: grid.length,
            region: "square"
        };
    }

    /* static validate(grid: number[][], region = "square") {} */
}

export default Sudoku;