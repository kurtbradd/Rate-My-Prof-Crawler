var socketio = require('socket.io');
var parseCookie = require('express/node_modules/cookie').parse;
var parseSignedCookies = require('express/node_modules/connect/lib/utils').parseSignedCookies;

module.exports = function (server, sessionStore) {
		
	console.log('Socket.io Loaded');

	var io = socketio.listen(server);
	io.set('log level', 1);

	//Socket on connect
	io.sockets.on('connection', function (socket) {
		console.log('A socket with sessionID ' + socket.handshake.sessionID + ' connected!');
		socket.join(socket.handshake.sessionID);
		socket.on('disconnect', function (){
			console.log('client disconnected');
		})
	});


	io.set('authorization', function (data, accept) {
		// check if there's a cookie header
		if (data.headers.cookie) {
			signedCookies = parseCookie(data.headers.cookie);
			data.cookie = parseSignedCookies(signedCookies, 'secret');
			data.sessionID = data.cookie['express.sid'];
			sessionStore.get(data.sessionID, function (err, session) {
				if (err || !session) {
					return accept('Error', false);
				} 
				else {
					data.session = session;
					return accept(null, true);
				}
			});
		} 
		else {
			return accept('No cookie transmitted.', false);
		}
	});

	return io;
}