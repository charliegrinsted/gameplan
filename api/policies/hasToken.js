/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
var expressJwt = require('express-jwt');
var secret = 'ewfn09qu43f09qfj94qf*&H#(R';

module.exports = function(req, res, next) {

	console.log("checking...");
  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
	if (req.token) {
		return next();

	}

	else {
		return res.redirect('/login');
	}
  // User is not allowed
  // (default res.forbidden() behavior can be overridden in `config/403.js`)

};