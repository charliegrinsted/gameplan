/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	'new': function(req, res){

	// Pass in all of the available teams to populate the select element with possible associated teams.
		Team.find()
		.exec(function (err, teams) {
			if (err){
				return next(err);
			}
			// This passes an array to the view, allowing the values to be accessed by an EJS template.
			res.view({
				teams: teams
			});
		});

	},

	index: function(req, res, next){

		Event.find() // find all events and create an array
		.populate('eventTeam') // fetch the related values from the Team model
		.exec(function (err, events){
			console.log(events);
			if (err){
				return next(err);
			}
			res.view({
				events: events
			});
		});
	},

	create: function(req, res, next){

		// Create an object containing all of the parameters passed in by the user sign-up form
		var eventObj = {
			eventTitle: req.param('eventTitle'),
			eventTeam: req.param('eventTeam')
		}

		// As with much of Node, the parameters are passed in from the request object, then a callback runs.
		Event.create( eventObj , function EventCreated(err, savedEvent){
			// Error
			if (err){
				console.log(err);
				return res.redirect('events/new');
			}
			// Success
			res.json(savedEvent);

		});
	}	
	
};

