var ReviewController = require('./ReviewController.js');

module.exports = function (app, socketio) {

	console.log('Routes Loaded');

	// ReviewController Routes
	app.get('/api/reviews', ReviewController.getReviews);
	app.post('/api/reviews', ReviewController.postReview);

	// Catchall Route
	app.get('*', function (req, res) {
		res.sendfile('./public/views/index.html');
	});
}