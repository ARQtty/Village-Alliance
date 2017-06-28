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
			
			// Check if unit is moving now
			app.network.socket.emit('stopMoveUnit', {unitID: unit.id});
			if (unit.moving.need2Move){
				// Find it in all units and stop it's move
				for (var i=0; i<app.sprites.coords.length; i++){
					if (app.sprites.coords[i].id == unit.id){
						app.sprites.coords[i].need2Move = false;
						app.sprites.coords[i].need2MoveX = 0;
						app.sprites.coords[i].need2MoveY = 0;
						app.sprites.coords[i].x = app.sprites.coords[i].abs_x;
						app.sprites.coords[i].y = app.sprites.coords[i].abs_y;
						break;
					}
				}
			}
			

			app.unitsControl.visual.selectSquares.push({x: unit.abs_x,
				                                        y: unit.abs_y,
				                                        id: unit.id,
				                                        unitCode: unit.unitCode,
				                                        socketID: app.network.socket.id,
				                                        moving: {
				                                        	serverUpd:{
				                                        		untilCounter: unit.moving.serverUpd.untilCounter,
				                                        		interval: unit.moving.serverUpd.interval
				                                        	}
				                                        }});
		})();
	},


	removeSelect: function(){
		app.unitsControl.visual.selectSquares = [];
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
		var attack = false,
		    attackedType;

		// Don't place cross if we haven't select any heros
		if (!selectedUnits.length) return;

		var unitHere = app.sprites.unitWithCoords(coords[0], coords[1]);
		var buildingHere = app.building.buildingWithCoords(coords[0], coords[1]);
		console.log(unitHere, buildingHere);
		if (unitHere){
			attack = true;
			attackedType = 'unit';
		}else if (buildingHere){
		    attack = true;
		    attackedType = 'building';	
		}

		for (var i=0; i<selectedUnits.length; i++){
		    app.network.socket.emit('sendOffUnit', {unitX: selectedUnits[i].x,
		                                            unitY: selectedUnits[i].y,
		                                            targetX: coords[0],
		                                            targetY: coords[1],
		                                            attack: attack,
		                                            attackedType: attackedType,
		                                            unitID: selectedUnits[i].id,
		                                            unitMapCode: selectedUnits[i].unitCode,
		                                            ownerSocketID: app.network.socket.id,
		                                            moving: {
			                                        	serverUpd:{
			                                        		untilCounter: selectedUnits[i].moving.serverUpd.untilCounter,
			                                        		interval: selectedUnits[i].moving.serverUpd.interval
			                                        	}
			                                        }});
		}
		// We have sent off selected units. Removing select and placing cross
		app.unitsControl.visual.selectSquares = [];
		if (!attack){
			app.unitsControl.visual.crosses.push({x: coords[0],
			                                      y: coords[1]});
		}
	}	
}})
