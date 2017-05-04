$(function() {
window.app.drawing = {

	cancelButton: document.getElementById('cancel'),
	buildingStructure: null,
	buildingKey: null,


	prepare2Build: function(model) {
		// Build structure will be placed on the ground
		window.app.graphics.canvas.addEventListener('mouseup', build, false);
		
		// Build process will be aborted
		window.app.drawing.cancelButton.addEventListener('mousedown', abortBuild, false);

		document.style.cursor = model;
		window.app.drawing.buildingStructure = model;
	},


	abortBuild: function() {
		// Unset eventListeners, cursor texture, update buildPanel
		var a;
	},


	chooseStruct: function(model) {
		// Choose from available structures
		switch (model){
			case 'house':
				window.app.drawing.prepare2Build(window.app.graphics.textures.house);
				window.app.drawing.buildingKey = 3;
				break;

			case 'road':
				window.app.drawing.prepare2Build(window.app.graphics.textures.road);
				window.app.drawing.buildingKey = 2;
				break;
		}
	},


	build: function(event){
		// Unset after click
		window.app.graphics.canvas.removeEventListener('mouseup', build);
		document.style.cursor = 'pointer';
		
		var cellValue = window.app.position.getCellByPosition(event.layerX, event.layerY);
		var cellUnderCursor = window.app.position.getCellCoords(event.layerX, event.layerY);
		var cellX = cellUnderCursor[0],
		    cellY = cellUnderCursor[1];
		
		console.log('Хочу строить на '+cellX+', '+cellY);

		window.app.graphics.cells[cellY][cellX] = window.app.drawing.buildingKey;
		window.app.graphics.fillMap();
	}

}})