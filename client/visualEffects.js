/**
Visual effects for drawing in canvas placed here
@module visualEffects
*/

var e = Math.exp, 
    cos = Math.cos, 
    pow = Math.pow;

$(function() {
window.app.visualEffects = {

   hurt: function(ctx, x, y, duration, texture){
      let xBiasKoef = 0.7;
      let yBiasKoef = 0.4;
      let bias = cos(duration/2) * e(0.08*duration);

      ctx.drawImage(texture, 
                    x + bias*xBiasKoef, 
                    y + bias*yBiasKoef, 
                    32, 32);
      //ctx.stroke()
   },

   damage: function(ctx, x, y, duration, text){
         ctx.font = "24px fantasy";
         ctx.strokeStyle = "black";
         ctx.fillStyle = "red";
         y += 16; // align center
         duration = 34 - duration; // Inverse duration value
         var logBias = 7*Math.log(duration);

         ctx.strokeText(text, x + logBias,y - duration);
         ctx.fillText(text, x + logBias,  y - duration);
      }
}})