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
		var description = app.graphics.textures.descriptors.terrain[cellValue];

		switch(cellValue){

			case 1:
				var avatar = app.graphics.textures.road;
				break;

			case 3:
				var avatar = app.graphics.textures.house;
				break;
		}

		if (informative) {
			selectPanel.style.display = 'block';
			s_avatar.innerHTML = '<img src="'+avatar.src+'" style="width: 9vw"/>';
			s_name.innerHTML = '<b>Name</b>: '+description['name'];
			s_description.innerHTML = '<b>It is</b> '+description['decription'];
			s_HP.innerHTML = '<b>HP</b>: '+description['HP'];
			s_XP.innerHTML = '<b>XP</b>: '+description['XP'];
			s_Gold.innerHTML = '<b>Gold for destroy</b>: '+description['Reward']
		}else{
			selectPanel.style.display = 'none'
		}
	}

	document.getElementById('game').addEventListener('mousedown', displayTextureInfo, false);
}