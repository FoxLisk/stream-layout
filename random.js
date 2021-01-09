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


