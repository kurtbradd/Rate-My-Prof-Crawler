var module = angular.module('MyApp.controllers', []);

module.controller('DashboardCtrl', ['$scope', 'Review', function($scope, Review){
	
	console.log('Controller Loaded');

	//in production use actual host name
	var socket = io.connect('http://localhost');

	$scope.reviews = [];
	$scope.crawlProgress = 0;

	socket.on('connect', function () {
		console.log('socket io connected');
	})

	socket.on('crawlComplete', function () {
		console.log('Crawl Complete');
		$scope.getReviews();
		$scope.crawlProgress = 0;
		$scope.$apply();
		window.alert('Completed');
	})

	socket.on('crawlFailed', function (error) {
		console.log('Crawl Failed with Error: ' + error);
		$scope.getReviews();
		$scope.crawlProgress = 0;
		$scope.$apply();
		window.alert(error || 'Something went wrong! :(');
	})

	socket.on('crawlProgress', function (progress) {
		$scope.crawlProgress = progress;
		$scope.$apply();
		console.log(progress);
	}) 

	$scope.formData = {
		// name: null,
		// url: null,
		name: "Richard B Day",
		url: "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=10844",
	}
	
	$scope.submit = function () {
		Review.submit($scope.formData)
		.success(function(data) {
			clearForm();
		})
		.error(function(error) {
			window.alert("Please make sure form filled correctly.");
		})
	}

	$scope.getReviews = function () {
		Review.getReviews()
		.success(function(data) {
			$scope.reviews = data.reverse();
		})
		.error(function(error) {
			window.alert('Looks like something went wrong, lets try that again');
		})
	}

	$scope.percentComplete = function () {
		return "width: " + $scope.crawlProgress + "%;";
	};

	$scope.dateToString = function (date) {
		date = new Date(date);
		return date.toDateString() + " @ " +date.toLocaleTimeString()
	}

	function clearForm () {
		$scope.formData.name = null;
		$scope.formData.url = null;
	}

	$scope.getReviews();

}])