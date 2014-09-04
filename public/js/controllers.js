var module = angular.module('MyApp.controllers', []);

module.controller('DashboardCtrl', ['$scope', 'Review', function($scope, Review){
	
	console.log('cntl loaded');
	getReviews();
	//in production use actual host name
	var socket = io.connect('http://localhost');

	socket.on('connect', function () {
		console.log('socket io connected');
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
			// clearForm();
			console.log(data);
		})
		.error(function(error) {

		})
	}

	function getReviews () {
		Review.getReviews()
		.success(function(data) {
			console.log(data);
		})
		.error(function(error) {
			
		})
	}

	function clearForm () {
		$scope.formData.name = null;
		$scope.formData.url = null;
	}

}])