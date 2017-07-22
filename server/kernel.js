var mapSizeX = 720,
    mapSizeY = 360;
var playerUnitCodes = []; // For agressive
var playerBuildingCodes = [];//[3, 4];
var immoveableTextureCodes = [2, 3, 4];
var Heap = require('heap');

var kernel = module.exports = {

   dropIndex: function(array, i){
      return array.slice(0, i)
             .concat(array.slice(i+1, array.length))
   },


   /**
   Checks cell with coordinates {x, y} for available for move throw it's texture
   @method isPassable
   @param worldMap {Array of {Arrays}} Representation of worlds' map
   @param x {Integer} Coordinate of a checked cell on X axis
   @param y {Integer} Coordinate of a checked cell on Y axis
   @return {Boolean} Texture passability of this territory
   */
   isPassable: function(worldMap, x, y){
      if (x < 0 || y < 0 || x >= mapSizeX || y >= mapSizeY) return false;

      for (var i=0; i<immoveableTextureCodes.length; i++){
         if (worldMap[x][y] == immoveableTextureCodes[i]) return false;
      }
      return true
   },


   /**
   Checks cell with coordinates {x, y} for the persence of unit in it
   @method isUnit
   @param unitsMap {Array of {Arrays}} Representation of units' location
   @param x {Integer} Coordinate of a checked cell on X axis
   @param y {Integer} Coordinate of a checked cell on Y axis
   @return {Boolean} true if there isn't unit in the cell
   */
   isUnit: function(unitsMap, x, y){
      if (x < 0 || y < 0 || x >= mapSizeX || y >= mapSizeY) return true;
      if (unitsMap[x][y] != 0) return true;

      return false
   },


   /**
   Check whether it is possible to pass through the cell
   @method isMoveable
   @param worldMap {Array of {Arrays}} Representation of worlds' map
   @param unitsMap {Array of {Arrays}} Representation of units' location
   @param x {Integer} Coordinate of a checked cell on X axis
   @param y {Integer} Coordinate of a checked cell on Y axis
   @return {Boolean} Passability of the checked cell
   */
   isMoveable: function (worldMap, unitsMap, x, y){
      return (this.isPassable(worldMap, x, y) && 
                 !this.isUnit(unitsMap, x, y));
   },


   /**
   Finds the shortest path from cell with coordinates {startX, startY} to cell
   with coordinates {stopX, stopY}.
   Based on A* algorithm.
   @todo Fix euristic
  
   @method shortestPath
   
   @param map {Array of {Arrays}} World map representation. Used for detect 
   impossible territories for move
   @param unitsMap {Array of {Arrays}} Array representation of units location 
   on the map
   @param startX {Integer} X coordinate of start cell
   @param startY {Integer} Y coordinate of start cell
   @param stopX {Integer} X coordinate of target cell
   @param stopX {Integer} Y coordinate of start cell
   @param stopRange {Integer} Sufficient distance of approach to the cell
   @param stopDtlRange {Integer} Sufficient limit of full path length. Used for
   cut dotted line on client-side
   
   @return path {Array of {Arrays}} First element is [dx, dy] of the shortest step
   to target. It returns [0, 0] if unit is unreachable or if distance between start
   and stop is less then stopRange. The second element is array of coords in path 
   to target.
   */
   shortestPathTo: function(map, unitsMap, startX, startY, stopX, stopY, stopRange, stopDtlRange){
      var open = new Heap(function(cellA, cellB){ return cellA.f - cellB.f }),
          closed = [],
          abs = Math.abs,
          heuristic = function(currX, currY){ return abs(currX - stopX) + abs(currY - stopY)},
          notClosed = function(x, y){
            for (var i=0; i<closed.length; i++){
               if (closed[i].x == x && closed[i].y == y) { 
                  return false;
               }
            }
            return true},
          notOpened = function(x, y){
            for (var i=0; i<open.nodes.length; i++){
               if (open.nodes[i].x == x && open.nodes[i].y == y) return false;
            }
            return true},
            isExists  = function(x, y){
               if (x >= 0 && x <= mapSizeX && y >= 0 && y <= mapSizeY && kernel.isPassable(map, x, y) && !kernel.isUnit(unitsMap, x, y)) {
                  return true
               }else{
                  return false
               }},
            isEndPoint= function(x, y){
               if ((abs(x-stopX)+abs(y-stopY)) <= stopRange && kernel.isMoveable(map, unitsMap, x, y)) return true;
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
         var x = cell.x,
             y = cell.y;

         
         if ((abs(x-stopX)+abs(y-stopY)) == stopRange)
         {
            var returnedPath = [[cell.x, cell.y]];
            var parent = cell.parent;
            // Path recovery
            while (parent){
               returnedPath.push([parent.x, parent.y]);
               parent = parent.parent;
            }
            returnedPath = returnedPath.reverse();

            // Come closer to target, dtl is closer
            if (stopDtlRange == 0){
               returnedPath.push([stopX, stopY])
            }

            if (returnedPath.length > 1){
               var firstStepdx = returnedPath[1][0] - startX,
                   firstStepdy = returnedPath[1][1] - startY;
            }else{
               firstStepdx = 0;
               firstStepdy = 0;
            }

            return [[firstStepdx, firstStepdy], returnedPath]
         }

         // Too long for searching
         if (closed.length > 2000){
            console.log('Too long');
            return [[0, 0]]
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

         for (var i=0; i<neighbours.length; i++){
            var nx = neighbours[i].x,
                ny = neighbours[i].y,
             ng = 1 + cell.g;

             if (ng < neighbours[i].g) neighbours[i].g = ng;
            
             neighbours[i].f = neighbours[i].h;
             neighbours[i].parent = cell;
             open.push(neighbours[i]);
         }
      }
       return [[0, 0]]
   },


   /**
   Looks for all pair pursuer-pursued and generate a hit when distance between
   pursuer and pursued is less or equal with it's attack range
   @method processHits
   @param hitFunction {Function} Callback for handle creatures' hit on something.
   It must take a stock the resistance of pursued target, HP and etc.
   @param pursuers {Array of {Objects}} Representation of pursuers-creatures
   @param pursuedBuildingsCoords {Array of {Objects}}
   @param pursuedCreaturesCoords {Array of {Objects}}
   */
   processHits: function(hitFunction, pursuers, pursuedBuildingsCoords, pursuedCreaturesCoords){
      // At first, process Unit->Building and Monster->Building hits
      var builds = pursuedBuildingsCoords,
          abs    = Math.abs,
          near   = function(x1, y1, x2, y2){ return (abs(x1-x2)+abs(y1-y2)==1)? true : false }
      for (var i=0; i<builds.length; i++){
         for (var j=0; j<pursuers.length; j++){
            if (near(builds[i].x, builds[i].y, pursuers[j].x, pursuers[j].y) && 
               builds[i].owner != pursuers[j].owner){
               // && cooldown
               console.log('[ATTACK] {'+pursuers[j].x+', '+pursuers[j].y+
                  '} attacks build {'+builds[i].x+', '+builds[i].y+
                  '}(near(',builds[i].x, builds[i].y, pursuers[j].x, pursuers[j].y,')='
                  +near(builds[i].x, builds[i].y, pursuers[j].x, pursuers[j].y)+')');
            }
         }
      }

      // Secondly, process Unit -> Monster
      var creatures = pursuedCreaturesCoords;
      for (var i=0; i<creatures.length; i++){
         for (var j=0; j<pursuers.length; j++){
            if (near(creatures[i].x, creatures[i].y, pursuers[j].x, pursuers[j].y) && 
               creatures[i].owner != pursuers[j].owner){
               console.log('[ATTACK] {'+pursuers[j].x+', '+pursuers[j].y+
                  '} attacks creature {'+creatures[i].x+', '+creatures[i].y+
                  '}(near(',creatures[i].x, creatures[i].y, pursuers[j].x, pursuers[j].y,')='
                  +near(creatures[i].x, creatures[i].y, pursuers[j].x, pursuers[j].y)+')');
            }
         }
      }
   }
}