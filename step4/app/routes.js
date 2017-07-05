/*
 * STEP 1: SET UP A SIMPLE NODE/EXPRESS HELLO WORLD APP 
 * REFERENCE: https://scotch.io/tutorials/setting-up-a-mean-stack-single-page-application
 */

// routes.js

module.exports = function(app) {
	
	// frontend routes =========================================================
	// route to handle all angular requests
	
	app.get('/', function(req, res) {
		res.sendfile('./public/views/index.html'); // load our public/index.html file
	});
	
}