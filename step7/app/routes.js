
// routes.js

var fs = require('fs');

module.exports = function(app) {
	
	// route to handle creating goes here (app.post)
	
	app.post('/api/submit', function(req, res) {
		
		/*
		 * STEP 4: POST AUDIO TO NODE AND SAVE IT AS A LOCAL FILE
		 * REFERENCE: https://stackoverflow.com/questions/23986953/blob-saved-as-object-object-nodejs
		 */
		var original_response = res;
		
		//generate a unique filename
		// in step 5 I change this to a tmp file so it's not publically accessible
		var tmpFile = "/tmp/"+Math.random().toString(36).substr(2)+".wav"; 
		
		//write recording to local file
		var src = req.body.src;
		var buf = new Buffer(src, 'base64'); // decode
		fs.writeFile(tmpFile, buf, function(err) {
			if(err) {
	  			console.log("err", err);
			} else {
				console.log(tmpFile);
				
				/*
				 * STEP 5: CONVERT AUDIO TO TEXT USING GOOGLE CLOUD SPEECH API
				 *
				 * REFERENCES:
				 * https://cloud.google.com/speech/docs/sync-recognize
				 * https://www.npmjs.com/package/@google-cloud/speech
				 */				
				
				// Imports the Google Cloud client library
				// Instantiates a client
				var speech = require('@google-cloud/speech')({
				  projectId: 'gif-generator-172623', //replace this with your projectId
				  keyFilename: '/usr/local/gifgenerator/key.json' //replace this with your service account key location
				});

				// The path to the local file on which to perform speech recognition, e.g. /path/to/audio.raw
				const filename = tmpFile;

				// The encoding of the audio file, e.g. 'LINEAR16'
				const encoding = 'LINEAR16';

				// The sample rate of the audio file in hertz, e.g. 16000
				//I eliminated the need for this to account for different audio inputs
				//const sampleRateHertz = 44100;

				// The BCP-47 language code to use, e.g. 'en-US'
				const languageCode = 'en-US';

				const request = {
				  encoding: encoding,
				  languageCode: languageCode
				};

				// Detects speech in the audio file
				speech.recognize(filename, request)
				  .then((results) => {
					const transcription = results[0];

					console.log(`Transcription: ${transcription}`);
					
					/*
					 * STEP 6: USE GOOGLE NATURAL LANGUAGE API TO DETECT ENTITIES IN TEXT
					 *
					 * REFERENCES:
					 * https://cloud.google.com/natural-language/docs/analyzing-entities#language-entities-string-nodejs
					 */	
					
					// Imports the Google Cloud client library
					var language = require('@google-cloud/language')({
					  projectId: 'gif-generator-172623', //replace this with your projectId
					  keyFilename: '/usr/local/gifgenerator/key.json' //replace this with your service account key location
					});

					// The text to analyze, e.g. "Hello, world!"
					var text = transcription;
					if(text === "")
						text = "random"; // if there's no text detected, show a random gif

					// Instantiates a Document, representing the provided text
					const document = language.document({ content: text });

					// Detects entities in the document
					document.detectEntities()
					  .then((results) => {
						const entities = results[1].entities;

						console.log('Entities:');
						var entities_string = '';
						entities.forEach((entity) => {
						  console.log(entity.name);
							entities_string += entity.name + ' ';
						  console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
						});
						
						//if no entities found, just try to make a gif with the transcript
						if(entities_string === '')
							entities_string = text;
						
						console.log(entities_string);
						
						/*
						 * STEP 7: USE GIPHY API TO GRAB A GIF FROM THE DETERMINED ENTITIES
						 *
						 * REFERENCES:
						 * https://www.npmjs.com/package/giphy-api
						 */
						
						var giphy = require('giphy-api')();
						
						var giphy_data = {
							q: entities_string,
							limit: 1,
							rating: "pg"
						}
						giphy.search(giphy_data, function (err, res) {
							console.log(res);
							var url = res.data[0].embed_url;
							console.log(url);
							return original_response.json({'gif_url': url});
						});
						
					  })
					  .catch((err) => {
						console.error('ERROR:', err);
					  });
					
					
				  })
				  .catch((err) => {
					console.error('ERROR:', err);
				});
			}
		})
	})	
	
	// frontend routes =========================================================
	// route to handle all angular requests
	
	/*
	 * STEP 1: SET UP A SIMPLE NODE/EXPRESS HELLO WORLD APP 
	 * REFERENCE: https://scotch.io/tutorials/setting-up-a-mean-stack-single-page-application
	 */
	app.get('/', function(req, res) {
		res.sendfile('./public/views/index.html'); // load our public/index.html file
	});
	
}