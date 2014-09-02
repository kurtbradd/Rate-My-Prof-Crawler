var mongoose = require('mongoose'),
    Review = mongoose.model('Review');

console.log('Review Controller Loaded');

module.exports = {
	postReview: function (socketio) {
		return function (req, res) {

			if (!req.body || !(req.body.name && req.body.url)) {
				return res.send(400, "Missing Parameters");
			}
			/*
			save review from body data
			create job with review data and _id
			wait on job progess and completion handler
			return that info back on the socket
			*/
			return res.send(200, "Success");
		}
	},

	getReviews: function (req, res) {
		return res.send(200, "Success");
	}
}