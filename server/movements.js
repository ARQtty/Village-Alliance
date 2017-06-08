/**
Server side sprites engine. Controls unit's moves
@module movements
*/
'use strict';

var immoveableTextureCodes = [2, 3];
var playerUnitCodes = [1];

module.exports = {

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

	@method shortestStepTo
	@return point {Array}
	*/
	shortestStepTo: function(monsterX, monsterY, unitX, unitY){
		// TODO
		// TODO upd docs

		return [toX, toY]
	}

}