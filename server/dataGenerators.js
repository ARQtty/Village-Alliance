var _ = require("underscore");

module.exports = {

	createMonster: function(){
		var coords = [_.random(0, 12), _.random(0, 16)];
		var HP = _.random(100, 350);
		var randomMob = _.random(0, 2);
		switch (randomMob) {

			case 0:
				var textureType = 0,
				    unitCode = 2,
				    Name = 'Zombie',
				    avatar = 'zombie.png',
				    description = 'smelly decayed zombie. It can infect you',
				    speed = 32;
				break;

			case 1:
			    textureType = 1,
			    unitCode = 1,
			    Name = 'Snake',
			    avatar = 'snake.png',
			    description = 'slippery, creeping fucking creature. Poisonous',
			    speed = 64;
			    break;

			case 2:
				textureType = 3,
				unitCode = 3,
				Name = 'Octopus',
				avatar = 'octopus.png',
				description = 'octopus. Its tentacles will crawl into all your holes',
				speed = 16,
				coords = [_.random(18, 30), _.random(23, 30)]
				break;
		}
		var unit = {x: coords[0],
		            y: coords[1],
		            abs_x: coords[0],
		            abs_y: coords[1],
		            id: _.random(10000, 50000),
		            textureType: textureType,
		            unitCode: unitCode,
		            info: {
		            	Name: Name,
		            	avatar: avatar,
		            	description: description
		            },
		            characts: {
		            	HP: HP,
		            	XP: Math.ceil(0.35 * HP),
		            	Reward: HP - 50
		            },
		            moving: {
		            	direction: 1,
		            	dirVariant: 0,
		            	speed: speed, // px/s
		            	need2Move: false,
		            	need2MoveX: 0,
		            	need2MoveY: 0
		            }
		        }
		return unit
	},


	createHero: function(){
		var coords = [_.random(5, 16), _.random(10, 19)];
		var HP = _.random(100, 350);
		var hero = {x: coords[0],
		            y: coords[1],
		            abs_x: coords[0],
		            abs_y: coords[1],
		            id: _.random(60000, 90000),
		            textureType: 2,
		            unitCode: 7,
		            owner: "ARQ",
		            info: {
		            	Name: "Knight",
		            	avatar: "Knight.png",
		            	description: "the hero which comes to destroy evil creatures"
		            },
		            characts: {
		            	HP: HP,
		            	XP: Math.ceil(0.65 * HP),
		            	Reward: HP + 50
		            },
		            moving: {
		            	direction: 4,
		            	dirVariant: 0,
		            	speed: 64, // px/s
		            	need2Move: false,
		            	need2MoveX: 0,
		            	need2MoveY: 0
		            }
		        }
		return hero
	},


	randomRed: function(){
		var firstLetter = 'abcdef',
		    secondSymb = '6789abcdef',
		    third = '123456789',
		    forth = '123456789bcd',
		    fifth = '123456789',
		    six   = '123456789abcd',
		    color = '#';
		color += firstLetter[_.random(0, firstLetter.length-1)] +
		          secondSymb[_.random(0, secondSymb.length-1)] +
		               third[_.random(0, third.length-1)] +
		               forth[_.random(0, forth.length-1)] +
		               fifth[_.random(0, fifth.length-1)] +
		                 six[_.random(0, six.length-1)];
		return color;
	}
}