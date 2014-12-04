/**
 * SessionController
 *
 * @description :: Server-side logic for managing sessions
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var bcrypt = require('bcrypt');
var passport = require("passport");
var jwt = require('jsonwebtoken');
var secret = 'ewfn09qu43f09qfj94qf*&H#(R';

module.exports = {

	'new': function(req, res) {
		res.view('session/new');
	},

	createAPIsession: function(req, res, next){

		if (!req.param('userName') || !req.param('password')) {

			var formError = {
				type: 'Error',				
				name: 'Form error',
				message: 'Please fill in all fields.'
			}

			res.json(formError);

			return;
		}

		User.findOneByUserName(req.param('userName'))
		.populateAll()
		.exec(function foundUser(err, user) {

			if (err) return next(err);

			// If no user is found...
			if (!user) {
				var noAccountError = {
					type: 'Error',
					name: 'Account not found',
					message: 'The username ' + req.param('userName') + ' was not found.'
				}
				res.json(noAccountError);
				return;
			}

			bcrypt.compare(req.param('password'), user.encryptedPass, function(err, valid) {

				if (err) return next(err);

				if (!valid) {
					var passwordError = [{
						type: 'Error',						
						name: 'Error',
						message: 'Invalid username or password.'
					}]
					res.json(passwordError);
					return;
				}

				var token = jwt.sign(user, secret, {expiresInMinutes:60*24});

				user.save(function(err, user) {
					
					if (err) return next(err);

					var userObj = user.toObject();
					userObj.token = token;

					res.json(userObj); // pass back a JSON token

				});
			});
		});
	},

	create: function(req, res, next) {

		if (!req.param('userName') || !req.param('password')) {

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
		.populateAll()
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

				var token = jwt.sign(user, secret, {expiresInMinutes:60*24});
				req.session.authenticated = true;
				req.session.User = user;
				req.token = token;

				//console.log(req.token);
				
				user.save(function(err, user) {
					
					if (err) return next(err);

					// take the user back to the previous page (experimental, not working)
					//backURL = req.header('Referer') || '/';
					//console.log(backURL);
  					//res.redirect(backURL);

					res.redirect('/'); // take user to their homepage dashboard once signed in

				});
			});
		});
	},

	destroy: function(req, res, next){

		req.session.destroy();

		res.redirect('/');

	}
};