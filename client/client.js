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
		console.log('moveUp');
	}else{
		console.log('Can\'t move up')
		window.app.graphics.y1 = 0;
		window.app.graphics.y2 = window.app.graphics.cellsInColumn;
	}
	window.app.graphics.fillMap();
}

function mvViewportR() {
	var x2 = window.app.graphics.x2;
	if (x2 + (window.app.graphics.cellsInRow / 2) < window.app.environment.map.sizeX){
		window.app.graphics.x1 = window.app.graphics.x1 + (window.app.graphics.cellsInRow / 2);
		window.app.graphics.x2 = x2 + (window.app.graphics.cellsInRow / 2);
		console.log('moveRight');
	}else{
		window.app.graphics.x1 = window.app.environment.map.sizeX - window.app.graphics.cellsInRow;
		window.app.graphics.x2 = window.app.environment.map.sizeX;
		console.log('Can\'t move right');
	}
	window.app.graphics.fillMap();
}

function mvViewportDown() {
	var y2 = window.app.graphics.y2;
	if (y2 + (window.app.graphics.cellsInColumn / 2) < window.app.environment.map.sizeY){
		window.app.graphics.y2 = y2 + (window.app.graphics.cellsInColumn / 2);
		window.app.graphics.y1 = window.app.graphics.y1 + (window.app.graphics.cellsInColumn / 2);
		console.log('moveDown');
	}else{
		window.app.graphics.y2 = window.app.environment.map.sizeY;
		window.app.graphics.y1 = window.app.environment.map.sizeY - window.app.graphics.cellsInColumn;
		console.log('Can\'t move down')
	}
	window.app.graphics.fillMap();
}

function mvViewportL() {
	var x1 = window.app.graphics.x1;
	if (x1 - (window.app.graphics.cellsInRow / 2) > 0){
		window.app.graphics.x1 = x1 - (window.app.graphics.cellsInRow / 2);
		window.app.graphics.x2 = window.app.graphics.x2 - (window.app.graphics.cellsInRow / 2);
		console.log('modeLeft');
	}else{
		window.app.graphics.x1 = 0;
		window.app.graphics.x2 = window.app.graphics.cellsInRow;
		console.log('Can\'t move left');
	}
	window.app.graphics.fillMap();
}

window.onload = function() {

	function getCellByPosition(top, left) {
		var topIndex = Math.floor(top / window.app.graphics.cellSize)
		var leftIndex = Math.floor(left / window.app.graphics.cellSize)
		
		var leftIndexStr = '['+leftIndex.toString()+']';
		var topIndexStr = '['+topIndex.toString()+']';
		console.log('cells'+topIndexStr+leftIndexStr+' value='+window.app.graphics.cells[topIndex][leftIndex])

		return window.app.graphics.cells[topIndex][leftIndex]
	}


	function handleMouseDown(event) {
		filling = getCellByPosition(event.layerX, event.layerY);
	}

	window.app.graphics.canvas.addEventListener('mousedown', handleMouseDown, false);
}