$(function() {
window.app.resources = {
   gold: 0,

   init: function(){
      var goldSpan = document.getElementById('goldSpan');
      goldSpan.innerHTML = app.resources.gold;
   },

   setGold: function(newBalance){
      app.resources.gold = newBalance;
      app.resources.init();
   }

}});