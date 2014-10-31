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

		User.find() // find all teams and create an array
		.populate('teamsAdministered') // fetch the related values from the User model
		.exec(function (err, users){
			if (err){
				return next(err);
			}
			res.view({
				users: users
			});
		});
	},

	show: function(req, res, next) {
		User.find()
		.where({ userName: req.param('userName') })
		.limit(1)
		.exec(function(err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.view({
				user: user[0]
			});
		});
	},

	create: function(req, res, next){

		// Create an object containing all of the parameters passed in by the user sign-up form
		var userObj = {
			firstName: req.param('firstName'),
			lastName: req.param('lastName'),
			userName: req.param('userName'),
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
			res.redirect('users/' + userObj.userName);

		});
	}
	
};

