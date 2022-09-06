import { useHistorian } from "./historian.mjs";

function SudokuCell(config) {
    const indexRange = Array.from(config, (_, i) => i + 1);

    return class Cell {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.peers = new Set();
            this.initial = 0;
            this.indices = new Set();
            this.open();
        }
        toString() {
            return `Cell(${this.x},${this.y})`;
        }
        get solved() {
            return this.indices.size === 1;
        }
        get value() {
            if(!this.closed) {
                return this.initial;
            }
            if(this.solved) {
                return this.indices.values().next().value;
            }
        }
        open() {
            this.closed = false;
            indexRange.forEach(value => this.indices.add(value));
        }
        close() {
            this.closed = true;
            if(this.initial) {
                this.setValue(this.initial);
            }
        }
        setValue(index) {
            if(!this.closed) {
                this.initial = index;
                return false;
            }
            for(const other of this.peers) {
                if(other.solved && other.value === index) {
                    return false;
                }
            }
            const oldIndices = this.indices;
            this.indices = new Set().add(index);

            for(const other of this.peers) {
                if(other.indices.delete(index)) {
                    if(other.solved) {
                        if(!other.setValue(other.value)) {
                            other.indices.add(index);
                            this.indices = oldIndices;
                            return false;
                        }
                    } else {
                        other.indices.add(index);
                    }
                }
            }
            this.initial = index;
            return true;
        }
        serialize() {
            return JSON.stringify(this, (key, value) => {
                if(!key || key == "initial") {
                    return value;
                }
            });
        }
        deserialize(text) {
            Object.assign(this, JSON.parse(text));
        }
    };
}

class SudokuClass {
    constructor(config) {
        this.init(config);
    }

    init(config) {
        this.config = { length: config.length };

        const createBoard = () => {
            const Cell = SudokuCell(config);
            this.board = Array.from(config, (_, x) =>
                Array.from(config, (_, y) => new Cell(x, y)));
        }

        const populatePeers = () => {
            const { length } = config;
            const sq = Math.sqrt(length);
    
            this.board.forEach((row, x) => {
                const ssqRowIdx = Math.floor(x / sq) * sq;
        
                row.forEach((cell, y) => {
                    // vertical and horizontal
                    for(let i = 0; i < length; i++) {
                        cell.peers.add(row[i]);
                        cell.peers.add(this.board[i][y]);
                    }
                    
                    const ssqColIdx = Math.floor(y / sq) * sq;
                    // same sub-square
                    for(let i = 0; i < sq; i++) {
                        for(let j = 0; j < sq; j++) {
                            cell.peers.add(this.board[ssqRowIdx + i][ssqColIdx + j]);
                        }
                    }
    
                    cell.peers.delete(cell);
                });
            });
        }

        const fillBoard = () => {
            config.board.forEach((row, x) => {
                row.forEach((index, y) => {
                    if(index > 0) {
                        this.board[x][y].setValue(index);
                    }
                });
            });
        }

        createBoard();
        populatePeers();
        if(config.board) {
            fillBoard();
        }
    }

    getCell(x, y) {
        return this.board[x][y].value;
    }

    setCell(x, y, index) {
        this.board[x][y].setValue(index);
    }

    solve() {
        this.board.forEach(row => row.forEach(cell => cell.close()));

        const search = () => {
            const unsolved = this.board.flatMap(row => row.filter(cell => !cell.solved));
            if(!unsolved.length) {
                return true;
            }
            const minCell = unsolved.reduce((c1, c2) => c1.indices.size < c2.indices.size ? c1 : c2);
            const copy = unsolved.map(cell => new Set(cell.indices));

            return Array.from(minCell.indices).some(index => {
                if(minCell.setValue(index) && search()) {
                    return true;
                }
                copy.forEach((oldIndices, idx) => {
                    unsolved[idx].indices = oldIndices;
                });
                return false;
            });
        }

        const result = search();
        this.board.forEach(row => row.forEach(cell => cell.open()));

        return result;
    }

    reset() {
        this.board.forEach(row => row.forEach(cell => cell.setValue(0)));
    }

    output({
        values = SudokuClass.defaults.values(SudokuClass.defaults.config),
        rowSep = SudokuClass.defaults.output.rowSep,
        valSep = SudokuClass.defaults.output.valSep
    }) {
        return this.board.map(row => row.map(cell => values[cell.value]).join(valSep)).join(rowSep);
    }

    serialize() {
        return JSON.stringify(this, (key, value) => {
            if(key && typeof value === "object" && "serialize" in value) {
                return value.serialize();
            }
            return value;
        });
    }

    deserialize(text) {
        const { board, ...rest } = JSON.parse(text);

        board.forEach((row, x) => row.forEach((text, y) => this.board[x][y].deserialize(text)));

        Object.assign(this, rest);
    }

    static validate(game) {
        const sq = Math.sqrt(game.config.length);
        const board = game.board.map(row => row.map(cell => cell.value));

        const isValidRow = row => row.slice().sort((x, y) => x - y).every((val, idx) => val === idx + 1);

        const chunk = arr => Array.from({ length: sq }, (_, k) => arr.slice(sq * k, sq * (k + 1)));

        const transpose = arr => arr[0].map((_, idx) => arr.map(row => row[idx]));

        return board.every(isValidRow) && transpose(board).every(isValidRow) &&
            chunk(board).every(bc => transpose(bc.map(chunk)).every(ssq => isValidRow(ssq.flat())));
    }

    parseText(
        text, {
            values = SudokuClass.defaults.values(SudokuClass.defaults.config),
            rowSep = SudokuClass.defaults.input.rowSep,
            valSep = SudokuClass.defaults.input.valSep
        }
    ) {
        const convert = (val) => {
            if(typeof val === "string" && val.length > 1 && val.startsWith('/') && val.endsWith('/')) {
                return new RegExp(val);
            }
            return val;
        }

        rowSep = convert(rowSep);
        valSep = convert(valSep);
        const rows = text.trim().split(rowSep);
        const board = rows.map(rowStr => rowStr.split(valSep).map(sym => values.indexOf(sym)));
        const config = { length: board.length, board }; 
        
        this.init(config);
    }
}

SudokuClass.defaults = {
    config: {
        length: 9
    },
    values: (config) => ["-", ...Array.from(config, (_, i) => (i + 1).toString(36))],
    output: {
        rowSep: '\n',
        valSep: ' '
    },
    input: {
        rowSep: '\n',
        valSep: / +/
    }
};

/*
        perfect squares, include option for uniqueness on diagonals (Sudoku X),
        Shi Doku 4, Sudoku 9, Number Place Challenger 16, Sudoku the Giant 25
    */
    // regions: Go Doku / Logi-5 - pentomino 5, Roku Doku - 2x3 6, heptomino 7, Hypersudoku / Windoku 9, Maxi (4x3) 12

export const Sudoku = useHistorian(SudokuClass, "setCell solve reset parseText");