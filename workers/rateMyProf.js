var	redis 	= require("redis");
var rclient = redis.createClient();
var request = require('request');
var cheerio = require('cheerio');
var _ 			= require('lodash');
var Q 			= require('q');

rclient.on("connect", function () {
	console.log('Redis Connected');
});

exports.crawlReviews = crawlReviews = function crawlReviews (url) {
	var deferred = Q.defer();
	rclient.get(url, function(err, reply) {
		if (reply) {
			console.log('Redis Hit');
			return deferred.resolve(JSON.parse(reply));
		} 
		else {
			console.log('Redis Miss');
			getURL(url)
			.then(function (data) {
				var reviews = parseSiteForReviews(data);
				rclient.set(url, JSON.stringify(reviews));
				rclient.expire(url, 86400); //1day in sec. 
				deferred.resolve(reviews);
			})
			.fail(function (error) {
				deferred.reject(error);
			})
		}
	});
	return deferred.promise;
}

exports.crawlProfessorInfo = crawlProfessorInfo = function crawlProfessorInfo (url) {
	var deferred = Q.defer();
	getURL(url)
	.then(function (data) {
		deferred.resolve(parseSiteForProfInfo(data));
	})
	.fail(function (error) {
		deferred.reject(error);
	})
	return deferred.promise;
}

exports.createPaginationUrls = createPaginationUrls = function createPaginationUrls (url) {
	var deferred = Q.defer();
	getURL(url)
	.then(function (data) {
		var urls = [];
		var numReviews = parseSiteForNumReviews(data)
		var numPages = Math.ceil((numReviews/20));
		_(_.range(1, numPages+1)).forEach(function (num) {
			urls.push(url + "&pageNo=" + num)
		})
		deferred.resolve(urls);
	})
	.fail(function (error) {
		deferred.reject(error);
	})
	return deferred.promise;
}

function getURL(url) {
	var deferred = Q.defer();
	request(url, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			deferred.resolve(body);
		} else {
			deferred.reject(error);
		}
	});
	return deferred.promise;
}

function parseSiteForReviews (html) {
	var reviewsArray = [];
	var $ = cheerio.load(html);
	$('#ratingTable').find('.entry').filter(function (){
		var review_content = $(this);
		var review_date = review_content.find('.date').text();
		var review_course = review_content.find('.class').text().replace('\n', "");
		var review_quality = review_content.find('.rating').children().eq(0).text()
		var review_easiness = review_content.find('.rEasy').children().eq(1).text();
		var review_helpfulness = review_content.find('.rHelpful').children().eq(1).text();
		var review_clarity = review_content.find('.rClarity').children().eq(1).text();
		var review_interest = review_content.find('.rInterest').children().eq(1).text();
		var review_grade = review_content.find('.rGrade').children().eq(1).text();
		var review_description = review_content.find('.commentText').text();
		var review_sum = {
			'date' : review_date,
			'course' : review_course,
			'quality' : review_quality,
			'easiness' : review_easiness,
			'helpfulness' : review_helpfulness,
			'clarity' : review_clarity,
			'interest' : review_interest,
			'grade' : review_grade,
			'description' : review_description
		};
		reviewsArray.push(review_sum);
	});
	return reviewsArray;
}

function parseSiteForNumReviews (html) {
	var $ = cheerio.load(html);
	num = $('#rateNumber').children().eq(0).text();
	return parseFloat(num);
}

function parseSiteForProfInfo(html) {
	var $ = cheerio.load(html);
	var prof_content = $('#professor');
	var prof_name = prof_content.find('#profName').eq(1).text();
	var prof_school = prof_content.find('#profInfo').children().eq(0).eq(0).children().eq(0).children().eq(0).text();
	var prof_location = prof_content.find('#profInfo').children().eq(0).eq(0).children().eq(1).children().eq(0).text();
	var prof_department = prof_content.find('#profInfo').children().eq(0).eq(0).children().eq(2).children().eq(0).text();
	var prof_score = prof_content.find('#scoreCard')
	var prof_overall = prof_score.find('#quality').children().eq(0).children().eq(0).text();
	var prof_helpfulness = prof_score.find('#helpfulness').children().eq(0).children().eq(0).text();
	var prof_clarity = prof_score.find('#clarity').children().eq(0).children().eq(0).text();
	var prof_easiness = prof_score.find('#easiness').children().eq(0).children().eq(0).text();
	
	return {
		'name': prof_name,
		'school': prof_school,
		'location': prof_location,
		'department': prof_department,
		'overall': prof_overall,
		'helpfulness': prof_helpfulness,
		'clarity': prof_clarity,
		'easiness': prof_easiness
	}
}