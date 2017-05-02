$(function() {
window.app = {

	downloadWorld: function () {
		$.when(
			app.graphics.textures.download(
				'/media/textures/house.png',
				app.graphics.textures.house
			),
			app.graphics.textures.download(
				'/media/textures/grass.png',
				app.graphics.textures.grass
			),
			app.graphics.textures.download(
				'/media/textures/road.png',
				app.graphics.textures.road
			),
			//app.environment.downloadData(),
			app.environment.downloadMap()
		).done(function() {
			console.log('Okey downloadWorld');
			app.intialize();
		});
	},

	intialize: function() {
		app.graphics.intialize();
	},

	environment: {

		map: {
			data: []
		},

		downloadData: function() {
            return $.get('/assets/data.json').pipe(function(data) {
	            app.graphics.tilesets.descriptors = data;
	            return true;
            });
        },

        downloadMap: function() {
        	return $.get('/media/map.json').pipe(function(data) {
        		app.environment.map.sizeX = data.length;
        		app.environment.map.sizeY = data[0].length;
           		console.log('Map sizes: x='+data.length+' y='+data[0].length);
	            app.environment.map.data = data;
	            return true;
      		})
		}
	},

	graphics: {
		cellSize: 32,
		x1: 0,
		y1: 0,
		x2: Math.ceil(document.body.clientWidth  / 32),
		y2: Math.ceil(document.body.clientHeight / 32),
		
		cellsInRow: Math.ceil(document.body.clientWidth  / 32),
		cellsInColumn: Math.ceil(document.body.clientHeight / 32),

		canvas: document.getElementById('game'),

		textures: {
			grass: new Image(),
			house: new Image(),
			road: new Image(),
			descriptors: {
				grass: null,
				house: null,
				road: null
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
			console.log(' x1='+window.app.graphics.x1
					   +' y1='+window.app.graphics.y1);
			console.log(' x2='+window.app.graphics.x2
					   +' y2='+window.app.graphics.y2);
			window.app.graphics.cells = viewCells;
			return viewCells
		},

		fillMap: function() {
			var context = window.app.graphics.canvas.getContext('2d');
			
			window.app.graphics.canvas.width = document.body.clientWidth;
			window.app.graphics.canvas.height = document.body.clientHeight;
			// Представление всех ячеек
			var cells = app.graphics.getViewport();

			for (var x = 0; x < cells.length; x++){
				for (var y = 0; y < cells[x].length; y++){
					switch (cells[x][y]){

						case 1:
							var pattern = context.createPattern(app.graphics.textures.road, 'repeat');
							break;

						case 3:
							var pattern = context.createPattern(app.graphics.textures.house, 'repeat');
							break;

						case 0:
							var pattern = context.createPattern(app.graphics.textures.grass, 'repeat');
							break;

						case 2:
							context.fillStyle = '#f31414'; 
							break;
					}

					context.fillStyle = pattern;
					context.fillRect(x * app.graphics.cellSize, y * app.graphics.cellSize, app.graphics.cellSize, app.graphics.cellSize);
				}
			}
		},

		intialize: function() {
			app.graphics.fillMap();
			console.log('Okey intialize graphics');
		}
	},

	network: {
	}
};
app.downloadWorld();
});
