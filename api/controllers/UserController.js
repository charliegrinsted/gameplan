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
		.populate('teamsAdministered') // fetch the related values from the Team model
		.populate('friendRequestsReceived') // fetch the related values from the Team model
		.populate('friendRequestsSent')
		.exec(function (err, users){
			if (err){
				return next(err);
			}
			res.view({
				users: users
			});
		});
	},

	sendFriendRequest: function(req, res, next){

		var userToAdd = (req.param('userName')); // store the user we're adding as a friend
		var activeUser = (req.session.User.id); // store who we are

		console.log(userToAdd);
		console.log(activeUser);

		/*User.find()
		.where({ userName: activeUser })
		.limit(1)
		.exec(function(err, user) {
			console.log(user[0]);
			user[0].friendRequestsSent.add(userToAdd); // add the user we're adding to our sent requests
			user[0].save();
		});*/

		User.find()
		.where({ userName: userToAdd })
		.limit(1)
		.exec(function(err, user) {
			// add error handling
			user[0].friendRequestsReceived.add(activeUser); // add one's self to the user's received requests

			user[0].save(function(err, user) {
				
				if (err) return next(err);

				res.redirect('/users/' + user.userName); // take user to their profile once signed in

			});
		});
	},

	acceptFriendRequest: function(req, res, next){

	},	

	indexJSON: function(req, res, next){

		User.find() // find all teams and create an array
		.populate('teamsAdministered') // fetch the related values from the Team model
		.exec(function (err, users){
			if (err){
				return next(err);
			}
			res.json({
				users: users
			});
		});
	},

	show: function(req, res, next) {
		User.find()
		.where({ userName: req.param('userName') })
		.limit(1)
		.populate('teamsAdministered') // fetch the related values from the Team model		
		.exec(function(err, user) {
			if (err) return res.redirect(404);
			if (!user) return res.redirect(404);
			if (!user){
				console.log('WHAT IS HAPPENING');
			}
			res.view({
				user: user[0]
			});
		});
	},

	showJSON: function(req, res, next) {
		User.find()
		.where({ userName: req.param('userName') })
		.limit(1)
		.populate('teamsAdministered') // fetch the related values from the Team model		
		.exec(function(err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.json({
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
				req.session.flashMsg = {
					err: err
				}
				return res.redirect('/signup');
			}
			// Success
			console.log("User profile created successfully");

			req.session.authenticated = true;
			req.session.User = user;

			user.save(function(err, user) {
				
				if (err) return next(err);

				res.redirect('/users/' + user.userName); // take user to their profile once signed in

			});

		});
	},

	update: function(req, res, next) {

		if (req.session.User.userName){

			var currentUser = req.session.User.userName;

			var userObj = {
				firstName: req.param('firstName'),
				lastName: req.param('lastName'),
			}

			User.update({userName: currentUser}, userObj)
			.exec(function updatedUser(err,updated){

				if (err) {
					return res.redirect('/settings');
				}

			console.log('Updated user');
			
			res.redirect('/users/' + req.session.User.userName);

			});
		}

		else {

			// PUT SOME PROPER ERROR HANDLING HERE

			res.redirect('/');

		}
	},

	edit: function(req, res, next) {

		if (!req.session.User){
			// redirect to login if there is no active user signed in
			res.redirect('/login');
		} 
		else {
			var currentUser = req.session.User.userName;
			console.log(currentUser);
			if (currentUser){
				User.find()
				.where({ userName: currentUser })
				.limit(1)
				.exec(function (err, user){
					if (err){
						return next(err);
					}
					console.log(user);
					res.view({
						user: user[0]
					});
				});
			}
			
		}

	},

};

