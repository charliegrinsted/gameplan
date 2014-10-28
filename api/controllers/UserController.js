/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	'new': function(req, res){

		res.view();

	},

	index: function(req, res, next){
		console.log(new Date());
		User.find(function foundUsers(err, users) {
			if (err){
				return next(err);
			}
			res.view({
				users: users
			});
		});
	},

	create: function(req, res, next){

		// Create an object containing all of the parameters passed in by the user sign-up form
		var userObj = {
			firstName: req.param('firstName'),
			lastName: req.param('lastName'),
			email: req.param('email'),
			password: req.param('password'),
			passwordConfirmation: req.param('passwordConfirmation')
		}

		// As with much of Node, the parameters are passed in from the request object, then a callback runs.
		User.create( userObj , function UserCreated(err, user){

			console.log(userObj);

			// Error
			if (err) return next(err);
			// Success
			res.json(user);

		});
	}
	
};

