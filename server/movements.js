/**
Server side sprites engine. Controls unit's moves
@module movements
*/
'use strict';

var mapSizeX = 720,
    mapSizeY = 360;
var playerUnitCodes = [7]; // For agressive
var Heap = require('heap');


var a = module.exports = {
	
	immoveableTextureCodes: [2, 3],


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
		if (x < 0 || y < 0 || x >= mapSizeX || y >= mapSizeY) return false;
		
		for (var i=0; i<a.immoveableTextureCodes.length; i++){
			if (worldMap[x][y] == a.immoveableTextureCodes[i] ||
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
		for (var i=-R; i<=R; i++){
			for (var j=-R; j<=R; j++){
				if (!(i==0 && j==0) && (Math.abs(i) + Math.abs(j) <= R) &&  // In search field
					(x+i < unitsMap.length    && x+i >= 0) &&               // x axis defined cells
					(y+j < unitsMap[0].length && y+j >= 0)){                // y axis defined cells

					for (var k=0; k<playerUnitCodes.length; k++){
						if (unitsMap[x+i][y+j] == playerUnitCodes[k]){
							console.log("[MOVEMENTS] IS NEAR {"+(x+i)+', '+(y+j)+"}");
							return [true, [x+i, y+j]]
						}
					}
				}
			}
		}
		return [false, []];
	},


	/**
	Finds the shortest path to target cell.
	Based on A* algorithm.
	@method shortestPathTo
	@param map {Array} World map. Used for detect impossible territories for move
	@param unitsMap {Array} Array representation of units position on the map
	@param startX {Integer} X coordinate of start cell
	@param startY {Integer} Y coordinate of start cell
	@param stopX {Integer} X coordinate of target cell
	@param stopX {Integer} Y coordinate of start cell
	@param moveIndex {Integer} Index of movement in server core loop
	@param callback {Function} Callback for send data or drop movement if there is no moves
	@return path {Array} First element is [dx, dy] of the shortest step to unit or Infinities
	if unit is unreachable (else 1 elem array with elem [0, 0]). The second element is array 
	of coords in path to target
	*/
	shortestPathTo: function(map, unitsMap, startX, startY, stopX, stopY, moveIndex, callback){
		let open = new Heap(function(cellA, cellB){
			                    return cellA.f - cellB.f
		                    }),
		    closed = [],
		    heuristic = function(currX, currY){ return Math.abs(currX - stopX)+ Math.abs(currY - stopY)},
		    fromStart = function(currX, currY){ return Math.abs(currX - startX)+Math.abs(currY - startY)},
		    notClosed = function(x, y){
		    	for (let i=0; i<closed.length; i++){
		    		if (closed[i].x == x && closed[i].y == y) { 
		    			return false;
		    		}
		    	}
		    	return true},
		    notOpened = function(x, y){
		    	for (let i=0; i<open.nodes.length; i++){
		    		if (open.nodes[i].x == x && open.nodes[i].y == y) return false;
		    	}
		    	return true},
		   	isExists  = function(x, y){
		   		if (x >= 0 && x <= mapSizeX && y >= 0 && y <= mapSizeY && 
		   			a.isMoveable(map, unitsMap, x, y)){
		   			return true
		   		}else{
		   			return false
		   		}},
		   	isEndPoint= function(x, y){
		   		if (x == stopX && y == stopY) return true;
		   		return false},
		   	makeCell  = function(x, y){
		   		return {x: x, 
		   			    y: y, 
		   			    h: heuristic(x, y)}
		   		},
		    startCell = {x: startX,
		                 y: startY,
		                 g: 0,
		                 h: 0,
		                 f: 0},
		    stopCell = {x: stopX,
		                y: stopY,
		                },
		    neighbours, ng, cell;

	    open.push(startCell);

	    while (!open.empty()){
	    	cell = open.pop();
	    	closed.push(cell);
	    	neighbours = [];
	    	let x = cell.x,
	    	    y = cell.y;

	    	if (cell.x == stopX && cell.y == stopY){
	    		let returnedPath = [[cell.x, cell.y]];
	    		let parent = cell.parent;
	    		while (parent){
	    			returnedPath.push([parent.x, parent.y]);
	    			parent = parent.parent;
	    		}
	    		returnedPath = returnedPath.reverse();
	    		let firstStepdx = returnedPath[1][0] - returnedPath[0][0],
	    		    firstStepdy = returnedPath[1][1] - returnedPath[0][1];

	    		//console.log('Return DXDY',firstStepdx, firstStepdy, 'when start {',startX,startY,'} and stop {',stopX,stopY,'}');
	    		callback([[firstStepdx, firstStepdy], returnedPath], moveIndex);return
	    	}

	    	// Get neighbours
	    	if (notClosed(x+1, y)){
		    	if ((isExists(x+1, y) && notOpened(x+1, y)) || isEndPoint(x+1, y)){
	    			neighbours.push(makeCell(x+1, y)); 
	    		}
	    	}else{closed.push(makeCell(x+1, y))}

	    	if (notClosed(x, y+1)){
		    	if ((isExists(x, y+1) && notOpened(x, y+1)) || isEndPoint(x, y+1)){
	    			neighbours.push(makeCell(x, y+1)); 
	    		}
	    	}else{closed.push(makeCell(x, y+1))}

	    	if (notClosed(x-1, y)){
		    	if ((isExists(x-1, y) && notOpened(x-1, y)) || isEndPoint(x-1, y)){
	    			neighbours.push(makeCell(x-1, y)); 
	    		}
	    	}else{closed.push(makeCell(x-1, y))}

	    	if (notClosed(x, y-1)){
		    	if ((isExists(x, y-1) && notOpened(x, y-1)) || isEndPoint(x, y-1)){
	    			neighbours.push(makeCell(x, y-1)); 
	    		}
	    	}else{closed.push(makeCell(x, y-1))}

	    	for (let i=0; i<neighbours.length; i++){
	    		let nx = neighbours[i].x,
	    		    ny = neighbours[i].y,
    		    ng = 1 + cell.g;

    		    neighbours[i].g = ng;
    		   
    		    neighbours[i].f = neighbours[i].h + ng;
    		    neighbours[i].parent = cell;
    		    open.push(neighbours[i]);
			}
    	}
	    callback([[0, 0]], moveIndex);return
	}
}