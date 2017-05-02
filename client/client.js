function send() {
	console.log('Hello');
}

function toggleSelectPanel() {
	var selectPanel = document.getElementById('selectPanel');
	selectPanel.style.display = (selectPanel.style.display == 'block') ? 'none' : 'block';
}

function mvViewportUp() {
	var y1 = window.app.graphics.y1;
	if (y1 - (app.graphics.cellsInColumn / 2) > 0){
		window.app.graphics.y1 = y1 - (window.app.graphics.cellsInColumn / 2);
		window.app.graphics.y2 = window.app.graphics.y2 - (window.app.graphics.cellsInColumn / 2);
	}else{
		window.app.graphics.y1 = 0;
		window.app.graphics.y2 = window.app.graphics.cellsInColumn;
	}
	window.app.graphics.fillMap();
	console.log('moveUp');
}

function mvViewportR() {
	var x2 = window.app.graphics.x2;
	if (x2 + (window.app.graphics.cellsInRow / 2) < window.app.environment.map.sizeX){
		window.app.graphics.x1 = window.app.graphics.x1 + (window.app.graphics.cellsInRow / 2);
		window.app.graphics.x2 = x2 + (window.app.graphics.cellsInRow / 2);
	}else{
		window.app.graphics.x1 = window.app.environment.map.sizeX - window.app.graphics.cellsInRow;
		window.app.graphics.x2 = window.app.environment.map.sizeX;
	}
	window.app.graphics.fillMap();
	console.log('moveRight');
}

function mvViewportDown() {
	var y2 = window.app.graphics.y2;
	if (y2 + (window.app.graphics.cellsInColumn / 2) < window.app.environment.map.sizeY){
		window.app.graphics.y2 = y2 + (window.app.graphics.cellsInColumn / 2);
		window.app.graphics.y1 = window.app.graphics.y1 + (window.app.graphics.cellsInColumn / 2);
	}else{
		window.app.graphics.y2 = window.app.environment.map.sizeY;
		window.app.graphics.y1 = window.app.environment.map.sizeY - window.app.graphics.cellsInColumn;
	}
	window.app.graphics.fillMap();
	console.log('moveDown');
}

function mvViewportL() {
	var x1 = window.app.graphics.x1;
	if (x1 - (window.app.graphics.cellsInRow / 2) > 0){
		window.app.graphics.x1 = x1 - (window.app.graphics.cellsInRow / 2);
		window.app.graphics.x2 = window.app.graphics.x2 - (window.app.graphics.cellsInRow / 2);
	}else{
		window.app.graphics.x1 = 0;
		window.app.graphics.x2 = window.app.graphics.cellsInRow;
	}
	window.app.graphics.fillMap();
	console.log('modeLeft');
}