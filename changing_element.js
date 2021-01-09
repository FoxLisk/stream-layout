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
	}

	this.isDoneWaiting = function() {
		assert(state == 'waiting', 'invalid state ' + state + ' in isDoneWaiting()');
		return wait_ticks >= wait_ticks_target;
	}
	
	this.tickWait = function() {
		assert(state == 'waiting', 'invalid state ' + state + ' in tickWait()');
		wait_ticks += 1;
	}
	
	this.resetTarget = function(rgb) {
		assert(state == 'waiting', 'invalid state ' + state + ' in resetTarget()');
		ticks = 0;
		target = rgb || randomRGBNumbers();
		state = 'ticking';
		resetTickDeltas();
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
