function send() {
	console.log('Hello');
}

function toggleSelectPanel() {
	var selectPanel = document.getElementById('selectPanel');
	selectPanel.style.display = (selectPanel.style.display == 'block') ? 'none' : 'block';
}

function mvViewportUp() {
	console.log('moveUp');
}

function mvViewportR() {
	console.log('moveRight');
}

function mvViewportDown() {
	console.log('moveDown');
}

function mvViewportL() {
	console.log('modeLeft');
}