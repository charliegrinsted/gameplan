/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	'new': function(req, res){

		var minute = 60000;
		var hour = 3600000;
		req.session.cookie.maxAge = minute;
		// req.session.cookie.maxAge = (14 * 24 * hour);
		req.session.authenticated = true;
		console.log(req.session);
		res.view('session/new');

	}
	
};

