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

	create: function(req, res, next){

		// Create an object from the parameters passed in by the form.
		var teamObj = {
			teamName: req.param('teamName'),
			teamSport: req.param('teamSport'),
			teamAdmin: req.param('teamAdmin')
		}

		// Add a new database entry using the created object values
		Team.create(teamObj)
		.exec(function UserCreated(err, team){
			// Error
			if (err) return next(err);
			// Success
			res.json(team);
		});
	}	
	
};

