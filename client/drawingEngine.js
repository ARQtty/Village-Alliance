$(function() {
window.app.building = {
	/* Part for building structures on game field */
	cancelButton: document.getElementById('cancel'),
	buildingStructure: null,
	buildingKey: null,
	buildingModel: null,

	prepare2Build: function() {
		// Build structure will be placed on the ground
		app.graphics.canvas.addEventListener('mouseup', app.building.build, false);
		
		// Build process will be aborted
		app.building.cancelButton.addEventListener('mousedown', app.building.abortBuild, false);

		//TODO -> window.app.graphics.canvas.setAttribute("style", "cursor: url(media/textures/house.png);");
	},


	abortBuild: function() {
		// Unset eventListeners, cursor texture, update buildPanel
		
		app.building.cancelButton.removeEventListener('mousedown', this);
		app.graphics.canvas.removeEventListener('mouseup', app.building.build);
		document.getElementById(app.building.buildingModel+'Button').classList.remove("buildButtonChecked");
	},


	chooseStruct: function(model) {
		// Choose from available structures

		app.building.buildingModel = model;
		app.building.prepare2Build();
		// Allot button with color
		document.getElementById(model+'Button').classList.add("buildButtonChecked");

		switch (model) {
			case 'house':
				app.building.buildingKey = 3;
				break;

			case 'road':
				app.building.buildingKey = 1;
				break;

			case 'water':
				app.building.buildingKey = 2;
				break;
		}
	},


	build: function(event){
		// Unset after click
		app.graphics.canvas.removeEventListener('mouseup', app.building.build);
		document.getElementById(app.building.buildingModel+'Button').classList.remove("buildButtonChecked");
		
		var cellValue = app.environment.getCellByPosition(event.layerX, event.layerY);
		var cellUnderCursor = app.environment.getCellCoords(event.layerX, event.layerY);
		var cellX = cellUnderCursor[0];
		var cellY = cellUnderCursor[1];
		
		console.log('Хочу строить на '+cellX+', '+cellY);
		if (app.building.buildingKey == cellValue) {
			console.warn('Такое здание уже стоит на этом месте');
		}else{
			// Placing object on the map
			app.graphics.fillCellWithTexture(cellY, cellX, app.building.buildingKey);
		}
	}

}})