$(function() {
window.app.sprites = {

	listenActions: function() {
		socket = app.network.socket;
		socket.on('newUnit', function(data){
			console.log('newUnit message');
		});
		socket.on('moveUnit', function(data){
			console.log('moveUnit message');
		});
		socket.on('hitUnit', function(data){
			console.log('hitUnit message');
		});
		socket.on('hurtUnit', function(data){
			console.log('hurtUnit message');
		});
		console.info('Okey init listenActions');
	},

	monsters: {

	},

	heroes: {
		
	}

}})