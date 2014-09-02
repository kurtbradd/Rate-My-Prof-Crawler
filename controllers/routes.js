// require controllers here

module.exports = function (app, socketio) {

	// Catchall Route
	app.get('*', function (req, res) {
		res.sendfile('./public/views/index.html');
	});
}