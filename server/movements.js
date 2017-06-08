/**
Server side sprites engine. Controls unit's moves
@module movements
*/
'use strict';

var immoveableTextureCodes = [2, 3];
var playerUnitCodes = [1];

var md = module.exports = {

	/**
	Check whether it is possible to pass through the territory
	@method isMoveable
	@param map {Array} Array representation of world map
	@param x {Integer} X coordinate of checkable territory
	@param y {Integer} Y coordinate of checkable territory
	@return {Boolean} Passability of the territory
	*/
	isMoveable: function (map, x, y){
		if (x < 0 || y < 0) return false;

		for (var i=0; i<immoveableTextureCodes.length; i++){
			if (map[x][y] == immoveableTextureCodes[i]){
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
	Checks the presence of a unit within a radius of P from a monster 
	and finds it's coordinates
	@method unitIsNear
	@param unitsMap {Array} Analog of world map. Element of this is 0 or code of unit
	@param x {Integer} X coordinate of monster
	@param y {Integer} Y coordinate of monster
	@param R {Integer} Radius in which monster will search for units
	@return array {Array} First element is boolean - presence of a unit. The 2nd element \
	is array of 2 elements - x and y of this unit. Else empty array.
	*/
	unitIsNear: function(unitsMap, x, y, R){
		for (var i= -R; i<=R; i++){
			for (var j= -R; j<=R; j++){
				if ((i!=0 && j!=0) && (Math.abs(i) + Math.abs(j) <= R)){

					for (var k=0; k<playerUnitCodes.length; k++){
						if (unitsMap[i][j] == playerUnitCodes[k]){
							return [true, [i, j]]
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
	@param monsterX {Integer} X coordinate of a monster
	@param monsterY {Integer} Y coordinate of a monster
	@param unitX {Integer} X coordinate of a target unit
	@param unitY {Integer} Y coordinate of a target unit
	@return point {Array}
	*/
	shortestStepTo: function(map, monsterX, monsterY, unitX, unitY){
		
		// Create a field within which we search
		var field = [],
			xDistance = Math.abs(monsterX - unitX),
			yDistance = Math.abs(monsterY - unitY),
		    distance = xDistance + yDistance;
		    //fieldSize = 2*distance + 1;
		console.log("Distance between {"+monsterX+','+monsterY+'} and {'+unitX+','+unitY+'} is '+distance);

		for (var i=0; i<map.length; i++){
			field.push([]);
			console.log(i);
			for (var j=0; j<map[0].length; j++){
				
				// Is monster
				if (i == distance && j == distance){
					field[i][j] = {mark: 'start',
					               x: monsterX,
					               y: monsterY,
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
				                   passable: true,
				                   visited: false,
				                   pathLen: Infinity};
				
				// Is block
				}else{

					// Define passability
					if (this.isMoveable(map, monsterX+i-distance, monsterY+j-distance)){
						// Is passable block
						var passability = true
					}else{
						// Is impassable block
						passability = false
					}

					field[i][j] = {mark: 'block',
				                   x: monsterX + i - xDistance,
				                   y: monsterY + j - yDistance,
				                   passable: passability,
				                   visited: false,
				                   pathLen: Infinity};
				}
				
			}
		}
		console.log("Field shapes are: "+field.length, field[0].length);

		// Field created. Approach Lee algorithm
		
		// Mark the lengths of the shortest paths to each cell
		var lowLimit = 0,
		    hightLimit = field.length;
		var queue = [ [start_i, start_j] ];

		while (queue.length != 0){
			var i = queue[0][0],
			    j = queue[0][1];

			if (field[i][j].visited){
				queue = queue.slice(1, queue.length);
				continue
			}
			if (field[i][j].mark == 'stop'){
				field[i][j].pathLen = '!';
				return field
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
		return field



		return [toX, toY]
	}

}

var fld = md.shortestStepTo(require('../media/map.json'), 154, 280,  177, 176);

for (var i=0; i<fld.length; i++){
	var outStr = '';
	for (var j=0; j<fld[0].length; j++){
		/*
		switch (fld[j][i].mark){
			case 'start':
				var out = 'M';break;
			case 'stop':
				var out = 'U';break;
			case 'block':
				var out = (fld[j][i].passable)? '+':'-';break;
		}*/
		var out = (fld[j][i].pathLen == Infinity)? '0':fld[j][i].pathLen;
		//out = (fld[j][i].visited == true)? '+' : '-';
		outStr += ', ' + out;
		//out = '(('
	}
	console.log('[' + outStr + '],');
}