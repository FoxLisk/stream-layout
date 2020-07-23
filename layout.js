"use strict";
function log_to_amarec(msg) {
	let el = document.getElementById('log');
	var new_span = document.createElement('p');
	new_span.innerHTML = msg;
	el.prepend(new_span);
	if (el.childElementCount > 4) {
		var c = el.children[el.children.length - 1];
		c.remove();

	}
}

function assert(val, msg) {
	if (!val) {
		throw msg;
	}
}

function randomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function randomScaledFloat(min, max) {
    return (Math.random() * (max - min)) + min;

}

function randomScaledInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomRGBComponent() {
	return randomInt(255);
}

function randomRGBNumbers() {
	return [randomInt(255), randomInt(255), randomInt(255)];
}

function RGBToStyleString(rgb) {
	return 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';
}

function randomRGBString() {
	return RGBToStyleString(randomRGBNumbers());
}

function ChangingElement(_element, _ticks) {
	let element = _element,
	    ticks_target = _ticks || 60;
	var current = [0, 0, 0],
	    target = randomRGBNumbers(),
	    ticks = 0,
	    wait_ticks = 0,
	    state = 'waiting',
	    wait_ticks_target,
	    deltas;

	function resetTickDeltas() {
		var ldeltas = [];
		for (var i of [0, 1, 2]) {
			ldeltas[i] = (target[i] - current[i]) / ticks_target;
		}
		deltas = ldeltas;
	}

	this.tick = function() {
		assert(state == 'ticking', 'invalid state ' + state + ' in tick()');
		for (var i of [0, 1, 2]) {
			current[i] += deltas[i];
		}
		ticks += 1;
		element.style.color = RGBToStyleString(current);
	}

	this.isDoneTicking = function() {
		assert(state == 'ticking', 'invalid state ' + state + ' in isDoneTicking()');
		return (
			Math.abs(current[0] - target[0]) < 0.1 &&
			Math.abs(current[1] - target[1]) < 0.1 &&
			Math.abs(current[2] - target[2]) < 0.1
		) || ticks == ticks_target;
	}

	this.startWait = function(_wait_ticks) {
		assert(state == 'ticking', 'invalid state ' + state + ' in startWait()');
		state = 'waiting';
		wait_ticks_target = _wait_ticks || randomInt(30);
		wait_ticks = 0;
		//console.log('Starting to wait for ' + wait_ticks_target + ' ticks');
	}

	this.isDoneWaiting = function() {
		assert(state == 'waiting', 'invalid state ' + state + ' in isDoneWaiting()');
		return wait_ticks >= wait_ticks_target;
	}
	
	this.tickWait = function() {
		assert(state == 'waiting', 'invalid state ' + state + ' in tickWait()');
		wait_ticks += 1;
		//console.log('Waited again; wait_ticks now at ' + wait_ticks);
	}
	
	this.resetTarget = function(rgb) {
		assert(state == 'waiting', 'invalid state ' + state + ' in resetTarget()');
		ticks = 0;
		target = rgb || randomRGBNumbers();
		state = 'ticking';
		resetTickDeltas();
		//console.log('resetting target');
	}

	this.pump = function() {
		if (state === 'ticking') {
			if (this.isDoneTicking()) {
				this.startWait();
			} else {
				this.tick();
			}
		} else if (state === 'waiting') {
			if (this.isDoneWaiting()) {
				this.resetTarget();
			} else {
				this.tickWait();
			}
		} else {
			assert(false, 'invalid state ' + state + ' in pump()');
		}

	}

	this.resetTarget();

}

document.addEventListener('DOMContentLoaded', function() {

	let f = document.getElementById('F'),
	    o = document.getElementById('O'),
	    x = document.getElementById('X'),
	    l = document.getElementById('L'),
	    i = document.getElementById('I'),
	    s = document.getElementById('S'),
	    k = document.getElementById('K'),
	    letters = [
		    new ChangingElement(f, 240),
		    new ChangingElement(o, 240),
		    new ChangingElement(x, 240),
		    new ChangingElement(l, 240),
		    new ChangingElement(i, 240),
		    new ChangingElement(s, 240),
		    new ChangingElement(k, 240),
	    ],
	    gol_el = document.getElementById('gol'),
	    starting_gol_html_elements,
	    static_ticks_before_starting = 20,
	    static_ticks = 0;

	function tickLetters() {
		for (var letter of letters) {
			letter.pump();
		}
	}
	setInterval(tickLetters, 20);


	let height = 35, width = 46;

	var gol = new GameOfLife({
		height: height,
		width: width,
		ticks_after_stuck: 20,
	});
	gol.zeroBoard();
	starting_gol_html_elements = flexBoxInitial(height, width);
	gol_el.innerHTML = '';
	gol_el.append(starting_gol_html_elements.container);

	function resetBoard(gol) {
		gol.zeroBoard();
		if (Math.random() < 0.4) {
			//let pattern = strToBoard(gosper_glider_gun);
			//let startx = 4;
			//let starty = 4;
			let pattern = PATTERNS[randomInt(PATTERNS.length)];
			let startx = randomInt(gol.getWidth() - pattern[0].length);
			let starty = randomInt(gol.getHeight() - pattern.length);
			
			try {
				gol.setRect(pattern, startx, starty);
				return;
			} catch (e) {
			}
		} else {
			gol.newRandomBoard(randomScaledFloat(0.3, 0.7));
		}
			

	}
	function drawBoard(new_board) {
		for (var row_n in new_board) {
			for (var col_n in new_board[row_n]) {
				if (!starting_gol_html_elements.els[row_n][col_n]) {
					//lool
				}
				starting_gol_html_elements.els[row_n][col_n].classList.remove('alive')
				if (new_board[row_n][col_n]) {
					starting_gol_html_elements.els[row_n][col_n].classList.add('alive');
				}
			}
		}
	}

	resetBoard(gol);
	drawBoard(gol.copyBoard());

	function run_the_gol() {
		if (gol.isStale()) {
			resetBoard(gol);
			static_ticks = 0;
			drawBoard(gol.copyBoard());
		}
		if (static_ticks < static_ticks_before_starting) {
			static_ticks += 1;
			return;
		}
		var new_board = gol.tick();
		drawBoard(new_board);

	}

	setInterval(run_the_gol, 100);

});
