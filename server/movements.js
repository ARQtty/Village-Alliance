/**
Server side sprites engine. Controls unit's moves
@module movements
*/
'use strict';
var playerUnitCodes = [7]; // For agressive
var playerBuildingCodes = [3, 4];
var imbuildableTextureCodes = [2, 3, 4];


module.exports = {
   
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
   Handles player's message about build new structure. Shared build event if
   building can be constracted.
   @method verifyBuild
   @param worldMap {Array of {Arrays}} World map representation
   @param socket {Object} Socket for broadcast build message
   @param x {Integer} X coordinate of cell
   @param y {Integer} Y coordinate of cell
   param structureID {Integer} Identificator of new building on the map
   @todo Checking possibility of building at this territory (as ex. on water)
   @return map {Array} World map with verified structure
   */
   verifyBuild: function(worldMap, socket, x, y, structureID){
      for (var i=0; i<imbuildableTextureCodes.length; i++){
         if (worldMap[x][y] == imbuildableTextureCodes[i]){
            console.log('[PL_ACTIONS] Cannot build here')
            return worldMap
         }
      }
      worldMap[x][y] = structureID;
      socket.emit('newBuild', {x: x, y: y, code: structureID});
      socket.broadcast.emit('newBuild', {x: x, y: y, code: structureID});
      return worldMap
   },


   /**
   Checks the presence of a unit within a radius of R from a monster
   and finds it's coordinates
   @method unitIsNear
   @param unitsMap {Array} Analog of world map. Element of this is 0 or code of unit
   @param x {Integer} X coordinate of monster
   @param y {Integer} Y coordinate of monster
   @param R {Integer} Radius in which monster will search for units
   @return {Object} It has param instance (bool) - presence of a unit, x and y
   */
   unitIsNear: function(unitsMap, x, y, R){
      for (var i=-R; i<=R; i++){
         for (var j=-R; j<=R; j++){
            if (!(i==0 && j==0) && (Math.abs(i) + Math.abs(j) <= R) &&  // In search field
               (x+i < unitsMap.length    && x+i >= 0) &&               // x axis defined cells
               (y+j < unitsMap[0].length && y+j >= 0)){                // y axis defined cells

               for (var k=0; k<playerUnitCodes.length; k++){
                  if (unitsMap[x+i][y+j] == playerUnitCodes[k]){
                     console.log('Unit is near');
                     return {instance: true, 
                            x: x+i, 
                            y: y+j}
                  }
               }
            }
         }
      }
      return {instance: false}
   },


   /**
   Checks the presence of a building within a radius of R from a monster
   and finds it's coordinates
   @method unitIsNear
   @param worldMap {Array} World map representation. Element of this is 0 or code of building
   @param x {Integer} X coordinate of monster
   @param y {Integer} Y coordinate of monster
   @param R {Integer} Radius in which monster will search for units
   @return {Object} It has param instance (bool) - presence of a building, x and y
   */
   buildingIsNear: function(map, x, y, R){
      for (var i=-R; i<=R; i++){
         for (var j=-R; j<=R; j++){
            if (!(i==0 && j==0) && (Math.abs(i) + Math.abs(j) <= R) &&  // In search field
               (x+i < map.length    && x+i >= 0) &&               // x axis defined cells
               (y+j < map[0].length && y+j >= 0)){                // y axis defined cells

               for (var k=0; k<playerBuildingCodes.length; k++){
                  if (map[x+i][y+j] == playerBuildingCodes[k]){
                     console.log('building is near');
                     return {instance: true, 
                            x: x+i, 
                            y: y+j}
                  }
               }
            }
         }
      }
      return {instance: false}
   }
}