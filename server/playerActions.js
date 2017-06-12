/**
Handling player's actions
@module playerActions
*/
var imbuildableTextureCodes = [2, 3];

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
	}
}