/**
Player's units actions, controlls and etc.
@module unitsControl
*/

$(function() {
window.app.unitsControl = {
	drawSquareOrCross: [],

	visual: {

		dottedLines: [],
		selectSquares: [],
		crosses: [],


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
			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.setLineDash([]);
			ctx.strokeStyle = "#5CDE13";
			ctx.moveTo(x * cellSize,            y * cellSize);
			ctx.lineTo(x * cellSize + cellSize, y * cellSize);
			ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);
			ctx.lineTo(x * cellSize,            y * cellSize + cellSize);
			ctx.lineTo(x * cellSize,            y * cellSize);
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
			x = x - app.graphics.x1;
			y = y - app.graphics.y1;
			ctx.beginPath();
			ctx.lineWidth = 3;
			ctx.setLineDash([]);
			ctx.strokeStyle = "#E70C0C";
			ctx.moveTo(x * cellSize + cellSize/4,    y * cellSize + cellSize/4);
			ctx.lineTo(x * cellSize + cellSize*0.75, y * cellSize + cellSize*0.75);
			ctx.moveTo(x * cellSize + cellSize/4,    y * cellSize + cellSize*0.75);
			ctx.lineTo(x * cellSize + cellSize*0.75, y * cellSize + cellSize/4);
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
			// CHECK FOR NEED2MOVE. DONT SELECT MOVING UNITS!!!!!!!!

			// Check for already select of this unit
			var selected = app.unitsControl.visual.selectSquares;
			for (var i=0; i<selected.length; i++){
				if (selected[i].id == unit.id){
					console.log('Already selected');
					return
				}
			}
			
			app.unitsControl.visual.selectSquares.push({x: unit.abs_x,
				                                        y: unit.abs_y,
				                                        id: unit.id,
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
		var selectedUnits = app.unitsControl.visual.selectSquares;

		// Don't place cross if we haven't select any heros
		if (!selectedUnits.length) return;

		// CHECK EXISTANCE OF UNITS IN SELECTED CELLS!!!!!

		for (var i=0; i<selectedUnits.length; i++){				
		    app.network.socket.emit('sendOffUnit', {unitX: selectedUnits[i].x,
		                                            unitY: selectedUnits[i].y,
		                                            targetX: coords[0],
		                                            targetY: coords[1],
		                                            unitID: selectedUnits[i].id,
		                                            unitMapCode: selectedUnits[i].unitCode,
		                                            ownerSocketID: app.network.socket.id});
		}
		// We have sent off selected units. Removing select and placing cross
		app.unitsControl.visual.selectSquares = [];
		app.unitsControl.visual.crosses.push({x: coords[0],
		                                      y: coords[1]});
		console.log('Go here!');
	}
}})
