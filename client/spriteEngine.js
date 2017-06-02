/**
Sprite logic of the app
@module sprites
*/
$(function() {
window.app.sprites = {
	sprCanvas: document.getElementById('monstersGameField'),
	fps: 50,


	/**
	Catches socket's event and run appropriate functions
	@method listenActions
	*/
	listenActions: function() {
		socket = app.network.socket;
		socket.on('newUnit', function(data){
			console.log('newUnit on ['+data.x+', '+data.y+']');
			app.sprites.coords.push(data);
			app.sprites.drawViewportSprites();
		});

		socket.on('moveUnit', function(data){
			console.log('moveUnit message');
			app.sprites.moving.updateCoords(data);
		});
		
		socket.on('hitUnit', function(data){
			console.log('hitUnit message');
		});
		
		socket.on('hurtUnit', function(data){
			console.log('hurtUnit message');
		});
		console.info('Okey init listenActions');
	},


	initGameLoop: function() {
		setInterval(app.sprites.moving.gameLoop, app.sprites.fps);
		console.info('Okey init game loop')
	},

	coords: [],

	moving: {

		updateCoords: function(event) {
			/* Called at moveUnit, dethUnit and etc. events */
			var arr = app.sprites.coords;
			for (var i=0; i<arr.length; i++){
				
				if (arr[i].id == event.id){
					switch (event.action){

						case 'move':
							arr[i].moving.need2Move = true;
							console.log(event.dx, ' -- ', event.dy);
							arr[i].moving.need2MoveX += event.dx;
							arr[i].moving.need2MoveY += event.dy;
							break;

						default:
							console.log('"'+event.action+'"')
					}
				}
			}
			app.sprites.coords = arr;
		},

		gameLoop: function() {
			/* Drawing unit's moves - updating canvas */
			var toMove = app.sprites.getViewportSprites();
			var dt = app.sprites.fps;

			for (var i=0; i<toMove.length; i++){
				if (toMove[i].moving.need2Move) {
					/* Moves are creating on server side. Serves using
					   A* (on plan) algorithm and send next move when
					   actual move is finished. */

					// Speed in blocks/s, x in blocks
					var dS = toMove[i].moving.speed / 1000;

					// Should we moving sprite?
					if (Math.abs(toMove[i].moving.need2MoveX) > dS ||
						Math.abs(toMove[i].moving.need2MoveY) > dS){
						
						// Moving one axis
						//console.log(Math.abs(toMove[i].moving.need2MoveX), '  ' ,Math.abs(toMove[i].moving.need2MoveY));

						if (Math.abs(toMove[i].moving.need2MoveX) > Math.abs(toMove[i].moving.need2MoveY)){

							if (toMove[i].moving.need2MoveX > 0){
								toMove[i].moving.need2MoveX -= dS;
								toMove[i].x += dS;
							}else{
								toMove[i].moving.need2MoveX += dS;
								toMove[i].x -= dS;
							}

						}else{

							if (toMove[i].moving.need2MoveY > 0){
								toMove[i].moving.need2MoveY -= dS;
								toMove[i].y += dS;
							}else{
								toMove[i].moving.need2MoveY += dS;
								toMove[i].y -= dS;
							}
						}

						// Finally, check compleating the movement
						if (Math.abs(toMove[i].moving.need2MoveX) < dS &&
							Math.abs(toMove[i].moving.need2MoveY) < dS){
							toMove[i].moving.need2Move = false;
							toMove[i].moving.need2MoveX = 0;
							toMove[i].moving.need2MoveY = 0;
						}
					}
				}
			}
			// Redraw gamefield after all movements
			window.app.graphics.fillMap();
			app.sprites.drawViewportSprites();
		}
	},


	/**
	Scan mosters array and return monsters which are in viewport
	@method getViewportSprites
	@return sprites {Array} Array of objects - monsters information
	*/
	drawViewportSprites: function() {
		context = window.app.graphics.canvas.getContext('2d');
		var sprites2draw = app.sprites.getViewportSprites();
		var cSize = app.graphics.cellSize;
		
		for (var i = 0; i < sprites2draw.length; i++){
			x1 = sprites2draw[i].x - app.graphics.x1;
			y1 = sprites2draw[i].y - app.graphics.y1;
			context.drawImage(app.graphics.textures.monsters,
							  // TODO -> "rotate" sprites
							  5 * cSize, // full-face postion
							  sprites2draw[i].textureType * cSize,
							  cSize,
							  cSize,
							  x1 * cSize,
							  y1 * cSize,
							  cSize,
							  cSize);
		}
	},

	getViewportSprites: function() {
		/* Called at viewport move 
		   Returns array of Objects - units*/
		var inViewport  = [];
		var arr = app.sprites.coords;
		for (var i = 0; i < app.sprites.coords.length; i++){
			if (arr[i].x >= app.graphics.x1 &&
				arr[i].x <= app.graphics.x2 &&
				arr[i].y >= app.graphics.y1 &&
				arr[i].y <= app.graphics.y2)
				{

				inViewport.push(arr[i])
			}
		}
		return inViewport
	}
}})