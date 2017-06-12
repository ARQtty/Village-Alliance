/**
General application logic. It is planned to divide into parts
@module engine
*/
$(function() {
window.app = {

	/**
	Gets textures and map from server. Is an entry-point of client-part of the app
	@method downloadWorld
	*/
	downloadWorld: function () {
		$.when(
			app.graphics.textures.download(
				'/media/textures/grass.png',
				app.graphics.textures.grass
			),
			app.graphics.textures.download(
				'/media/textures/road.png',
				app.graphics.textures.road
			),
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
		app.sprites.listenActions();
		app.sprites.initGameLoop();
	},


	/**

	@memberof engine
	@module environment
	*/
	environment: {

		map: {
			data: []
		},


		/**
		Gets textures descriptors from server
		@method downloadData
		*/
		downloadData: function() {
            return $.get('/media/data.json').pipe(function(data) {
	            app.graphics.textures.descriptors = data;
	            return true;
            });
        },


        /**
        Gets array-like map from server. Also gets size of map
		@method
        */
        downloadMap: function() {
        	return $.get('/media/map.json').pipe(function(data) {
        		app.environment.map.sizeX = data.length;
        		app.environment.map.sizeY = data[0].length;
           		console.info('Map sizes: x='+data.length+' y='+data[0].length);
	            app.environment.map.data = data;
	            return true;
      		})
		},


		/**
		Gets information about texture from it's ID. MAYBE USELESS
		@method getTextureInfo
		@param x {Integer}
		@param y {Integer}
		@return description {Object}
		*/
		getTextureInfo: function(x, y) {
			var textureId = width.app.environment.getCellByPosition(x, y);
			console.log(textureId);
			return app.graphics.textures.descriptors[textureId]
		},


		/**
		Gets cell value by click coordinates
		@method getCellByPosition
		@param top {Integer} Distance from top of window
		@param left {Integer} Distance from left of window
		@return cells[top][left] {Integer} Value of cell in this position 
		*/
		getCellByPosition: function(top, left) {
			var topIndex = Math.floor(top / app.graphics.cellSize)
			var leftIndex = Math.floor(left / app.graphics.cellSize)
			
			console.log('cells['+topIndex.toString()+']['+leftIndex.toString()+'] value='+app.graphics.cells[topIndex][leftIndex])

			return app.graphics.cells[topIndex][leftIndex]
		},


		/**
		Gets cells coordinates from mouse click coordinates
		@method getCellCoords
		@param x {Integer} Distance in pixels from left of window
		@param y {Integer} Distance in pixels from top of window
		@return [xIndex, yIndex] {Array} Indexes of cell in world map
		*/
		getCellCoords: function(x, y) {
			var xIndex = Math.floor(x / app.graphics.cellSize);
			var yIndex = Math.floor(y / app.graphics.cellSize);
			return [xIndex, yIndex]
		}
	},


	/**

	@module graphics
	*/
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
			grass: new Image(),
			road: new Image(),
			terrain: new Image(),
			monsters: new Image(),
			descriptors: {
				terrain: null,
				monsters: null
			},

			/**
			Mappings texture data from a server with code objects 
			of theese textures
			@method download
			@param url {String} Path to file on server
			@param texture {Object} Object for write in data from url
			@return Promise {Object} Deferred download object
			*/		
			download: function(url, texture) {
				var d = $.Deferred();
				texture.src = url;
				texture.onload = function() { d.resolve(); }
				texture.onerror = function() { d.reject(); }
				return d.promise();
			}
		},


		/**
		Cuts a piece of the world map array that is in the visibility zone on the screen
		@method getViewport
		@return cells {Array} The visible part of world map
		*/
		getViewport: function() {
			var viewCells = [];

			for (var x = app.graphics.x1; x < app.graphics.x2; x++){
				viewCells.push([]);
				for (var y = app.graphics.y1; y < app.graphics.y2; y++){
					viewCells[viewCells.length - 1].push(app.environment.map.data[x][y]);
				}
			}
			app.graphics.cells = viewCells;
			return viewCells
		},


		/**
		Covers the game field with surface textures
		@method fillMap
		@todo Need only a pattern for grass and road is needed?
		*/
		fillMap: function() {
			/* terrain drawing */
			var context = app.graphics.canvas.getContext('2d');
			
			app.graphics.canvas.width = document.body.clientWidth;
			app.graphics.canvas.height = document.body.clientHeight;
			// Cells representation
			var cells = app.graphics.getViewport();
			var cSize = app.graphics.cellSize;

			// Most popular patterns
			var grass = context.createPattern(app.graphics.textures.grass, 'repeat');
			var road  = context.createPattern(app.graphics.textures.road, 'repeat');

			for (var x = 0; x < cells.length; x++){
				for (var y = 0; y < cells[x].length; y++){
					var cellValue = cells[x][y];

					if (cellValue == 0) {
						// grass pattern
						context.fillStyle = grass;
						context.fillRect(x * cSize, y * cSize, cSize, cSize);

					}else if (cellValue == 1) {
						// road pattern
						context.fillStyle = road;
						context.fillRect(x * cSize, y * cSize, cSize, cSize);				

					}else{
						var texture = app.graphics.textures.terrain;
						context.drawImage(texture,			// Image
										  0,       			// sx
										  cellValue * cSize,// sy
										  cSize, 			// sWidth
										  cSize,			// sHeight
										  x * cSize,		// dx
										  y * cSize, 		// dy
										  cSize, 			// dWidth
										  cSize);			// dHeight
					}
				}
			}
		},


		/**
		Builds structure in cell with coords x, y
		@method fillCellWithTexture
		@param x {Integer} X-index of cell in world map array
		@param y {Integer} Y-index of cell in world map array
		@param textureId {Integer} Code of object which be written to world map
		*/
		fillCellWithTexture: function(x, y, textureId) {
			app.environment.map.data[y + app.graphics.x1][x + app.graphics.y1] = textureId;
			app.graphics.fillMap()
		},

		intialize: function() {
			app.graphics.fillMap();
			console.info('Okey intialize graphics');
		}
	},


	/**

	@module chat
	*/
	chat: {
		chatPanel: document.getElementById('messagefield'),
		$output: $('#messages'),
        $input: $('#message-input'),


        /**
		Sends text from the chat input line to the server
        @method sendMessage
        */
        sendMessage: function() {
				var message = app.chat.$input.val();
				app.chat.$input.val('');
				app.chat.message('P1', message);
				app.network.send.chat(message);
        },


        /**
        Enter button is controling chatPanel.
		Show if hidden, hide if showing and it hasn't any message. 
		Sending message if there is some text in form
		@method toggle
		*/
		toggle: function() {
			if (app.chat.chatPanel.style.display == 'block'){
			
				if (app.chat.$input.val() != ''){ app.chat.sendMessage() }
				else{ app.chat.chatPanel.style.display = 'none' }
			
			}else{ app.chat.chatPanel.style.display = 'block' }
		},


		/**
		Shows message in chat panel. Filter for avoiding XSS attacks
		@method message
		@param who {String} Name of person which sended message
		@param message {String} Text of the message
		*/
		message: function(who, message) {
			/* Defence from XSS */
			message = message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            who = who.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            app.chat.$output
                .append("<div module='message'><span module='username'>" + who + ": </span><span module='content'>" + message + "</span></div>")
		}
	},


	/**

	@module network
	*/
	network: {
		socket: null,

		/**
		Creates socket object.
		@method connectSocket
		*/
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

		/**
		Bind "chat" socket event for delegating message displaying
		on module:network:connectSocket
		*/
		bindEvents: function() {
			var socket = app.network.socket;

			socket.on('chat', function (data) {
				app.chat.message(data.name, data.message);
			});

			socket.on('newBuild', function(data) {
				app.building.placeStructure(data.x, 
					                        data.y, 
					                        data.code);
			})
		}
	},

	/**

	@module keyBinds
	*/
	keyBinds: {

		init: function() {
			$(document).keydown(app.keyBinds.keyboardHandler);
		},


		/**
		Catches keypress events and run appropriate functions
		@method keyboardHandler
		@param e {Event} Keypress event
		*/
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

			}else if (e.keyCode == 192 || e.keyCode == 0){
				// ` or ё key
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
