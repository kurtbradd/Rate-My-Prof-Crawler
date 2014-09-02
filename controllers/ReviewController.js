console.log('Review Controller Loaded');

module.exports = {
	postReview: function (req, res) {
		if (!req.body || !(req.body.name && req.body.url)) {
			return res.send(400, "Missing Parameters");
		}
		console.log(req.body);
		return res.send(200, "Success");
	},

	getReviews: function (req, res) {
		return res.send(200, "Success");
	}
}