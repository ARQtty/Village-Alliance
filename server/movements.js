/**
Server side sprites engine. Controls unit's moves
@module movements
*/
'use strict';

var mapSizeX = 720,
    mapSizeY = 360;
var immoveableTextureCodes = [2, 3];
var playerUnitCodes = []; // For agressive

module.exports = {

	/**
	Check whether it is possible to pass through the territory
	@method isMoveable
	@param worldMap {Array} Array representation of world map
	@param unitsMap {Array} Array representation of units position on the map
	@param x {Integer} X coordinate of checkable territory
	@param y {Integer} Y coordinate of checkable territory
	@return {Boolean} Passability of the territory
	*/
	isMoveable: function (worldMap, unitsMap, x, y){
		if (x < 0 || y < 0 || x > mapSizeX || y > mapSizeY) return false;
		
		for (var i=0; i<immoveableTextureCodes.length; i++){
			if (worldMap[x][y] == immoveableTextureCodes[i] ||
				unitsMap[x][y] != 0){
				return false
			}
		}
		return true
	},


	/**
	Save changes in unit's moves
	@method verifyUnitMove
	@param unitsMap {Array} Analog of world map. Element of this is 0 or code of unit
	@param oldX {Integer} Old x coordinate of unit
	@param oldY {Integer} Old y coordinate of unit
	@param newX {Integer} New x coordinate of unit
	@param newY {Integer} New y coordinate of unit
	@param unitID {Integer} Unit's map code
	@return unitsMap {Array} Changed units map

	@todo Broadcast changes?
	*/
	verifyUnitMove: function(unitsMap, oldX, oldY, newX, newY, unitID){
		unitsMap[oldX][oldY] = 0;
		unitsMap[newX][newY] = unitID;
		return unitsMap
	},


	/**
	Checks the presence of a unit within a radius of R from a monster
	and finds it's coordinates
	@method unitIsNear
	@param unitsMap {Array} Analog of world map. Element of this is 0 or code of unit
	@param x {Integer} X coordinate of monster
	@param y {Integer} Y coordinate of monster
	@param R {Integer} Radius in which monster will search for units
	@return array {Array} First element is boolean - presence of a unit.
	The 2nd element	is array of 2 elements - x and y of this unit. Else empty array.
	*/
	unitIsNear: function(unitsMap, x, y, R){
		for (var i=0; i<=R; i++){
			for (var j=0; j<=R; j++){
				if ((i!=0 || j!=0) && (i + j <= R) && (x+i < unitsMap.length && y+j < unitsMap[0].length && x-i >=0  && y-j >= 0)){

					for (var k=0; k<playerUnitCodes.length; k++){
						if (unitsMap[x+i][y+j] == playerUnitCodes[k]){
							console.log("[MOVEMENTS] IS NEAR {"+i+', '+j+"}");
							return [true, [x+i, y+j]]
						}else if (x-i >= 0 && y-j >= 0){
							if (unitsMap[x-i][y-j] == playerUnitCodes[k]){
								console.log("[MOVEMENTS] IS NEAR dx:",-i,', dy:',-j);
								return [true, [x-i, y-j]]
							}
						}
					}

				}
			}
		}
		return [false, []]
	},


	/**
	Finds the shortest step (one-cell movement) to target unit.
	Based on Lee Algorithm (Wave algorithm).
	@method shortestStepTo
	@param map {Array} World map. Used for detect impossible territories for move
	@param unitsMap {Array} Array representation of units position on the map
	@param monsterX {Integer} X coordinate of a monster
	@param monsterY {Integer} Y coordinate of a monster
	@param unitX {Integer} X coordinate of a target unit
	@param unitY {Integer} Y coordinate of a target unit
	@return delta {Array} dx and dy of the shortest step to unit or Infinities
	if unit is unreachable
	*/
	shortestStepTo: function(map, unitsMap, monsterX, monsterY, unitX, unitY){
		// Create a field within which we search
		var field = [],
			xDistance = Math.abs(monsterX - unitX),
			yDistance = Math.abs(monsterY - unitY),
		    distance = xDistance + yDistance,
		    fieldSize = 2*distance + 1;

		for (var i=0; i<Math.min(fieldSize, 300); i++){
			field.push([]);
			for (var j=0; j<Math.min(fieldSize, 300); j++){

				// Is monster
				if (i-distance == 0 && j-distance == 0){
					field[i][j] = {mark: 'start',
					               x: monsterX,
					               y: monsterY,
					               i: i,
					               j: j,
					               passable: true,
					               visited: false,
					               pathLen: 0};
					var start_i = i,
					    start_j = j;

				// Is unit
				}else if (monsterX+i-distance == unitX && monsterY+j-distance == unitY){
					field[i][j] = {mark: 'stop',
				                   x: unitX,
				                   y: unitY,
				                   i: i,
				                   j: j,
				                   passable: true,
				                   visited: false,
				                   pathLen: Infinity};
				    var stop_i = i,
				        stop_j = j;

				// Is block
				}else{
					// Define passability
					if (this.isMoveable(map, unitsMap, monsterX+i-distance, monsterY+j-distance)){
						// Is passable block
						var passability = true
					}else{
						// Is impassable block
						passability = false
					}
					field[i][j] = {mark: 'block',
				                   x: monsterX + i - xDistance,
				                   y: monsterY + j - yDistance,
				                   i: i,
				                   j: j,
				                   passable: passability,
				                   visited: false,
				                   pathLen: Infinity};
				}
			}
		}

		// Field created. Approach Lee algorithm

		// Mark the lengths of the shortest paths to each cell
		var lowLimit = 0,
		    hightLimit = field.length-1,
		    queue = [ [start_i, start_j] ],
		    destinate = false;
		while (queue.length != 0){
			var i = queue[0][0],
			    j = queue[0][1];

			if (field[i][j].visited){
				queue = queue.slice(1, queue.length);
				continue
			}

			if (field[i][j].mark == 'stop'){
				destinate = true
			}

			var pathLen = field[i][j].pathLen;
			field[i][j].visited = true;
			queue = queue.slice(1, queue.length);


			// For every cell in Von Neumann neighborhood we check whether
			// is existed and hasn't shorter path to it
			if (i-1 >= lowLimit){
				if (field[i-1][j].passable && !field[i-1][j].visited){
					// Set new pathLen if we wasn't in this point before
					field[i-1][j].pathLen = pathLen+1;
					queue.push([i-1, j]);
				}
			}
			if (i+1 <= hightLimit){
				if (field[i+1][j].passable && !field[i+1][j].visited){
					field[i+1][j].pathLen = pathLen+1;
					queue.push([i+1, j]);
				}
			}
			if (j-1 >= lowLimit){
				if (field[i][j-1].passable && !field[i][j-1].visited){
					field[i][j-1].pathLen = pathLen+1;
					queue.push([i, j-1]);
				}
			}
			if (j+1 <= hightLimit){
				if (field[i][j+1].passable && !field[i][j+1].visited){
					field[i][j+1].pathLen = pathLen+1;
					queue.push([i, j+1]);
				}
			}
		}

		// Field is marked. We have try to find shortest path. If we did that,
		// let's go backward and find shortestStep
		if (destinate){
			var actualPathLen = fieldSize+2; // Start val
			var queue = [ [stop_i, stop_j] ];

			while (queue.length != 0){
				var i = queue[0][0],
				    j = queue[0][1];

				if (field[i][j].pathLen == 1){
					return [i - start_i, j - start_j]
				}

				var pathLen = field[i][j].pathLen;
				queue = queue.slice(1, queue.length);
				field[i][j].visited = false;

				if (i-1 >= lowLimit){
					if (field[i-1][j].visited && field[i-1][j].pathLen < actualPathLen){
						field[i-1][j].visited = false;
						actualPathLen = field[i-1][j].pathLen;
						queue.push([i-1, j]);
					}
				}
				if (i+1 <= hightLimit){
					if (field[i+1][j].visited && field[i+1][j].pathLen < actualPathLen){
						field[i+1][j].visited = false;
						actualPathLen = field[i+1][j].pathLen;
						queue.push([i+1, j]);
					}
				}
				if (j-1 >= lowLimit){
					if (field[i][j-1].visited && field[i][j-1].pathLen < actualPathLen){
						field[i][j-1].visited = false;
						actualPathLen = field[i][j-1].pathLen;
						queue.push([i, j-1]);
					}
				}
				if (j+1 <= hightLimit){
					if (field[i][j+1].visited && field[i][j+1].pathLen < actualPathLen){
						field[i][j+1].visited = false;
						actualPathLen = field[i][j+1].pathLen;
						queue.push([i, j+1]);
					}
				}
			}
		}
		return [Infinity, Infinity]
	}
}
