window.onload = function() {

	var s_avatar = document.getElementById('s_avatar');
	var s_name = document.getElementById('s_name');
	var s_description = document.getElementById('s_description');
	var s_HP = document.getElementById('s_HP');
	var s_XP = document.getElementById('s_XP');
	var s_Gold = document.getElementById('s_Gold');
	var selectPanel = document.getElementById('selectPanel');


	function getTextureDescription(event) {
		var cellValue = app.environment.getCellByPosition(event.layerX, event.layerY);
		var informative = (cellValue == 0) ? false : true; // grass is not informative
		
		if (!getSpriteDescription(event)){
			if (cellValue < 4) {
				if (informative) {
					showTextureDescr(app.graphics.textures.descriptors.terrain[cellValue]);
				}else{
					selectPanel.style.display = 'none';
				}
			}
		}
	};

	function getSpriteDescription(event) {
		var coords = app.environment.getCellCoords(event.layerX, event.layerY);
		// Get absolute values
		coords[0] += app.graphics.x1;
		coords[1] += app.graphics.y1;
		var sprites = app.sprites.coords;
		for (var i=0; i<sprites.length; i++){
			if (sprites[i].abs_x == coords[0] && sprites[i].abs_y== coords[1]){

				// Scheme for determining the player's unit's worth:
                // Cookies -> owner name -> Compare %sprites[i].owner% with %owner name%
				if (sprites[i].owner == "ARQ") app.unitsControl.selectUnit(sprites[i]);

				showSpriteDescr(sprites[i]);
				// Bool for getTextureDescription. If true, is wouldn't start
				return true
			}
		}
		return false
	};


	function showSpriteDescr(sprite) {
		selectPanel.style.display = 'block';
		s_avatar.innerHTML = '<img src="/media/textures/'+sprite['info']['avatar']+'" style="width: 5vw;"/>';
		s_name.innerHTML = '<b>Name</b>: '+sprite['info']['Name'];
		s_description.innerHTML = '<b>It is</b> '+sprite['info']['description'];
		s_HP.innerHTML = '<b>HP</b>: '+sprite['characts']['HP'];
		s_XP.innerHTML = '<b>XP</b>: '+sprite['characts']['XP'];
		s_Gold.innerHTML = '<b>Gold for destroy</b>: '+sprite['characts']['Reward']
	};



	function showTextureDescr(desc) {
		// TODO -> Make a crop from sprites
		//      -> don't show null descriptions
		selectPanel.style.display = 'block';
		s_avatar.innerHTML = '<img src="/media/textures/'+desc['avatar']+'.png" style="width: 5vw;"/>';
		s_name.innerHTML = '<b>Name</b>: '+desc['name'];
		s_description.innerHTML = '<b>It is</b> '+desc['decription'];
		s_HP.innerHTML = '<b>HP</b>: '+desc['HP'];
		s_XP.innerHTML = '<b>XP</b>: '+desc['XP'];
		s_Gold.innerHTML = '<b>Gold for destroy</b>: '+desc['Reward']
	};


	function which(event){
		// Change one of 3 buttons of mouse
		switch(event.which){
			case 1:
				getTextureDescription(event);break;
			case 3:
				app.unitsControl.pointClick(event);break;
			default:
				console.log('Middle mouse button pressed?');break
		}
	};


	document.body.addEventListener('mousedown', which, false);
}