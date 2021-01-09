"use strict";

document.addEventListener('DOMContentLoaded', function() {
	let changers = [];
	// i am enraged that i can't run "map" on this and have to do this stupid bullshit instead
	document.querySelectorAll('.changeme').forEach(function(e) {

		changers.push(new ChangingElement(e, randomScaledInt(200,280)));
	});

	function tickLetters() {
		for (var letter of changers) {
			letter.pump();
		}
	}
	setInterval(tickLetters, 20);
});
