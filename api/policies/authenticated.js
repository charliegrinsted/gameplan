module.exports = function(req, res, next) {

  /* User is allowed, proceed to the next policy, otherwise redirect to the login page */
	if (req.session.authenticated) {

		/* Look up this user and repopulate their information. This is done to keep
		user information up-to-date without the need for them to reauthenticate */
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
