/* 
 * STEP 2: BUILD A SIMPLE ANGULAR/BOOTSTRAP APP
 */

// recording-controller.js

var app = angular.module('myApp', []);

app.controller("RecordingController", RecordingController);

function RecordingController($scope) {
	
	$scope.recordingStarted = false;
	
	$scope.toggleRecording = function() {
		if($scope.recordingStarted) {
			$scope.recordingStarted = false;
		} else {
			$scope.recordingStarted = true;
		} 
	} 
}