
module.exports = {
   User: function(){
      this.gold = 0;
      this.getGold    = function(){ return this.gold };
      this.setGold    = function(addition){ this.gold += addition };
      this.enoughGold = function(needGold){ return (this.gold >= needGold)? true : false };

      this.name = null;
      this.setName = function(newName){ this.name = newName };

      this.sockID = null;
      this.setSockID = function(id){ this.sockID = id };

      this.units = [];
      this.newUnit = function(unit){ this.units.push(unit) };
      this.delUnit = function(id){};
   },

   findUserBySockID: function(usersProfiles, sockID){
      for (var i=0; i<usersProfiles.length; i++){
         if (usersProfiles[i].sockID == sockID){
            return usersProfiles[i]
         }
      }
      console.log("Cant find user with ID "+sockID);
      return null
   }
}