function toggleSelectPanel() {
	var selectPanel = document.getElementById('selectPanel');
	selectPanel.style.display = (selectPanel.style.display == 'block') ? 'none' : 'block';
}


window.onload = function() {

	function getCellByPosition(top, left) {
		var topIndex = Math.floor(top / window.app.graphics.cellSize)
		var leftIndex = Math.floor(left / window.app.graphics.cellSize)
		
		var leftIndexStr = '['+leftIndex.toString()+']';
		var topIndexStr = '['+topIndex.toString()+']';
		console.log('cells'+topIndexStr+leftIndexStr+' value='+window.app.graphics.cells[topIndex][leftIndex])

		return window.app.graphics.cells[topIndex][leftIndex]
	}

	function getCellCoords(x, y){
		var xIndex = Math.floor(x / cellSize)
		var yIndex = Math.floor(y / cellSize)
		return [xIndex, yIndex]
	}

	function fillCellWithTexture(x, y) {
		var cellUnderCursor = getCellByPosition(x, y)	
	
		var cellCoord = getCellCoords(x, y)
		var cellX = cellCoord[0]
		var cellY = cellCoord[1]
		
		console.log('Поставил дом на ', cellCoord)
		
		cells[cellY][cellX] = newBuilding;
		fillMap(cells)
		var pattern = context.createPattern(house, 'repeat');
		context.fillStyle = pattern;
		context.fillRect(cellX * cellHeight, cellY * cellWidth, cellHeight, cellWidth);
	}


	function handleMouseDown(event) {
		filling = getCellByPosition(event.layerX, event.layerY);
	}

	window.app.graphics.canvas.addEventListener('mousedown', handleMouseDown, false);
}