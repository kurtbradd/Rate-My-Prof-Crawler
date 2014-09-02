var module = angular.module('MyApp.controllers', []);

module.controller('DashboardCtrl', ['$scope', 'Review', function($scope, Review){
	
	console.log('cntl loaded');
	//in production use actual host name
	var socket = io.connect('http://localhost');
  
}])