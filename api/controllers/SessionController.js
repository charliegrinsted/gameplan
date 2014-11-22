/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');

module.exports = {

	'new': function(req, res) {
		res.view('session/new');
	},

	create: function(req, res, next) {

		if (!req.param('userName') || !req.param('password')) {

			console.log("WHAT");

			var formError = [{
				name: 'Form error',
				message: 'Please fill in all fields.'
			}]

			req.session.flashMsg = {
				err: formError
			}

			res.redirect('/login');
			return;
		}

		User.findOneByUserName(req.param('userName'))
		.populate('friendRequestsReceived')
		.populate('friends')
		.populate('teamsAdministered')
		.exec(function foundUser(err, user) {

			if (err) return next(err);

			// If no user is found...
			if (!user) {
				var noAccountError = [{
					name: 'Account not found',
					message: 'The username ' + req.param('userName') + ' was not found.'
				}]
				req.session.flashMsg = {
					err: noAccountError
				}
				console.log(noAccountError);
				res.redirect('/login');
				return;
			}

			bcrypt.compare(req.param('password'), user.encryptedPass, function(err, valid) {

				if (err) return next(err);

				if (!valid) {
					var passwordError = [{
						name: 'Error',
						message: 'Invalid username or password.'
					}]
					req.session.flashMsg = {
						err: passwordError
					}
					console.log(passwordError);
					res.redirect('/login');
					return;
				}

				req.session.authenticated = true;
				req.session.User = user;

				user.save(function(err, user) {
					
					if (err) return next(err);

					// take the user back to the previous page (experimental, not working)
					//backURL = req.header('Referer') || '/';
					//console.log(backURL);
  					//res.redirect(backURL);

					res.redirect('/users/' + user.userName); // take user to their profile once signed in

				});
			});
		});
	},

	destroy: function(req, res, next){

		req.session.destroy();

		res.redirect('/');

	}
};