window.onload = function() {

	var s_avatar = document.getElementById('s_avatar');
	var s_name = document.getElementById('s_name');
	var s_description = document.getElementById('s_description');
	var s_HP = document.getElementById('s_HP');
	var s_XP = document.getElementById('s_XP');
	var s_Gold = document.getElementById('s_Gold');
	var selectPanel = document.getElementById('selectPanel');

	function displayTextureInfo(event) {
		var cellValue = app.environment.getCellByPosition(event.layerX, event.layerY);
		//console.log(app.graphics.textures.descriptors.terrain[cellValue])
		var informative = (cellValue == 0) ? false : true;
		if (cellValue < 4){
			var description = app.graphics.textures.descriptors.terrain[cellValue];
		}else{
			var description = app.graphics.textures.descriptors.monsters[cellValue - 4];
		}
		// TODO -> Make a crop from sprites
		//      -> don't show null descriptions
		if (informative) {
			selectPanel.style.display = 'block';
			s_avatar.innerHTML = '<img src="/media/textures/'+description['avatar']+'.png" style="width: 5vw;"/>';
			s_name.innerHTML = '<b>Name</b>: '+description['name'];
			s_description.innerHTML = '<b>It is</b> '+description['decription'];
			s_HP.innerHTML = '<b>HP</b>: '+description['HP'];
			s_XP.innerHTML = '<b>XP</b>: '+description['XP'];
			s_Gold.innerHTML = '<b>Gold for destroy</b>: '+description['Reward']
		}else{
			selectPanel.style.display = 'none'
		}
	}

	function sendUnitMove(d) {
		// Experimental elements for send unit's moves
		
	}

	document.getElementById('game').addEventListener('mousedown', displayTextureInfo, false);
}