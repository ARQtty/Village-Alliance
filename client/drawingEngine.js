/**
The logic of construction of objects on the game space	
@module building
*/

$(function() {
window.app.building = {
	/* Part for building structures on game field */
	buildings: [],
	cancelButton: document.getElementById('cancel'),
	buildingStructure: null,
	buildingKey: null,
	buildingModel: null,


	init: function(){
		var map = app.environment.map.data;
		for (var i=0; i<map.length; i++){
			for (var j=0; j<map[0].length; j++){
				if (map[i][j] == 3){    // home
					app.building.buildings.push({x: i, y: j})
				}
			}
		}
	},


	buildingWithCoords: function(x, y){
		var buildings = app.building.buildings;
		for (var i=0; i<buildings.length; i++){
			if (buildings[i].x == x && buildings[i].y == y){
				return true
			}
		}
		return false
	},


	/**
	Starts listening to canvas for a click to build structure. 
	Structure will be placed on the ground or bulding wiil be aborted
	by pressing the cancel button.
	@method prepare2Build
	@todo Set the cursor image as a selected texture
	*/
	prepare2Build: function() {
		app.graphics.canvas.addEventListener('mouseup', app.building.verifyBuild, false);
		// Build process will be aborted
		app.building.cancelButton.addEventListener('mousedown', app.building.abortBuild, false);
	},


	/**
	Unset eventListeners, cursor texture, update buildPanel
	@method abortBuild
	*/
	abortBuild: function() {
		app.building.cancelButton.removeEventListener('mousedown', this);
		app.graphics.canvas.removeEventListener('mouseup', app.building.verifyBuild);
		document.getElementById(app.building.buildingModel+'Button').classList.remove("buildButtonChecked");
	},



	/**
	Connects the UI and module. Specifies the building ID for the building. 
	Change the color of the choosen model build-button
	@method chooseStruct
	@param model {String} Choosen from UI build buttons
	*/
	chooseStruct: function(model) {
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


	/**
	Gets the coordinates of the place of the line, calls the procedure 
	for rendering the constructed building, if this can be constructed.
	@method build
	@param event {Event} A mouse event
	*/
	verifyBuild: function(event){
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
			app.network.socket.emit('verifyBuild', {x: cellX, 
	                                                y: cellY, 
	                                                structureID: app.building.buildingKey});
		}
	},


	placeStructure(x, y, structureCode){
		// Placing object on the map
		console.log('Someone calls me!');
		app.building.buildings.push({x: x, y: y});
		app.graphics.fillCellWithTexture(y, x, structureCode);
		console.log(app.building.buildings)
	}

}})