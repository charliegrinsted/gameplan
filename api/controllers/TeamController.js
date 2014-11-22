/**
 * TeamController
 *
 * @description :: Server-side logic for managing teams
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

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
		Team.find()
		.where({ id: req.param('id') })
		.limit(1)
		.populate('teamAdmin') // fetch the related values from the User model		
		.exec(function(err, team) {
			if (err) return next(err);
			if (!team) return next();
			res.view({
				team: team[0]
			});
		});
	},

	showJSON: function(req, res, next) {
		Team.find()
		.where({ id: req.param('id') })
		.limit(1)
		.populate('teamAdmin') // fetch the related values from the Team model		
		.exec(function(err, team) {
			if (err) return next(err);
			if (!team) return next();
			res.json({
				team: team[0]
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
			// Success
			res.redirect('/teams/' + team.id);
		});
	},

	edit: function(req, res, next) {

		if (!req.session.User){
			// redirect to login if there is no active user signed in
			res.redirect('/login');
		} 
		else {

			Team.find()
			.where({ id: req.param('id') })
			.limit(1)
			.populate('teamAdmin') // fetch the related values from the Team model		
			.exec(function(err, team) {
				if (team[0].teamAdmin.userName != req.session.User.userName){
					res.redirect('/teams/' + team[0].id);
				}
				if (err) return next(err);
				if (!team) return next();
				res.view({
					team: team[0]
				});
			});			
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
				console.log("Deleted:");
				console.log(events);
			});

		});

		// redirect with a flash message of successful deletion - TO DO
		res.redirect('/');

	}	
	
};

