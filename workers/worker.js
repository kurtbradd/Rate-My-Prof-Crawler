var cluster = require('cluster')
var clusterWorkerSize = require('os').cpus().length;

if (cluster.isMaster) {
	for (var i = 0; i < clusterWorkerSize; i++) {
		cluster.fork();
	}
}
else {
	console.log("Cluster: " + cluster.worker.id + " - ready.");
	var mongoose 		= require('mongoose');
	mongoose.connect('mongodb://localhost:27017/RateMyProf');
	var Review 			= require('../models/Review.js');
	var rateMyProf 	= require('./rateMyProf.js');
	var kue 				= require("kue-send");
	var json2csv 		= require('json2csv');
	var _ 					= require('lodash');
	var	jobs 				= kue.createQueue();
	var	jobsTwo 		= kue.createQueue();
	var fs 					= require('fs');
	var Q 					= require('q');

	jobs.process('crawlProfessor', 1, function (job, done){

		var infoPromise = rateMyProf.crawlProfessorInfo(job.data.url);
		var urlsPromise = rateMyProf.createPaginationUrls(job.data.url);

		// after prof info and urls recieved
		Q.all([infoPromise, urlsPromise])
		.then(function (data) {

			var profInfo = data[0];
			var urls = data[1];
			
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
					deferredJob.resolve(reviewsArray);
				})
				crawl_job.on('failed', function () {
					deferredJob.reject();
				})
				crawl_job.save();
			})

			Q.all(jobPromises)
			.then(function(data) {
				
				// Flatten all the review arrays
				var reviews = flattenNestedArray(data);

				parseReviewsToCSV(job.data.id, reviews)
				.then(function (fileName) {
					saveReview(fileName, job.data.id)
					.then(function (review) {
						done()
					})
					//saving filepath failed
					.fail(function (error) {
						done(error)
					})

				})
				// csv creation failed
				.fail(function (error) {
					done(error);
				})

			})
			// a job promise failed
			.fail(function (error) {
				done(error);
			})

		})
		// cannot get profInfo or URLS
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

	function parseReviewsToCSV(reviewID, data) {
		var deferred = Q.defer();
		csvConfig = {
			data: data, 
			
			fields: ['date', 'course', 'quality', 'easiness', 'helpfulness',
			'clarity', 'interest', 'grade', 'description'],

			fieldNames: ['date', 'course', 'quality', 'easiness', 'helpfulness',
			'clarity', 'interest', 'grade', 'description']
		}

		json2csv(csvConfig, function (error, csv) {
		  if (error) {
		  	deferred.reject(error);
		  } else {
		  	var fileName = reviewID + '_review.csv';
		  	var filePath = '../public/reviews/'+ fileName;
		  	fs.writeFile(filePath, csv, function (error) {
		    	if (error){
		    		return deferred.reject(error);
		    	}
		    	deferred.resolve(fileName);
		  	});
			}
		});	
		return deferred.promise;
	}

	function saveReview(savedFilePath, reviewID) {
		var deferred = Q.defer();
		Review.findById(reviewID, function (error, review){
			if (error) {
				return deferred.reject(error);
			}
			review.csv_file_path = savedFilePath;
			review.save(function (error, review){
				if (error){
					deferred.reject(error);
				}
				deferred.resolve(review);
			})
		});
		return deferred.promise;
	}

	function flattenNestedArray(array) {
		return _.reduce(array, function(a, b) {
			return a.concat(b);
		});
	}
}

process.once( 'SIGINT', function (sig) {
	jobs.shutdown(function(err) {
		console.log( 'Kue is shut down.', err||'' );
		process.exit( 0 );
	}, 5000 );
});