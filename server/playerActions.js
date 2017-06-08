/**
Handling player's actions
@module playerActions
*/

module.exports = {
	/**
	@method verifyBuild
	@todo Checking possibility of building at this territory (as ex. on water)
	@return map {Array} World map with verified structure
	*/
	verifyBuild: function(map, socket, x, y, structureID){
		map[x][y] = structureID;
		socket.broadcast.emit('newBuild', {x, y, structureID});
		return map
	}
}