function sd2snes_magic() {
	const MODULE_ADDR = 'F50010',
	      DEAD_MODULE = 0x12;
	var state,
	    death_sound = new Audio('death_sound.mp3'),
	    last_module,
	    s,
	    device,
	    brrrr_interval_id,
	    self = this;

	this.init = function () {
		log_to_amarec('init()');
		s = new WebSocket('ws://localhost:8080');
		state = 'start';
		last_module = DEAD_MODULE; // start out pretending we're dead so we don't get superfluous noises on reconnects

		s.onopen = function (event) {
			s.send(JSON.stringify({
				"Opcode" : "DeviceList",
				"Space" : "SNES"
			})); 
		};

		s.onerror = function (event) {
			console.log(event);
			log_to_amarec('Error!');
			log_to_amarec(event);
		}

		s.onclose = function (event) {
			log_to_amarec('onclose');
			log_to_amarec(event);
			clearInterval(brrrr_interval_id);
			self.init();
		}

		function handle_module_arraybuffer(ab) {
			let module = new Int8Array(ab)[0];
			if (module !== last_module) {
				log_to_amarec(module);
				console.log(module);
				last_module = module;
				if (module === DEAD_MODULE) {
					death_sound.play();
				}
			}
		}

		s.onmessage = function (event) {
			if (state === 'start') {
				// we asked for device list
				// assume we got the registered devices back
				let data = JSON.parse(event.data);
				let _dev = data && data.Results && data.Results[0];
				if (_dev) {
					device = _dev;
					state = 'attaching';
					console.log('Found device ' + device);
				}
			} else if (state === 'attaching') {
				// driver will send the attach
				console.log('waiting to send attach...')
			} else if (state === 'sent_attach') {
				// now we want to hear an Info response
				// let's just assume that's what it is for now
				console.log(JSON.parse(event.data));
				state = 'naming';

			} else if (state === 'humming') {
				if (!event.data.arrayBuffer) {
					var reader = new FileReader();
					reader.addEventListener('loadend', function() {
						handle_module_arraybuffer(reader.result);
					});
					reader.readAsArrayBuffer(event.data);
					return;
				}
				event.data.arrayBuffer().then(function(ab) {
					handle_module_arraybuffer(ab);
				});
			}
		}

		function brrrr() {
			if (state === 'start') {
				console.log('waiting for registered device list');
			} else if (state === 'attaching') {
				s.send(JSON.stringify({
				    "Opcode" : "Attach",
				    "Space" : "SNES",
				    "Operands" : [device]
				}));
				s.send(JSON.stringify({
					'Opcode': 'Info',
					'Space': 'SNES',
				}));
				state = 'sent_attach';
			} else if (state === 'sent_attach') {
				// listener is waiting for it
			} else if (state === 'naming') {
				s.send(JSON.stringify({
					'Opcode': 'Name',
					'Space': 'SNES',
					'Operands': ['MyThingy'],

				}));
				state = 'humming';
			} else if (state === 'humming') {
				s.send(JSON.stringify({
					'Opcode': 'GetAddress',
					'Space': 'SNES',
					'Operands': [MODULE_ADDR, "1"],
				}));

			}

		}

		brrrr_interval_id = setInterval(brrrr, (2000/60)); // every 2f
	}
}

document.addEventListener('DOMContentLoaded', function() {

	var magic = new sd2snes_magic();
	magic.init();
});
