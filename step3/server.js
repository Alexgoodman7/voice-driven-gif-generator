/*
 * STEP 3: BUILD A WEB APP TO CAPTURE MICROPHONE AUDIO
 * REFERENCE: https://git.daplie.com/Daplie/greenlock-express 
 */

// server.js

// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');

// configuration ===========================================

// get all data/stuff of the body (POST) parameters
// parse application/json 
app.use(bodyParser.json({limit: '1gb'})); // set limit to 1gb to account for sending base64 audio

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true })); 

// override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(methodOverride('X-HTTP-Method-Override')); 

// routes ==================================================
require('./app/routes')(app); // configure our routes

// set the static files location /public/img will be /img for users
app.use(express.static(__dirname + '/public')); 
app.use('/node_modules', express.static(__dirname + '/../node_modules'));

// start app ===============================================
require('greenlock-express').create({

  server: 'https://acme-v01.api.letsencrypt.org/directory'

, email: 'alexgoodman7@gmail.com' // change this to your email

, agreeTos: true

, approvedDomains: [ 'gifgenerator.alexgoodman.net' ] // change this to your domain

, app: app

, renewWithin: (91 * 24 * 60 * 60 * 1000)
, renewBy: (90 * 24 * 60 * 60 * 1000)

, debug: false
}).listen(80, 443);

// expose app           
exports = module.exports = app;                         
