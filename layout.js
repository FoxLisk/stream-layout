"use strict";

function assert(val, msg) {
	if (!val) {
		alert(msg);
	}
}

document.addEventListener('DOMContentLoaded', function() {

	function randomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
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

	function ChangingElement(_element, _current, _target, _ticks) {
		let element = _element,
		    ticks_target = _ticks || 60;
		var current = _current || _element.style.color || [0, 0, 0],
		    target = _target || randomRGBNumbers(),
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
			console.log('Starting to wait for ' + wait_ticks_target + ' ticks');
		}

		this.isDoneWaiting = function() {
			assert(state == 'waiting', 'invalid state ' + state + ' in isDoneWaiting()');
			return wait_ticks >= wait_ticks_target;
		}
		
		this.tickWait = function() {
			assert(state == 'waiting', 'invalid state ' + state + ' in tickWait()');
			wait_ticks += 1;
			console.log('Waited again; wait_ticks now at ' + wait_ticks);
		}
		
		this.resetTarget = function(rgb) {
			assert(state == 'waiting', 'invalid state ' + state + ' in resetTarget()');
			ticks = 0;
			target = rgb || randomRGBNumbers();
			state = 'ticking';
			resetTickDeltas();
			console.log('resetting target');
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


	let f = document.getElementById('F'),
	    o = document.getElementById('O'),
	    x = document.getElementById('X'),
	    l = document.getElementById('L'),
	    i = document.getElementById('I'),
	    s = document.getElementById('S'),
	    k = document.getElementById('K'),
	    letters = [
		    new ChangingElement(f),
		    new ChangingElement(o),
		    new ChangingElement(x),
		    new ChangingElement(l),
		    new ChangingElement(i),
		    new ChangingElement(s),
		    new ChangingElement(k),
	    ];

         
	    //letters = [f, o, x, l, i, s, k];


	var intervalId;
	function tickLetters() {
		for (var letter of letters) {
			letter.pump();
		}
	}
	intervalId = setInterval(tickLetters, 20);

});
