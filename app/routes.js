var fs = require('fs');

module.exports = function(app) {
	
	// server routes ===========================================================
	// handle things like api calls
	// authentication routes
	
	// route to handle creating goes here (app.post)
	
	app.post('/api/submit', function(req, res) {
		
		//BACKEND STEP 1: Get Recording as BASE64 and save as a local file
		var original_response = res;
		
		//generate a unique filename
		var tmpFile = "/tmp/"+Math.random().toString(36).substr(2)+".wav";
		
		//write recording to local file
		//REFERENCE: https://stackoverflow.com/questions/23986953/blob-saved-as-object-object-nodejs
		var src = req.body.src;
		var buf = new Buffer(src, 'base64'); // decode
		fs.writeFile(tmpFile, buf, function(err) {
			if(err) {
	  			console.log("err", err);
			} else {
				
				//BACKEND STEP 2: Convert Recording to Text
				/*
					REFERENCES: 
					https://cloud.google.com/speech/docs/sync-recognize
					https://www.npmjs.com/package/@google-cloud/speech
				*/
				
				
				// Imports the Google Cloud client library
				// Instantiates a client
				var speech = require('@google-cloud/speech')({
				  projectId: 'gif-generator-172623',
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
					
					
					
					//BACKEND STEP 3: Analyze "Entites" in Text
					/*
						REFERENCES:
						https://cloud.google.com/natural-language/docs/analyzing-entities#language-entities-string-nodejs
					*/
					
					// Imports the Google Cloud client library
					var language = require('@google-cloud/language')({
					  projectId: 'gif-generator-172623',
					  keyFilename: '/usr/local/gifgenerator/key.json' //replace this with your service account key location
					});

					// The text to analyze, e.g. "Hello, world!"
					var text = transcription;
					if(text === "")
						text = "random";

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
						  if (entity.metadata && entity.metadata.wikipedia_url) {
							console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
						  }
						});
						
						//if no entities found, just try to make a gif with the transcript
						if(entities_string === '')
							entities_string = text;
						
						console.log(entities_string);
						
						//BACKEND STEP 4: CONVERT ENTITES TO A GIF
						/*
						 *	REFERENCES: 
						 *	https://www.npmjs.com/package/giphy-api
						 */
						
						var giphy = require('giphy-api')();
						// Search with a plain string using callback 
						
						var giphy_data = {
							q: entities_string,
							limit: 1
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
	app.get('/', function(req, res) {
		res.sendfile('./public/views/index.html'); // load our public/index.html file
	});
	
}