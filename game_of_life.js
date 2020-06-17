"use strict";

function strToBoard(s) {
	var board = [];
	for (var row of s.trim().split('\n')) {
		board.push(row.trim().split('').map(el => el === '0' ? false : true));
	}
	return board;
}

let gosper_glider_gun = `
000000000000000000000000100000000000
000000000000000000000010100000000000
000000000000110000001100000000000011
000000000001000100001100000000000011
110000000010000010001100000000000000
110000000010001011000010100000000000
000000000010000010000000100000000000
000000000001000100000000000000000000
000000000000110000000000000000000000`;

let pattern_strings = [
//glider
`010
 001
 111`,

`010
 111
 101
 010`,

`10101
 10001
 10001
 10001
 10101`,

`1111111111`,

`01111
 10001
 00001
 10010`,

`0110110
 0110110
 0010100
 1010101
 1010101
 1100011`,

 gosper_glider_gun,

`000000110000
 000000110000
 000000000000
 000011110000
 110100101000
 110101001000
 000100011011
 000100001011
 000011110000
 000000000000
 000011000000
 000011000000`,

`0000000000011000000000001100000000000
0000000000011000000000001100000000000
0000000000000000000000000000000000000
0000000000000000000000000000000000000
0000001000000000000000000000001000000
0000010100000100000000010000010100000
0000100100000101100011010000010010000
0000011000000000010100000000001100000
0000000000000001010101000000000000000
0000000000000000100010000000000000000
0000000000000000000000000000000000000
1100000000000000000000000000000000011
1100000000000000000000000000000000011
0000011000000000000000000000001100000
0000000000000000000000000000000000000
0000001010000000000000000000101000000
0000001001000000000000000001001000000
0000000110000000000000000000110000000
0000000000000000000000000000000000000
0000000110000000000000000000110000000
0000001001000000000000000001001000000
0000001010000000000000000000101000000
0000000000000000000000000000000000000
0000011000000000000000000000001100000
1100000000000000000000000000000000011
1100000000000000000000000000000000011
0000000000000000000000000000000000000
0000000000000000100010000000000000000
0000000000000001010101000000000000000
0000011000000000010100000000001100000
0000100100000101100011010000010010000
0000010100000100000000010000010100000
0000001000000000000000000000001000000
0000000000000000000000000000000000000
0000000000000000000000000000000000000
0000000000011000000000001100000000000
0000000000011000000000001100000000000`,

`0100000000000010
0100000000000010
1010000000000101
0100000000000010
0100000000000010
0010001111000100
0000001111000000
0011110000111100
0000000000000000
0000100000010000
0000011001100000`,

//copperhead
`0000110000
 0001111000
 0000000000
 0011111100
 0001111000
 0000000000
 0011001100
 1100000011
 0000000000
 0000000000
 0000110000
 0000110000`,

//lobster
`00000000000011100000000000
 00000000000010000000000000
 00000000000001001100000000
 00000000000000001100000000
 00000000000011000000000000
 00000000000001100000000000
 00000000000010010000000000
 00000000000000000000000000
 00000000000000100100000000
 00000000000000100010000000
 00000000000000011101000000
 00000000000000000000100000
 11001010000000000000100000
 10101100000000000001000000
 10000100110000000000000110
 00000010001000000110011001
 00110000001000000100100000
 00110000101000011000000000
 00000000010000010001000100
 00000000001001000011000000
 00000000000110001000001010
 00000000000000010000000011
 00000000000000010000100000
 00000000000000100010000000
 00000000000000100000110000
 00000000000000010000010000`,

//schick engine
`111100000000000000
 100010000000001000
 100000000000110000
 010010011000001110
 000000111000000111
 010010011000001110
 100000000000110000
 100010000000001000
 111100000000000000`,

`00101000011000
 00000100010000
 01001000001000
 10101000011000
 10010000000000
 01100010000000
 00000000000100
 00000100000000
 00000011001000
 01101010010000
 01011010101000
 00000001001110
 00000000110001
 00000000001110
 00000000001000`,

`011000000000000000000000000
 011000000000000000000000000
 000000000000000000000000000
 000000000000000100000000000
 110000000000000110000000011
 110000000000000011000000011
 000000000001100110000000000
 000000000000000000000000000
 000000000000000000000000000
 000000000000000000000000000
 000000000001100110000000000
 110000000000000011000000000
 110000000000000110000000000
 000000000000000100000000000
 000000000000000000000000000
 011000000000000000000000000
 011000000000000000000000000`,

]

