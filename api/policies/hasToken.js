/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var jwt = require('jsonwebtoken');
var secret = 'ewfn09qu43f09qfj94qf*&H#(R';

module.exports = function(req, res, next) {

	var token = req.headers.token;

	jwt.verify(token, secret, function(err, decoded) {
		  if (err) {
		  	return res.json('Invalid Token.');
		  }
		return next();
	});
};