/**
Handling player's actions
@module playerActions
*/
var imbuildableTextureCodes = [2, 3],
    pursuedUnitsCoords = [];

module.exports = {
	/**
	@method verifyBuild
	@todo Checking possibility of building at this territory (as ex. on water)
	@return map {Array} World map with verified structure
	*/
	verifyBuild: function(map, socket, x, y, structureID){
		console.log('[PL_ACTIONS] Map[x][y] = ', map[x][y]);
		for (var i=0; i<imbuildableTextureCodes.length; i++){
			if (map[x][y] == imbuildableTextureCodes[i]){
				console.log('[PL_ACTIONS] Cannot build here')
				return map
			}
		}
		map[x][y] = structureID;
		socket.emit('newBuild', {x: x, y: y, code: structureID});
		socket.broadcast.emit('newBuild', {x: x, y: y, code: structureID});
		return map
	},


	startPursueUnit: function(moveData){
		pursuedUnitsCoords.push({x: moveData.targetX,
			                     y: moveData.targetY,
			                     moveID: moveData.moveID});
	},


	stopPursueUnit: function(moveID){
		for (var i=0; i<pursuedUnitsCoords.length; i++){
			if (pursuedUnitsCoords[i].moveID == moveID){
				console.log('[PL_ACTIONS] Stop pursue moveID '+ moveID);
				pursuedUnitsCoords = pursuedUnitsCoords.slice(0, i).concat(pursuedUnitsCoords.slice(i+1, pursuedUnitsCoords.length));
			}
		}
	},


	isPursued: function(unit){
		for (var i=0; i<pursuedUnitsCoords.length; i++){
			if ((unit.x       == pursuedUnitsCoords[i].x && unit.y       == pursuedUnitsCoords[i].y) ||       // For monster -> something
			    (unit.targetX == pursuedUnitsCoords[i].x && unit.targetY == pursuedUnitsCoords[i].y))         // For unit    -> something   
			{
				return true
			}
		}
		return false
	},

	updatePursueTarget: function(oldTargetX, oldTargetY, newTargetX, newTargetY, pursuers){
		for (var i=0; i<pursuedUnitsCoords.length; i++){
			if (pursuedUnitsCoords[i].x == oldTargetX && pursuedUnitsCoords[i].y == oldTargetY){
				pursuedUnitsCoords[i].x = newTargetX;
				pursuedUnitsCoords[i].y = newTargetY;
				console.log('[PL_ACTIONS] Okey update pursuedUnitsCoords', pursuedUnitsCoords);
			}
		}

		for (var i=0; i<pursuers.length; i++){
			if (pursuers[i].targetX == oldTargetX && pursuers[i].targetY == oldTargetY){

				pursuers[i].targetX = newTargetX;
				pursuers[i].targetY = newTargetY;
				console.log('[PL_ACTIONS] Okey update pursuers ',pursuers);
			}
		}
		return pursuers

		//throw new Error('Cannot find pursue with target {'+oldTargetX+','+oldTargetY+'} in updatePursueTarget');
	}
} 