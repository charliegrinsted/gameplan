/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
	if (req.session.authenticated) {
		var currentUser = req.session.User.id;

		User.findOneById(currentUser)
		.populateAll()
		.exec(function foundUser(err, user) {
			req.session.User = user;
			return next();
		});
	}

	else {

		return res.redirect('/login');

	}

};
