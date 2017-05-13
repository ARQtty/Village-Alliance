$(function() {
window.app = {

	downloadWorld: function () {
		$.when(
			app.graphics.textures.download(
				'/media/textures/terrain.png',
				app.graphics.textures.terrain
			),
			app.graphics.textures.download(
				'/media/textures/monsters.png',
				app.graphics.textures.monsters
			),
			app.environment.downloadMap(),
			app.environment.downloadData()
		).done(function() {
			console.info('Okey downloadWorld');
			app.intialize();
		});
	},

	intialize: function() {
		app.graphics.intialize();
		app.keyBinds.init();
		app.network.connectSocket();
		app.network.bindEvents();
	},

	environment: {

		map: {
			data: []
		},

		downloadData: function() {
            return $.get('/media/data.json').pipe(function(data) {
	            app.graphics.textures.descriptors = data;
	            return true;
            });
        },

        downloadMap: function() {
        	return $.get('/media/map.json').pipe(function(data) {
        		app.environment.map.sizeX = data.length;
        		app.environment.map.sizeY = data[0].length;
           		console.info('Map sizes: x='+data.length+' y='+data[0].length);
	            app.environment.map.data = data;
	            return true;
      		})
		},

		getTextureInfo: function(x, y) {
			var textureId = width.app.environment.getCellByPosition(x, y);
			console.log(textureId);
			return width.app.graphics.textures.descriptors[textureId]
		},

		getCellByPosition: function(top, left) {
			/* Get cell value by click coords */

			var topIndex = Math.floor(top / app.graphics.cellSize)
			var leftIndex = Math.floor(left / app.graphics.cellSize)
			
			console.log('cells['+topIndex.toString()+']['+leftIndex.toString()+'] value='+app.graphics.cells[topIndex][leftIndex])

			return app.graphics.cells[topIndex][leftIndex]
		},

		getCellCoords: function(x, y) {
			var xIndex = Math.floor(x / app.graphics.cellSize);
			var yIndex = Math.floor(y / app.graphics.cellSize);
			return [xIndex, yIndex]
		}
	},

	graphics: {
		cellSize: 32,
		x1: 0,
		y1: 0,
		x2: Math.ceil(document.body.clientWidth  / 32),
		y2: Math.ceil(document.body.clientHeight / 32),
		cells: [],
		
		cellsInRow: Math.ceil(document.body.clientWidth  / 32),
		cellsInColumn: Math.ceil(document.body.clientHeight / 32),

		canvas: document.getElementById('game'),

		textures: {
			terrain: new Image(),
			monsters: new Image(),
			descriptors: {
				terrain: null,
				monsters: null
			},
		
			download: function(url, texture) {
				var d = $.Deferred();
				texture.src = url;
				texture.onload = function() { d.resolve(); }
				texture.onerror = function() { d.reject(); }
				return d.promise();
			}
		},

		getViewport: function() {
			var viewCells = [];

			for (var x = app.graphics.x1; x < app.graphics.x2; x++){
				viewCells.push([]);
				for (var y = app.graphics.y1; y < app.graphics.y2; y++){
					viewCells[viewCells.length - 1].push(app.environment.map.data[x][y]);
				}
			}
			console.log('Viewport:');
			console.log(' x1='+app.graphics.x1
					   +' y1='+app.graphics.y1);
			console.log(' x2='+app.graphics.x2
					   +' y2='+app.graphics.y2);
			app.graphics.cells = viewCells;
			return viewCells
		},

		fillMap: function() {
			var context = app.graphics.canvas.getContext('2d');
			
			app.graphics.canvas.width = document.body.clientWidth;
			app.graphics.canvas.height = document.body.clientHeight;
			// Представление всех ячеек
			var cells = app.graphics.getViewport();

			for (var x = 0; x < cells.length; x++){
				for (var y = 0; y < cells[x].length; y++){

					var cellValue = cells[x][y];
					var cSize = app.graphics.cellSize;

					if (cellValue < 4) {
						// terrain
						var texture = app.graphics.textures.terrain;
						context.drawImage(texture,			// Image
										  cellValue,        // sx
										  cellValue * cSize,// sy
										  cSize, 			// sWidth
										  cSize,			// sHeight
										  x * cSize,		// dx
										  y * cSize, 		// dy
										  cSize, 			// dWidth
										  cSize				// dHeight
										  );
					}else{
						// mobs
						console.log('Monster on ['+x+', '+y+']');
						var textures = app.graphics.textures.monsters;
						cellValue -= 4;
						//app.sprites.drawSprite(x, y, cellValue)
					}
					
					
				}
			}
		},


		fillCellWithTexture: function(x, y, textureId) {
			/* Build structure in cell with coords x, y */
			app.environment.map.data[y + app.graphics.x1][x + app.graphics.y1] = textureId;
			app.graphics.fillMap()
		},

		intialize: function() {
			app.graphics.fillMap();
			console.info('Okey intialize graphics');
		},

		sprites: {

		}
	},

	chat: {
		chatPanel: document.getElementById('messagefield'),
		$output: $('#messages'),
        $input: $('#message-input'),

        sendMessage: function() {
				var message = app.chat.$input.val();
				app.chat.$input.val('');
				app.chat.message('P1', message);
				app.network.send.chat(message);
        },

		toggle: function() {
			/* Enter button controls chatPanel.
			   Show if hidden, hide if showing and it 
			   hasn't any message. Or send message */
			if (app.chat.chatPanel.style.display == 'block'){
			
				if (app.chat.$input.val() != ''){ app.chat.sendMessage() }
				else{ app.chat.chatPanel.style.display = 'none' }
			
			}else{ app.chat.chatPanel.style.display = 'block' }
		},

		message: function(who, message) {
			/* Defence from XSS */
			message = message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            who = who.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            app.chat.$output
                .append("<div class='message'><span class='username'>" + who + ": </span><span class='content'>" + message + "</span></div>")
		}
	},

	network: {
		socket: null,
		connectSocket: function() {
			app.network.socket = io.connect(window.document.location.protocol + "//" + window.document.location.host);
		},

		send: {
			chat: function(message) {
				app.network.socket.emit('chat', {
					name: 'Someone happy',
					message: message
				});
			}
		},

		bindEvents: function() {
			var socket = app.network.socket;

			socket.on('chat', function (data) {
				app.chat.message(data.name, data.message);
			});
		}
	},

	keyBinds: {

		init: function() {
			$(document).keydown(app.keyBinds.keyboardHandler);
		},

		keyboardHandler: function(e) {
			if (e.keyCode == 13){
				/* Enter */
				app.chat.toggle();

			/* Move viewport */
			}else if (e.keyCode == 38){
				app.moveViewport.moveUp();
				e.preventDefault();
			}else if (e.keyCode == 39){
				app.moveViewport.moveRight();
				e.preventDefault();
			}else if (e.keyCode == 40){
				app.moveViewport.moveDown();
				e.preventDefault();
			}else if (e.keyCode == 37){
				app.moveViewport.moveLeft();
				e.preventDefault();

			}else if (e.keyCode == 192){
				// ` key
				e.preventDefault();
				app.moveViewport.displayMap()

			}else{
				console.log('Unbinded keyCode "'+e.keyCode+'"')
			}
		}
	}
};
app.downloadWorld();
});
