var cluster = require('cluster')
var clusterWorkerSize = require('os').cpus().length;

if (cluster.isMaster) {
	for (var i = 0; i < clusterWorkerSize; i++) {
		cluster.fork();
	}
}
else {
	console.log("Cluster: " + cluster.worker.id + " - ready.");
	var kue 				= require("kue-send");
	var	jobs 				= kue.createQueue();
	var	jobsTwo 		= kue.createQueue();
	var rateMyProf 	= require('./rateMyProf.js');
	var Q 					= require('q');

	jobs.process('crawlProfessor', 1, function (job, done){

		var infoPromise = rateMyProf.crawlProfessorInfo(job.data.url);
		var urlsPromise = rateMyProf.createPaginationUrls(job.data.url);

		// after prof info and urls recieved
		Q.all([infoPromise, urlsPromise])
		.then(function (data) {

			var profInfo = data[0];
			var urls = data[1];
			
			var reviews = []
			var jobPromises = [];
			var count = 0;

			//create promises for each url to return
			urls.forEach(function(url) {
				var deferredJob = Q.defer();
				var crawl_job = jobs.create('crawlProfessorReviews', {'url': url});
				crawl_job.attempts(15);
				jobPromises.push(deferredJob.promise);
				crawl_job.on('result', function (reviewsArray) {
					job.progress(++count,jobPromises.length);
					reviews = reviews.concat(reviewsArray);
					deferredJob.resolve();
				})
				crawl_job.on('failed attempt', function () {
					console.log('Failed Crawl Job Attempt')
				})
				crawl_job.on('failed', function () {
					deferredJob.reject();
				})
				crawl_job.save();
			})

			console.log('here');
			Q.all(jobPromises)
			.then(function(data) {
				// save to csv
				done()
			})
			.fail(function (error) {
				done(error);
			})

		})
		.fail(function (error) {
			done(error)
		})
	});

	jobsTwo.process('crawlProfessorReviews', 4, function (job, done){
		rateMyProf.crawlReviews(job.data.url)
		.then(function (data) {
			job.send("result", data);
			done();
		})
		.fail(function (error) {
			done(error);
		})
	});

}

process.once( 'SIGINT', function (sig) {
	jobs.shutdown(function(err) {
		console.log( 'Kue is shut down.', err||'' );
		process.exit( 0 );
	}, 5000 );
});