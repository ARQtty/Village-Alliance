window.onload = function() {

	var s_avatar = document.getElementById('s_avatar');
	var s_name = document.getElementById('s_name');
	var s_description = document.getElementById('s_description');
	var s_HP = document.getElementById('s_HP');
	var s_XP = document.getElementById('s_XP');
	var s_Gold = document.getElementById('s_Gold');
	var selectPanel = document.getElementById('selectPanel');

	function getTextureInfo(event) {
		var coords = app.environment.getCellCoords;
		var cellValue = app.environment.getCellByPosition(event.layerX, event.layerY);
		var informative = (cellValue == 0) ? false : true; // grass is not informative
		
		// if we click on the monster
		if ([coords[0], coords[1]] in app.sprites.coords) {
			var monster = app.sprites.coords[[coords[0], coords[1]]];
			description = monster.description;
		
		}else if (cellValue < 4) {
			if (informative) {
				showDescription(app.graphics.textures.descriptors.terrain[cellValue]);
			}else{
				selectPanel.style.display = 'none';
			}
		}
	}

	function showDescription(desc) {
		// TODO -> Make a crop from sprites
		//      -> don't show null descriptions
		selectPanel.style.display = 'block';
		s_avatar.innerHTML = '<img src="/media/textures/'+desc['avatar']+'.png" style="width: 5vw;"/>';
		s_name.innerHTML = '<b>Name</b>: '+desc['name'];
		s_description.innerHTML = '<b>It is</b> '+desc['decription'];
		s_HP.innerHTML = '<b>HP</b>: '+desc['HP'];
		s_XP.innerHTML = '<b>XP</b>: '+desc['XP'];
		s_Gold.innerHTML = '<b>Gold for destroy</b>: '+desc['Reward']
	}

	document.body.addEventListener('mousedown', getTextureInfo, false);
}