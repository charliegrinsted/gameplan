/* This policy is used exclusively with the Android API routes. Any route defined in ../config/routes.js
which uses the /api segment is subject to this policy. Since a cookie couldn't be set for an app, it uses
JSON Web Tokens to manage authorisation. This is further explained in the accompanying paperwork */

// Include the jsonwebtoken module
var jwt = require('jsonwebtoken');

// Set a string for the token to be checked against
var secret = 'ewfn09qu43f09qfj94qf*&H#(R';

module.exports = function(req, res, next) {

	// Get the token from the HTTP request header
	var token = req.headers.token;

	// Verify the token against the secret and return either an error or proceed as authorised
	jwt.verify(token, secret, function(err, decoded) {
		  if (err) {
		  	return res.json('Invalid Token.');
		  }
		return next();
	});
};