/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment'); // include Moment.js for funky date formatting to compare with stored event times

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
			// console.log(events);
			if (err){
				return next(err);
			}
			res.view({
				events: events
			});
		});
	},

	show: function(req, res, next) {
		var now = moment().format('YYYY-MM-DDTHH:mm:ss');
		Event.findOneById(req.param('id'))
		.populate('eventTeam') // fetch the related values from the Team model
		.populate('attendees')
		.then(function(eventData){

			var teamData = Team.findOneById(eventData.eventTeam.id) // find the related team using the eventTeam attribute
			.populate('teamAdmin') // fetch the related values from the User model
			.then(function(teamData){
				var new_data = teamData;
				delete new_data.createdAt;
				delete new_data.updatedAt;
				return new_data;
			});

  			return [teamData, eventData];
		})
		.spread(function(teamData, eventData){
			eventData.eventTeam = teamData; // set the EventTeam attribute to the team data we've retrieved
			var formattedEnd = eventData.endTime.toISOString(); // Make the End Time an ISO formatted time
			if (formattedEnd < now){ // compare it with the current time
				console.log("A past event");
				eventData.eventStatus = "past";
			}
			console.log(eventData);
			res.view({
				thisEvent: eventData
			});
		})
	},	

	create: function(req, res, next){

		// Create an object containing all of the parameters passed in by the user sign-up form
		var eventObj = {
			eventTitle: req.param('eventTitle'),
			eventTeam: req.param('eventTeam'),
			eventIsPublic: req.param('eventIsPublic'),
			startTime: req.param('startTime'),
			endTime: req.param('endTime'),
			eventType: req.param('eventType'),
			spacesAvailable: req.param('spacesAvailable')
		}
		console.log(eventObj);

		// As with much of Node, the parameters are passed in from the request object, then a callback runs.
		Event.create( eventObj , function EventCreated(err, savedEvent){
			// Error
			if (err){
				console.log(err);
				return res.redirect('events/new');
			}
			// Success
			res.redirect('/events/' + savedEvent.id);

		});
	},

	rsvp: function(req, res, next){

		var thisEvent = req.param('id');
		var activeUser = req.session.User.id;

		if (req.session.User.userName){

			Event.find()
			.where({ id: thisEvent })
			.limit(1)
			.exec(function(err, eventToUpdate) {
				// add error handling
				eventToUpdate[0].attendees.add(activeUser); // add yourself to the event attendees list
				eventToUpdate[0].save(function(err, user) {
					
					if (err) return next(err);

					res.redirect('/events/' + thisEvent); // take user to their profile once signed in

				});
			});	
		}

		else {

			// PUT SOME PROPER ERROR HANDLING HERE

			res.redirect('/');

		}
	}
	
};