let PATTERNS = pattern_strings.map(strToBoard);
const HISTORY_LENGTH = 300;

function History(length) {
	// we're just initializing the history to non-equal values so
	// it will always lie about whether or not the history
	// is uniform until you've pushed at least `length`
	// elements on to it.
	// i don't care, but it is technically incorrect.
	var history = new Array(length),
	    index = 0,
	    full = false;

	this.push = function(el) {
		history[index] = el;
		index = (index + 1) % length;
		if (index === 0) {
			full = true;
		}
	}

	function inserted() {
		if (full) {
			return history;
		} else {
			return history.slice(0, index);
		}

	}

	this.isFull = function() {
		return full;
	}

	this.allEqual = function() {
		var s = history[0];
		for (var el of inserted()) {
			if (el !== s) {
				return false;
			}
		}
		return true;
	}

	this.uniques = function() {
		return new Set(inserted()).size;
	}

	this.reset = function() {
		for (var i = 0; i < length; i++) {
			// initialize with non-equal values
			history[i] = 0;
		}
		full = false;
		index = 0;
	}
	this.reset();
}

function GameOfLife(config) {
	let width = config && config.width || 30;
	let height = config && config.height || 30;
	// it would be reasonable to configure these as a 
	// full state machine description, if i cared
	let to_die = new Set(config && config.to_die || [0, 1, 4, 5, 6, 7, 8]);
	let to_grow = new Set(config && config.to_grow || [3]);
	let ticks_after_stuck = (config && config.ticks_after_stuck || 13);
	var board = null,
	    ticks_stuck = 0,
	    history = new Set(),
	    uniques_last_tick = 10000; // big number, otherwise meaningless


	this.getWidth = function() {
		return width;
	}

	this.getHeight = function() {
		return height;
	}

	this.zeroBoard = function(_rows, _cols) {
		var rows = _rows || height,
		    cols = _cols || width;
		var newBoard = [];
		for (var row = 0; row < rows; row++) {
			var newRow = [];
			for (var col = 0; col < cols; col++) {
				newRow.push(false);
			}
			newBoard.push(newRow);
		}
		this.setBoard(newBoard);
	}

	this.setBoard = function(_board) {
		assert(_board !== null && _board !== undefined, 'setBoard() passed null board');
		assert(_board.length == height, 'setBoard() passed board of invalid height');
		assert(_board[0].length == width, 'setBoard() passed board of invalid height');
		history.clear();
		board = _board;
		ticks_stuck = 0;
		uniques_last_tick = 10000; // big number, otherwise meaningless
	}

	function copy2DMatrix(matrix) {
		var copy = [];
		for (var row of matrix) {
			var new_row = [];
			for (var el of row) {
				new_row.push(el);
			}
			copy.push(new_row);
		}
		return copy;

	}

	this.copyBoard = function() {
		return copy2DMatrix(board);
	}

	this.viewBoard = function() {
	}

	this.newRandomBoard = function(alive_weight) {
		assert(0 < alive_weight && alive_weight < 1);
		var newBoard = [];
		for (var i = 0; i < height; i++) {
			var row = [];
			for (var j = 0; j < width; j++) {
				let alive = Math.random() < alive_weight;
				row.push(alive);
			}
			newBoard.push(row);
		}
		this.setBoard(newBoard);
	}


	this.newBoard = function(options) {
		// what am i thinking here? why did i add this indirection?
		if (!options) {
			this.newRandomBoard(0.5);
		}
	}

	this.toString = function(a_board) {
		return matrixToString(
			a_board,
			el => el ? '\u25A0' : '\u25A1'
		);
	}
	
	this.tick = function() {
		// this fucking sucks but it's correct i guess
		// keeping it as a local func here b/c the faster algorithm involves scanning
		// and is thus *actually* local in a way this isn't.
		function neighbours(row_num, col_num) {
			// row_num
			assert(row_num >= 0 && row_num < height, 'Invalid row num');
			assert(col_num >= 0 && col_num < width,  'Invalid col num');
			var n = 0;
			var prev_row = board[row_num-1];
			var next_row = board[row_num+1];
			if (prev_row !== undefined) {
				for (var offset of [-1, 0, 1]) {
					if (prev_row[col_num + offset] === true) {
						n += 1;
					}
				}
			}
			if (next_row !== undefined) {
				for (var offset of [-1, 0, 1]) {
					if (next_row[col_num + offset] === true) {
						n += 1;
					}
				}
			}
			if (board[row_num][col_num-1] === true) {
				n += 1;
			}
			if (board[row_num][col_num+1] === true) {
				n += 1;
			}
			assert(n < 9, 'too many neighbours');
			return n;
		}

		var next_gen = []
		var neighbour_counts = [];
		for (var row = 0; row < height; row++) {
			var new_row = [];
			var next_gen_row = []
			for (var col = 0; col < width; col++) {
				let n_neighbours = neighbours(row, col);
				new_row.push(n_neighbours);
				if (board[row][col]) {
					let survives = !to_die.has(n_neighbours);
					next_gen_row.push(survives);
				} else {
					let grows = to_grow.has(n_neighbours)
					next_gen_row.push(grows);
				}
			}
			neighbour_counts.push(new_row);
			next_gen.push(next_gen_row);
		}
		board = next_gen;
		history.add(hash());
		let uniques = history.size;
		if (uniques === uniques_last_tick) {
			if (ticks_stuck > 0) {
				ticks_stuck += 1;
			} else {
				ticks_stuck = 1;
			}
		} else {
			ticks_stuck = 0;
		}
		uniques_last_tick = uniques;
		return board;
	}

	this.setRect = function(sub_rect, _start_col, _start_row) {
		assert(!!board, 'board logically false??');
		let start_row = _start_row || 0,
		    start_col = _start_col || 0;
		let s_height = sub_rect.length;
		let s_width = sub_rect[0].length;
		let setting_top = s_height + start_row;
		let setting_left = s_width + start_col;
		assert(start_row < height, 'starting beyond vertical borders');
		assert(start_col < width,  'starting beyond horizontal borders');

		assert(height >= start_row + sub_rect.length,    'too many rows');
		assert(width >=  sub_rect[0].length,        'too many cols');

		assert(height - (s_height + start_row) >= 0, 'invalid subRect() height ' + s_height);
		assert(width  - (s_width + start_col) >= 0, 'invalid subRect() width ' + s_width);

		for (var row_n = 0; row_n < sub_rect.length; row_n++) {
			let this_row = board[row_n + start_row];
			if (!this_row) {
				throw 'blah';
			}
			for (var col_n = 0; col_n < sub_rect[0].length; col_n++) {
				let liveness = sub_rect[row_n][col_n];
				this_row[col_n + start_col] = liveness;
			}
		}
		
	}

	function hash() {
		/*
		assert(width <= 64, 'too wide to hash like this');
		var hash = 17;
		for(var row of board){
			for (var cell of row) {
				let inty = cell ? 1 : 0;
				hash = (31 * hash + inty) % Number.MAX_SAFE_INTEGER;
			}
		}
		return hash;	
		*/
		var str = [];
		for(var row of board){
			for (var cell of row) {
				str.push(cell ? '1' : '0');
			}
		}
		return str.join('');
	}

	this.isStale = function() {
		return ticks_stuck >= ticks_after_stuck;
	}
}

function matrixToString(matrix, transform) {
	let thing = matrix.map(
		function(row) {
			return row.map(
				transform
			).join(' ');
		}).join('\n');
	return thing;
}

function flexBoxInitial(height, width) {
	var container = document.createElement('div');
	container.classList.add('gol_container');
	var els_matrix = [];
	for (var row_n = 0; row_n < height; row_n++) {
		var row_el = document.createElement('div');
		row_el.classList.add('row');
		var col_n = 0;
		var els_row = [];
		for (var col_n = 0; col_n < width; col_n++) {
			var cell = document.createElement('div');
			cell.classList.add('cell');
			cell.setAttribute('id', 'cell_' + row_n + '_' + col_n);
			row_el.appendChild(cell);
			els_row.push(cell);
		}
		container.appendChild(row_el);
		els_matrix.push(els_row);
	}
	return {
		container: container,
		els: els_matrix,
	};

}


document.addEventListener('DOMContentLoaded', function() {
});
