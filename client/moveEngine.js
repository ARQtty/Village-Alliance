$(function() {
window.app.moveViewport = {

	moveUp: function() {
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
	},

	moveRight: function() {
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
	},

	moveDown: function() {
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
	},

	moveLeft: function() {
		var x1 = window.app.graphics.x1;
		if (x1 - (window.app.graphics.cellsInRow / 2) > 0){
			window.app.graphics.x1 = x1 - (window.app.graphics.cellsInRow / 2);
			window.app.graphics.x2 = window.app.graphics.x2 - (window.app.graphics.cellsInRow /2);
			console.log('move left');
		}else{
			window.app.graphics.x1 = 0;
			window.app.graphics.x2 = window.app.graphics.cellsInRow;
			console.log('Can\'t move left');
		}
		window.app.graphics.fillMap();
	}
}})