/**
Player's units actions, controlls and etc.
@module unitsControl
*/

$(function() {
window.app.unitsControl = {
	drawSquareOrCross: [],

	visual: {
		/**
		Drawing a square under mouse by click. It displays unit's position
		@param x {Integer} X coordinate of the cell
		@param y {Integer} Y coordinate of the cell
		*/
		drawGreenSquare: function(x, y){
			var ctx = app.graphics.canvas.getContext('2d'),
			    cellSize = app.graphics.cellSize;
			x = x - app.graphics.x1;
			y = y - app.graphics.y1;
			ctx.lineWidth = 2;
			ctx.moveTo(x * cellSize,            y * cellSize);
			ctx.lineTo(x * cellSize + cellSize, y * cellSize);
			ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);
			ctx.lineTo(x * cellSize,            y * cellSize + cellSize);
			ctx.lineTo(x * cellSize,            y * cellSize);
			ctx.strokeStyle = "#5CDE13";
			ctx.stroke();
		},


		/**
		Drawing a cross under mouse by click. It displays unit's target cell
		@param x {Integer} X coordinate of the cell
		@param y {Integer} Y coordinate of the cell
		*/
		drawCross: function(x, y){
			var ctx = app.graphics.canvas.getContext('2d'),
			    cellSize = app.graphics.cellSize;
			ctx.lineWidth = 3;
			ctx.moveTo(x * cellSize,            y * cellSize);
			ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);
			ctx.moveTo(x * cellSize,            y * cellSize + cellSize);
			ctx.lineTo(x * cellSize + cellSize, y * cellSize);
			ctx.strokeStyle = "#E70C0C";
			ctx.stroke();
		}
	},


	/**
	Selects unit under mouse by click, underlines it
	@method selectUnit
	@param unit {Object} Element of app.sprites.coords array. Is a object of unit
	*/
	selectUnit: function(unit){
		(function drawSquare(){
			app.unitsControl.drawSquareOrCross.push({x: unit.abs_x,
				                                     y: unit.abs_y,
				                                     id: unit.id,
				                                     type: 'square',
				                                     socketID: app.network.socket.id});
			console.log('Selected!');
		})();
	},


	/**
	Sends units to cell with click coords
	@method pointClick
	@param event {Event} Event of click on game field
	*/
	pointClick: function(event){
		var coords = app.environment.getCellCoords(event.layerX, event.layerY);
		coords[0] += app.graphics.x1;
		coords[1] += app.graphics.y1;
		var sprites = app.sprites.coords;
		var unitsArr = app.unitsControl.drawSquareOrCross;

		// CHECK EXISTANCE OF UNITS IN SELECTED CELLS

		for (var i=0; i<unitsArr.length; i++){				
		    app.network.socket.emit('sendOffUnit', {unitX: unitsArr[i].x,
		                                            unitY: unitsArr[i].y,
		                                            targetX: coords[0],
		                                            targetY: coords[1],
		                                            unitID: unitsArr[i].id,
		                                            ownerSocketID: app.network.socket.id});
		}
		app.unitsControl.drawSquareOrCross = [{x: coords[0], 
			                                   y: coords[1],
			                                   type: 'cross'}];
		console.log('Go here!');
	}
}})
