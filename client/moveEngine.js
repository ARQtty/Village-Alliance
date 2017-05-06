$(function() {
window.app.moveViewport = {

	moveUp: function() {
		var y1 = app.graphics.y1;
		if (y1 - (app.graphics.cellsInColumn / 2) > 0){
			app.graphics.y1 = y1 - (app.graphics.cellsInColumn / 2);
			app.graphics.y2 = app.graphics.y2 - (app.graphics.cellsInColumn / 2);
			console.log('moveUp');
		}else{
			console.log('Can\'t move up')
			app.graphics.y1 = 0;
			app.graphics.y2 = app.graphics.cellsInColumn;
		}
		app.graphics.fillMap();
	},

	moveRight: function() {
		var x2 = app.graphics.x2;
		if (x2 + (app.graphics.cellsInRow / 2) < app.environment.map.sizeX){
			app.graphics.x1 = app.graphics.x1 + (app.graphics.cellsInRow / 2);
			app.graphics.x2 = x2 + (app.graphics.cellsInRow / 2);
			console.log('moveRight');
		}else{
			app.graphics.x1 = app.environment.map.sizeX - app.graphics.cellsInRow;
			app.graphics.x2 = app.environment.map.sizeX;
			console.log('Can\'t move right');
		}
		app.graphics.fillMap();
	},

	moveDown: function() {
		var y2 = app.graphics.y2;
		if (y2 + (app.graphics.cellsInColumn / 2) < app.environment.map.sizeY){
			app.graphics.y2 = y2 + (app.graphics.cellsInColumn / 2);
			app.graphics.y1 = app.graphics.y1 + (app.graphics.cellsInColumn / 2);
			console.log('moveDown');
		}else{
			app.graphics.y2 = app.environment.map.sizeY;
			app.graphics.y1 = app.environment.map.sizeY - app.graphics.cellsInColumn;
			console.log('Can\'t move down')
		}
		app.graphics.fillMap();
	},

	moveLeft: function() {
		var x1 = app.graphics.x1;
		if (x1 - (app.graphics.cellsInRow / 2) > 0){
			app.graphics.x1 = x1 - (app.graphics.cellsInRow / 2);
			app.graphics.x2 = app.graphics.x2 - (app.graphics.cellsInRow /2);
			console.log('move left');
		}else{
			app.graphics.x1 = 0;
			app.graphics.x2 = app.graphics.cellsInRow;
			console.log('Can\'t move left');
		}
		app.graphics.fillMap();
	}
}})