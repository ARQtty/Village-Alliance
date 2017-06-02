/**
Sprite logic of the app
@module sprites
*/
$(function() {
window.app.sprites = {
	sprCanvas: document.getElementById('monstersGameField'),

	/**
	Catches socket's event and run appropriate functions
	@method listenActions
	*/
	listenActions: function() {
		socket = app.network.socket;
		socket.on('newUnit', function(data){
			console.log('newUnit on ['+data.x+', '+data.y+']');
			app.sprites.coords[data.x, data.y] = data;
			app.sprites.drawViewportSprites();
		});
		socket.on('moveUnit', function(data){
			console.log('moveUnit message');
		});
		socket.on('hitUnit', function(data){
			console.log('hitUnit message');
		});
		socket.on('hurtUnit', function(data){
			console.log('hurtUnit message');
		});
		console.info('Okey init listenActions');
	},

	coords: {},


	/**
	Drawing on monsters on game field
	@method drawViewportSprites
	*/
	drawViewportSprites: function() {
		app.sprites.sprCanvas.width = document.body.clientWidth;
		app.sprites.sprCanvas.height = document.body.clientHeight;
		var sprContext = app.sprites.sprCanvas.getContext('2d');

		var sprites2draw = app.sprites.getViewportSprites();
		var cSize = app.graphics.cellSize;
		
		for (var i = 0; i < sprites2draw.lenght; i++){
			x1 = app.graphics.x1 - sprites2draw[i].x;
			y1 = app.graphics.y1 - sprites2draw[i].y;
			sprContext.drawImage(app.graphics.textures.monsters,
								 sprites2draw[i].textureType * cSize,
								 3 * cSize,
								 cSize,
								 cSize,
								 x1 * cSize,
								 y1 * cSize,
								 cSize,
								 cSize);
		}
	},


	/**
	Scan mosters array and return monsters which are in viewport
	@method getViewportSprites
	@return sprites {Array} Array of objects - monsters information
	*/
	getViewportSprites: function() {
		var returnableSprites = [];
		var arr = app.sprites.coords;
		for (var i = 0; i < app.sprites.coords.lenght; i++){
			if (arr[i].x >= app.graphics.x1 &&
				arr[i].x <= app.graphics.x2 &&
				arr[i].y >= app.graphics.y1 &&
				arr[i].y <= app.graphics.y2){
				returnableSprites.push(arr[i])
			}
		}
		return returnableSprites
	}
}})