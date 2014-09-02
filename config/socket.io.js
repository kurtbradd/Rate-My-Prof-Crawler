var socketio = require('socket.io');

module.exports = function (server) {
		
	console.log('Socket.io Loaded');

	var io = socketio.listen(server);
	// io.set('log level', 1);

	//Socket on connect
	io.sockets.on('connection', function (socket) {
	  console.log('A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
	  socket.join(socket.handshake.sessionID);
	  socket.on('disconnect', function (){
	  	console.log('client disconnected');
	  })
	});

	return io;
}