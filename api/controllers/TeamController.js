/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var theAdapter = require('skipper-gridfs')({uri: 'mongodb://localhost/gameplan.fs' });

module.exports = {

	'new': function(req, res, next){

		// Pass in all of the available users to populate the select element with possible administrators.
		User.find()
		.exec(function (err, users) {
			if (err){
				return next(err);
			}
			// This passes an array to the view, allowing the values to be accessed by an EJS template.
			res.view({
				users: users
			});
		});

	},

	index: function(req, res, next){

		Team.find() // find all teams and create an array
		.populate('teamAdmin') // fetch the related values from the User model
		.exec(function (err, teams){
			if (err){
				return next(err);
			}
			res.view({
				teams: teams
			});
		});
	},

	indexJSON: function(req, res, next){

		Team.find() // find all teams and create an array
		.populate('teamAdmin') // fetch the related values from the User model
		.exec(function (err, teams){
			if (err){
				return next(err);
			}
			res.json({
				teams: teams
			});
		});

	},

	show: function(req, res, next) {
		Team.findOneById(req.param('id'))
		.populateAll()
		.exec(function(err, team) {
			/*console.log(team.teamMembers.length);
			var loopLength = team.teamMembers.length;
			for (var i = 0; i < loopLength; i++){
				if (team.teamMembers[i].profilePhoto){
					console.log(team.teamMembers[i]);
					theAdapter.readLastVersion(team.teamMembers[i].profilePhoto, function (err, file){
						console.log(file);
						team.teamMembers[i].profilePhoto = file.toString('base64');
						return;
					});
				}
			}*/
			// console.log(team);
			if (err) return next(err);
			if (!team) return next();
			res.view({
				team: team
			});
		});

	},

	showJSON: function(req, res, next) {
		Team.findOneById(req.param('id'))
		.populateAll()
		.exec(function(err, team) {
			if (err) return next(err);
			if (!team) return next();
			res.json({
				team: team
			});
		});
	},

	create: function(req, res, next){

		// Create an object from the parameters passed in by the form.
		var teamObj = {
			teamName: req.param('teamName'),
			teamSport: req.param('teamSport'),
			teamAdmin: req.session.User.id
		}

		// Add a new database entry using the created object values
		Team.create(teamObj)
		.exec(function UserCreated(err, team){

			// Error
			if (err) return next(err);

			team.teamMembers.add(teamObj.teamAdmin); // add yourself to the list of members when creating the team
			team.save(function(err, user) {
					
				if (err) return next(err);

				res.redirect('/teams/' + team.id);

			});

		});
	},

	edit: function(req, res, next) {

		if (!req.session.User){
			// redirect to login if there is no active user signed in
			res.redirect('/login');
		} 
		else {

		Team.findOneById(req.param('id'))
		.populateAll()
			.exec(function(err, team) {
				if (team.teamAdmin.userName != req.session.User.userName){
					res.redirect('/teams/' + team.id);
				}
				if (err) return next(err);
				if (!team) return next();
				res.view({
					team: team
				});
			});			
		}

	},

	update: function(req, res, next) {

		var teamID = req.param('id');
		// need to lookup team and check that the current user is the team admin.
		
		if (req.session.User.userName){


			var teamObj = {
				teamName: req.param('teamName'),
				teamSport: req.param('teamSport'),				
				teamInfo: req.param('teamInfo')
			}

			Team.update({id: teamID}, teamObj)
			.exec(function updatedTeam(err,updated){

				if (err) {
					return res.redirect('teams/manage/' + teamID);
				}

			console.log('Team updated');
			console.log(updated);
			
			res.redirect('/teams/' + teamID);

			});
		}

		else {

			// PUT SOME PROPER ERROR HANDLING HERE

			res.redirect('/login');

		}
	},	

	delete: function(req, res, next){

		var thisTeam = req.param('id');

		Team.destroy({id:thisTeam}) // destroy the instance of the team
		.exec(function(err, team) {
			if (err) {
				return res.serverError();
			}
			Event.destroy({eventTeam: thisTeam}) // loop through and destroy all of the events dependent on to that team
			.exec(function(err, events) {
				res.redirect('/');
			});

		});

	},

	requestToJoinTeam: function(req, res, next){

		var thisTeam = req.param('id');
		var activeUser = req.session.User.id;
		// console.log(req.session.User.userName);

		if (req.session.User.userName){

			Team.findOneById(thisTeam)
			.exec(function(err, teamToJoin) {
				// add error handling
				teamToJoin.joinRequestsReceived.add(activeUser); // add yourself to the waiting list
				teamToJoin.save(function(err, user) {
					
					if (err) return next(err);

					res.redirect('/teams/' + thisTeam);

				});
			});	
		}

		else {

			// PUT SOME PROPER ERROR HANDLING HERE

			res.redirect('/');

		}
	},

	acceptJoinRequest: function(req, res, next){

		var userToAdd = req.param('user'); // store who we are
		var thisTeam = req.param('id');

		Team.findOneById(thisTeam)
		.exec(function(err, team) {
			// add error handling
			team.teamMembers.add(userToAdd); // add yourself to the friend's list
			team.joinRequestsReceived.remove(userToAdd); // delete the request object, since it has been fulfilled

			// need to find a way to repopulate the session user, otherwise the request doesn't go away until you log out and in again

			team.save(function(err, user) {
				
				if (err) return next(err);

				res.redirect('/teams/' + thisTeam); // redirect to the team page when complete

			});
		});		

	},	
	
};

