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

		// double check to see if the user is awaiting approval

		var userToAccept = (req.param('userName')); // store the user we're adding as a friend
		var activeUser = (req.session.User.id); // store who we are

		User.find()
		.where({ userName: userToAccept })
		.limit(1)
		.exec(function(err, user) {
			// add error handling
			user[0].friendOf.add(activeUser); // add yourself to the friend's list
			user[0].friends.add(activeUser); // and vice versa
			user[0].friendRequestsSent.remove(activeUser); // delete the request object, since it has been fulfilled

			// need to find a way to repopulate the session user, otherwise the request doesn't go away until you log out and in again

			user[0].save(function(err, user) {
				
				if (err) return next(err);

				res.redirect('/users/' + user.userName); // take user to their profile once signed in

			});
		});		

	},

	addProfilePhoto: function (req, res) {
	// get this working
	// res.setTimeout(0);
		console.log("gets this far");
		req.file('avatar')
		.upload({maxBytes:1000000}, function complete(err, uploadedFiles) {
			if (err) return res.serverError(err);
			else return 
			res.json({
				files:uploadedFiles,
			});
		});
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
		.populate('friends')
		.populate('friendRequestsSent')
		.populate('friendRequestsReceived')
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
			passwordConfirmation: req.param('passwordConfirmation'),
			publicView: req.param('publicView')
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
				publicView: req.param('publicView')
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
			if (currentUser){
				User.find()
				.where({ userName: currentUser })
				.limit(1)
				.exec(function (err, user){
					if (err){
						return next(err);
					}
					res.view({
						user: user[0]
					});
				});
			}
			
		}

	},

	delete: function(req, res, next){

		var userToDelete = req.param('userName');
		var currentUserID = req.session.User.id;
		var currentUserName = req.session.User.userName;

		if (userToDelete == currentUserName){
			User.destroy({id:currentUserID}) // destroy the instance of the user
			.exec(function(err, user) {
				if (err) {
					return res.serverError();
				}
				Team.destroy({teamAdmin: currentUserID}) // loop through and destroy all of the teams dependent on to that user
				.populate('teamEvents')
				.exec(function(err, teams, i) {
					console.log(teams);
					var teamIDs = teams.map(function(team){
						return team.id;
					});
					Event.destroy({eventTeam: teamIDs})
					.exec(function(err, events) {
						console.log(teams);
					});
				});

			});

			// redirect with a flash message of successful deletion - TO DO
			req.session.destroy(); // destroy the session containing the now deleted user
			res.redirect('/'); // redirect to homepage
			
		}
		else {
			res.redirect('/users')
		}
	}	

};

