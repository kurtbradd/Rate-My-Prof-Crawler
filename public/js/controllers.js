var module = angular.module('MyApp.controllers', []);

module.controller('DashboardCtrl', ['$scope', 'Review', function($scope, Review){
	
	console.log('cntl loaded');
	
	//in production use actual host name
	var socket = io.connect('http://localhost');

	socket.on('connect', function () {
		console.log('socket io connected');
	}) 

	$scope.formData = {
		name: "",
		url: "",
	}
	
	$scope.submit = function () {
		Review.submit($scope.formData)
		.success(function(data) {
			clearForm();
		})
		.error(function(error) {

		})
	}

	function getReviews () {
		Review.getReviews()
		.success(function(data) {

		})
		.error(function(error) {
			
		})
	}

	function clearForm () {
		$scope.formData.name = "";
		$scope.formData.url = "";
	}

}])