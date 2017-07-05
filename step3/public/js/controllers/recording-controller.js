var app = angular.module('myApp', []);

app.controller("RecordingController", RecordingController);

function RecordingController($scope,$http,$sce) {
	
	$scope.recordingStarted = false;
	
	$scope.toggleRecording = function() {
		if($scope.recordingStarted) {
			audioRecorder.stop();
			audioRecorder.getBuffers( gotBuffers );
			$scope.recordingStarted = false;
		} else {
			if (!audioRecorder)
				return;
			audioRecorder.clear();
			audioRecorder.record();
			$scope.recordingStarted = true;
			$scope.gifReceived = false;
		} 
	} 
	
	var audioContext = new AudioContext();
	var analyserContext = null;
	var recIndex = 0;
	
	function gotBuffers( buffers ) {
		audioRecorder.exportMonoWAV( doneEncoding );
	}
	
	$scope.mediaFile = '';
	$scope.gifReceived = false;
	function doneEncoding( blob ) {
		var audioFileUrl = Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
		recIndex++;
	}
	
	$scope.getUserMedia = function() {
		
		if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;
		
		navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, function(e) {
            alert('Error getting audio');
            console.log(e);
        });
		
		function gotStream(stream) {
			inputPoint = audioContext.createGain();

			// Create an AudioNode from the stream.
			realAudioInput = audioContext.createMediaStreamSource(stream);
			audioInput = realAudioInput;
			audioInput.connect(inputPoint);

			analyserNode = audioContext.createAnalyser();
			analyserNode.fftSize = 2048;
			inputPoint.connect( analyserNode );

			audioRecorder = new Recorder( inputPoint );

			zeroGain = audioContext.createGain();
			zeroGain.gain.value = 0.0;
			inputPoint.connect( zeroGain );
			zeroGain.connect( audioContext.destination );
			updateAnalysers();
		}
		
		function updateAnalysers(time) {
			if (!analyserContext) {
				var canvas = document.getElementById("analyser");
				canvasWidth = canvas.width;
				canvasHeight = canvas.height;
				analyserContext = canvas.getContext('2d');
			}

			// analyzer draw code here
			{
				var SPACING = 3;
				var BAR_WIDTH = 1;
				var numBars = Math.round(canvasWidth / SPACING);
				var freqByteData = new Uint8Array(analyserNode.frequencyBinCount);

				analyserNode.getByteFrequencyData(freqByteData); 

				analyserContext.clearRect(0, 0, canvasWidth, canvasHeight);
				analyserContext.fillStyle = '#F6D565';
				analyserContext.lineCap = 'round';
				var multiplier = analyserNode.frequencyBinCount / numBars;
				
				if($scope.recordingStarted) {

				// Draw rectangle for each frequency bin.
				for (var i = 0; i < numBars; ++i) {
					var magnitude = 0;
					var offset = Math.floor( i * multiplier );
					// gotta sum/average the block, or we miss narrow-bandwidth spikes
					for (var j = 0; j< multiplier; j++)
						magnitude += freqByteData[offset + j];
					magnitude = magnitude / multiplier;
					var magnitude2 = freqByteData[i * multiplier];
					analyserContext.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
					analyserContext.fillRect(i * SPACING, canvasHeight, BAR_WIDTH, -magnitude);
				}
				}
			}

			rafID = window.requestAnimationFrame( updateAnalysers );
		}
		
	}
	$scope.getUserMedia();

}