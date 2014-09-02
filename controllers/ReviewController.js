var	mongoose = require('mongoose');
var	Review = mongoose.model('Review');
var jobQueue = require('../workers/jobQueue.js')

console.log('Review Controller Loaded');

module.exports = {
	postReview: function (socketio) {
		return function (req, res) {

			if (!req.body || !(req.body.name && req.body.url)) {
				return res.send(400, "Missing Parameters");
			}


			var review = new Review;
			review.name = req.body.name;
			review.url = req.body.url;

			review.save(function (err, saved_review) {
				if (err) {
					console.log(err);
					return res.send(400, err);
				}

				console.log('review data saved');
				
				var job = {
					id: saved_review._id,
					name: saved_review.name,
					url: saved_review.url
				};

				jobQueue.crawlProfessor(job, function (error, completed, progress) {
					if (error) {
						console.log('ReviewController: Crawl Fail');
						// send error to client
						// update saved_review attribute to failed
					}

					if (completed) {
						console.log('ReviewController: Crawl Completed');
						// send complete msg to client via socket
					}

					if (progress) {
						console.log('ReviewController: Crawl Progress: ' + progress);
						// send progress to client via socket
					}
				});

			})

			return res.send(200, "Success");
		}
	},

	getReviews: function (req, res) {
		return res.send(200, "Success");
	}
}