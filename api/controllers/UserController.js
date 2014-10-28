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
		User.find(function foundUsers(err, users) {
			if (err){
				return next(err);
			}
			// This passes an array to the view, allowing the values to be accessed by an EJS template.
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
			// Error
			if (err){
				console.log(err);
				return res.redirect('users/new');
			}
			// Success
			res.json(user);

		});
	}
	
};

