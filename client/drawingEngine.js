$(function() {
window.app.building = {

	cancelButton: document.getElementById('cancel'),
	buildingStructure: null,
	buildingKey: null,

	prepare2Build: function() {
		// Build structure will be placed on the ground
		window.app.graphics.canvas.addEventListener('mouseup', window.app.building.build, false);
		
		// Build process will be aborted
		window.app.building.cancelButton.addEventListener('mousedown', window.app.building.abortBuild, false);

		//TODO -> window.app.graphics.canvas.setAttribute("style", "cursor: url(media/textures/house.png);");
	},


	abortBuild: function() {
		// Unset eventListeners, cursor texture, update buildPanel
		
		window.app.building.cancelButton.removeEventListener('mousedown', this);
		window.app.graphics.canvas.removeEventListener('mouseup', window.app.building.build);
	},


	chooseStruct: function(model) {
		// Choose from available structures
		window.app.building.prepare2Build();
		switch (model) {
			case 'house':
				window.app.building.buildingKey = 3;
				break;

			case 'road':
				window.app.building.buildingKey = 2;
				break;
		}
	},


	build: function(event){
		// Unset after click
		window.app.graphics.canvas.removeEventListener('mouseup', window.app.building.build);
		
		var cellValue = window.app.environment.getCellByPosition(event.layerX, event.layerY);
		var cellUnderCursor = window.app.environment.getCellCoords(event.layerX, event.layerY);
		var cellX = cellUnderCursor[0];
		var cellY = cellUnderCursor[1];
		
		console.log('Хочу строить на '+cellX+', '+cellY);
		if (window.app.building.buildingKey == cellValue) {
			console.warn('Такое здание уже стоит на этом месте');
		}else{
			console.log('Строю тут');
			// Placing object on the map
			window.app.graphics.fillCellWithTexture(cellY, cellX, window.app.building.buildingKey);
		}
	}

}})