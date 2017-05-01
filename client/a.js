'use strict'
window.onload = function() {

function getCellByPosition(top, left) {
	var topIndex = Math.floor(top / cellHeight)
	var leftIndex = Math.floor(left / cellSize)
	
	var leftIndexStr = '['+leftIndex.toString()+']';
	var topIndexStr = '['+topIndex.toString()+']';
	console.log('cells'+leftIndexStr+topIndexStr+' value='+cells[leftIndex][topIndex])

	return cells[leftIndex][topIndex]
}

function getCellCoords(x, y){
	var xIndex = Math.floor(x / cellSize)
	var yIndex = Math.floor(y / cellSize)
	return [xIndex, yIndex]	
}

// Взаимодействие
var filling = false

function fillCellAtPositionIfNeeded(x, y) {
	// Срабатывает при передвижении нажатого курсора
	var cellUnderCursor = getCellByPosition(x, y)
	
	if (cellUnderCursor != 3) {
		var cellCoord = getCellCoords(x, y)
		var cellX = cellCoord[0]
		var cellY = cellCoord[1]
		
		console.log('Поставил дом на ', cellCoord)
		
		cells[cellY][cellX] = 3
		fillMap(cells)
		var pattern = context.createPattern(house, 'repeat');
		context.fillStyle = pattern;
		context.fillRect(cellX * cellHeight, cellY * cellWidth, cellHeight, cellWidth);
	}

}
function handleMouseDown(event) {
	// нужно вычислить координаты клика относительно верхнего левого края canvas
	// это делается с использованием вычисления координат канваса и кроссбраузерных свойств объекта event
	// я использую некроссбраузерные свойства объекта событий
	filling = !getCellByPosition(event.layerX, event.layerY).solid
	fillCellAtPositionIfNeeded(event.layerX, event.layerY)

	canvas.addEventListener('mousemove', handleMouseMove, false)
}

function handleMouseUp() {
	canvas.removeEventListener('mousemove', handleMouseMove)
}

function handleMouseMove(event) {
	fillCellAtPositionIfNeeded(event.layerX, event.layerY, filling)
}

canvas.addEventListener('mousedown', handleMouseDown, false);
canvas.addEventListener('mouseup', handleMouseUp, false)
}
}
