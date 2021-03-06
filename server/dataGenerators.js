var _ = require("underscore");

var herosCounter = 0;
var monstersCounter = 0;

var dataGens = module.exports = {
   serverUpdInterval: 1, // seconds

   createMonster: function(){
      var coords = [_.random(5, 5), _.random(5, 5)];
      var HP = _.random(100, 350);
      var randomMob = _.random(0, 2);
      switch (randomMob) {

         case 0:
            var textureType = 0,
                unitCode = 2,
                damage = 50,
                Name = 'Zombie',
                avatar = 'zombie.png',
                description = 'smelly decayed zombie. It can infect you',
                speed = 32;
                untilCounter = 2;
                interval = 2;
            break;

         case 1:
             textureType = 1,
             unitCode = 1,
             damage = 100,
             Name = 'Snake',
             avatar = 'snake.png',
             description = 'slippery, creeping fucking creature. Poisonous',
             speed = 64;
             untilCounter = 1;
             interval = 1;
             break;

         case 2:
            textureType = 3,
            unitCode = 3,
            damage = 150,
            Name = 'Octopus',
            avatar = 'octopus.png',
            description = 'octopus. Its tentacles will crawl into all your holes',
            speed = 16,
            coords = [_.random(18, 30), _.random(23, 30)];
            untilCounter = 4;
             interval = 4;
            break;
      }
      var monster =  {x: coords[0],
                      y: coords[1],
                      abs_x: coords[0],
                      abs_y: coords[1],
                      id: dataGens.randomId('monster', Name.toLowerCase()),
                      creatureType: "monster",
                      textureType: textureType,
                      unitCode: unitCode,
                      owner: 'noone',
                      pursuers: [],
                      info: {
                         Name: Name,
                         avatar: avatar,
                         description: description
                      },
                      characts: {
                         HP: HP,
                         curHP: HP,
                         XP: Math.ceil(0.35 * HP),
                         Reward: HP - 50,
                         damage: damage
                      },
                      moving: {
                         direction: 1,
                         dirVariant: 0,
                         speed: speed, // px/s
                         need2Move: false,
                         need2MoveX: 0,
                         need2MoveY: 0,
                         serverUpd: {
                            untilCounter: untilCounter,
                            interval: interval
                         }
                      }
                  }
      return monster
   },


   createHero: function(x, y, heroOwner){
      var coords = [_.random(0, 20), _.random(0, 20)];
      if (typeof x == 'number' && typeof y == 'number') coords = [x, y];
      var HP = _.random(100, 350);
      var hero = {x: coords[0],
                  y: coords[1],
                  abs_x: coords[0],
                  abs_y: coords[1],
                  id: dataGens.randomId('hero', 'knight'),
                  creatureType: "unit",
                  textureType: 2,
                  unitCode: 7,
                  owner: heroOwner || 'someone',
                  pursuers: [],
                  info: {
                     Name: "Knight",
                     avatar: "Knight.png",
                     description: "the hero which comes to destroy evil creatures"
                  },
                  characts: {
                     HP: HP,
                     curHP: HP,
                     XP: Math.ceil(0.65 * HP),
                     Reward: HP + 50,
                     damage: 250
                  },
                  moving: {
                     direction: 4,
                     dirVariant: 0,
                     speed: 64, // px/s
                     need2Move: false,
                     need2MoveX: 0,
                     need2MoveY: 0,
                     serverUpd: {
                        untilCounter: 1,
                        interval: 1
                     }
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
   },

   randomId: function(creatureType, creatureName){
      var nums = '0123456789',
          alph = 'qwertyuiopasdfghjklzxcvbnm',
          id;

      var randLtr = function(){return _.random(0, alph.length-1)},
          randNum = function(){return _.random(0, nums.length-1)};

      switch (creatureType){
         case 'monster':
            id =  'm_'+ creatureName[0] + '_00' + monstersCounter;
            monstersCounter++;
            break;

         case 'hero':
            id =  'h_'+ creatureName[0] + '_00' + herosCounter;
            herosCounter++;
            break;
      }
      return id
   }
}