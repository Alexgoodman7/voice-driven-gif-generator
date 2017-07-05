//server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// configuration ===========================================
    
// config files
//var db = require('./config/db');

// set our port
var port = process.env.PORT || 8080; 

// connect to our mongoDB database 
// (uncomment after you enter in your own credentials in config/db.js)
// mongoose.connect(db.url); 

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json({limit: '1gb'})); 

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
//https://stackoverflow.com/questions/35418921/how-to-handle-xhr-blob-post-in-nodejs
app.use(bodyParser.urlencoded({ extended: false, limit: '1gb' })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// routes ==================================================
require('./app/routes')(app); // configure our routes

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 
app.use('/node_modules', express.static(__dirname + '/node_modules'));

// start app ===============================================

/*
var host = '45.63.68.43';
app.listen(port, host, function(err) {
  if (err) return console.log(err);
  console.log("Listening at http://%s:%s", host, port);
});
*/

'use strict';

require('greenlock-express').create({

  server: 'https://acme-v01.api.letsencrypt.org/directory'

, email: 'alexgoodman7@gmail.com'

, agreeTos: true

, approvedDomains: [ 'gifgenerator.alexgoodman.net' ]

, app: app

, renewWithin: (91 * 24 * 60 * 60 * 1000)
, renewBy: (90 * 24 * 60 * 60 * 1000)

, debug: false
}).listen(80, 443);






// expose app           
exports = module.exports = app;                         
