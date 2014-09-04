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
						socketio.sockets.in(req.session.id).emit('crawlFailed', error);

						saved_review.failed = true;
	  				saved_review.save();
					}

					if (completed) {
						console.log('ReviewController: Crawl Completed');
						socketio.sockets.in(req.session.id).emit('crawlComplete', {});
					}

					if (progress) {
						console.log('ReviewController: Crawl Progress: ' + progress);
						socketio.sockets.in(req.session.id).emit('crawlProgress', progress);
					}

				});

			})

			return res.send(200, "Success");
		}
	},

	getReviews: function (req, res) {
		fieldsToReturn = 'name created_at csv_file_path failed'; 
		Review.find({}, fieldsToReturn, function(err, reviews) {
			if (err) {
				return res.send(400);
			}
			res.send(reviews);
		});
	}
}