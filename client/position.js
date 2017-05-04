$(function() {
window.app.drawing = {

	getCellByPosition: function(top, left) {
		var topIndex = Math.floor(top / window.app.graphics.cellSize)
		var leftIndex = Math.floor(left / window.app.graphics.cellSize)
		
		var leftIndexStr = '['+leftIndex.toString()+']';
		var topIndexStr = '['+topIndex.toString()+']';
		console.log('cells'+topIndexStr+leftIndexStr+' value='+window.app.graphics.cells[topIndex][leftIndex])

		return window.app.graphics.cells[topIndex][leftIndex]
	}

}})