
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
		var tmpFile = "/var/www/html/step4/public/files/"+Math.random().toString(36).substr(2)+".wav";
		
		//write recording to local file
		var src = req.body.src;
		var buf = new Buffer(src, 'base64'); // decode
		fs.writeFile(tmpFile, buf, function(err) {
			if(err) {
	  			console.log("err", err);
			} else {
				console.log(tmpFile);
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