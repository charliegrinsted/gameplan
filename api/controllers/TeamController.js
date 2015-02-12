/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var utility = require('../services/utility'); // include the global helper functions
var moment = require('moment');

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

	search: function(req, res, next){

		var query = req.param('query');

		Team.find({ or: [{ teamName: { 'contains': query }}]})
		.exec(function(err, results){
			if (err){
				return next(err);
			}
			res.view({
				teams: results
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

		var theAdapter = require('skipper-gridfs')({uri: 'mongodb://localhost/gameplan.fs' });

		var showTeam = function(team, image){
			res.view({
				image: null,
				team: team,
				moment: moment
			});
		}

		var parseFile = function(parentObject, returnedFile, user){  

			var team = parentObject;

			if (returnedFile == null){
				res.view({
					image: null,
					team: team,
					moment: moment
				});
			}
			else {

				res.view({
					image: returnedFile,
					team: team,
					moment: moment
				});
			}
		}

		Team.findOneById(req.param('id'))
		.populateAll()
		.exec(function(err, team) {
			if (err) return next(err);

			if (!team) return next();
			
			if (team.teamPhoto){
				utility.readFile(team, team.teamPhoto, parseFile);
			} else {
				showTeam(team, null);
			}		
		});

	},

	addTeamPhoto: function (req, res) {

		var teamID = req.param('id');

		var addFileToTeam = function(returnedFile){

			var teamObj = {
				teamPhoto: returnedFile
			}

			Team.update({id: teamID}, teamObj)
			.exec(function updatedTeam(err,updated){

				if (err) {
					return res.redirect('/teams/' + teamID);
				}
					
				res.redirect('/teams/' + teamID);
			});
		}
		utility.uploadFile(req, 'teamPhoto', addFileToTeam);
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
			team.save(function(err) {
					
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
		var activeUser = req.session.User.id;

		Team.findOneById(thisTeam)
		.populateAll()
		.exec(function(err, teamToDelete) {
			if (err) {
				return res.serverError();
			}
			if (teamToDelete.teamAdmin.id == activeUser){
				Team.destroy({id: thisTeam})
				.exec(function(err, team) {
					if (err) {
						return res.serverError();
					}
					Event.destroy({eventTeam: thisTeam}) // loop through and destroy all of the events dependent on to that team
					.exec(function(err, events) {
						res.redirect('/teams');
					});
				});
			}
			else {
				res.redirect('/teams/' + thisTeam);
			}
		});

	},

	leaveTeam: function(req, res, next){

		var thisTeam = req.param('id');
		var activeUser = req.session.User.id;

		if (req.session.User.userName){

			Team.findOneById(thisTeam)
			.populateAll()
			.exec(function(err, teamToLeave) {

				if (teamToLeave.teamAdmin.id == activeUser){

					// add an error flash saying you can't quit because you're the admin

					res.redirect('/teams/' + thisTeam);

				} else {

					// add error handling
					teamToLeave.teamMembers.remove(activeUser); // remove yourself from the team
					teamToLeave.save(function(err, team) {
						
						if (err) return next(err);

						res.redirect('/teams/' + thisTeam);

					});
				}	
			});	
		}

		else {

			// PUT SOME PROPER ERROR HANDLING HERE

			res.redirect('/');

		}
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

