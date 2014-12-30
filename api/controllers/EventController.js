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
		.populateAll() // fetch the related values from the other models
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
				eventData.eventStatus = "past";
			}
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
			startTime: req.param('startTime'),
			endTime: req.param('endTime'),
			eventType: req.param('eventType'),
			spacesAvailable: req.param('spacesAvailable'),
			eventLat: req.param('locationLat'),
			eventLng: req.param('locationLng')
		}

		// Lookup the team to be associated with the event and double check permissions
		Team.findOneById(eventObj.eventTeam)
		.populateAll()
		.exec(function (err, team){

			if (team.teamAdmin.id != req.session.User.id){

				res.redirect('/events');

			} else {

				Event.create( eventObj , function EventCreated(err, savedEvent){
					// Error
					if (err) return next(err);

					savedEvent.attendees.add(team.teamAdmin.id); // add yourself to the list of attendees when creating the event
					savedEvent.save(function(err, thisEvent) {
							
						if (err) return next(err);

						res.redirect('/events/' + savedEvent.id);

					});

				});

			}
		});
	},

	update: function(req, res, next) {

		if (req.session.User.userName){

			var currentUser = req.session.User.userName;
			var thisEvent = req.param('id');

			var eventObj = {
				eventTitle: req.param('eventTitle'),
				eventTeam: req.param('eventTeam'),
				startTime: req.param('startTime'),
				endTime: req.param('endTime'),
				eventType: req.param('eventType'),
				spacesAvailable: req.param('spacesAvailable')
			}

			Event.update(thisEvent, eventObj)
			.exec(function updatedEvent(err, updated){

				console.log('Updated event');
				
				res.redirect('/events/' + thisEvent);

			});
		}

		else {

			// PUT SOME PROPER ERROR HANDLING HERE

			res.redirect('/');

		}
	},

	edit: function(req, res, next) {

		Event.findOneById(req.param('id'))
		.populateAll()
		.exec(function(err, thisEvent) {
			if (!req.session.User.userName){
				res.redirect('/events/' + thisEvent.id);
			}
			if (err) return next(err);
			if (!thisEvent) return next();
			res.view({
				thisEvent: thisEvent
			});
		});

	},

	delete: function(req, res, next){

		var thisEvent = req.param('id');
		var activeUser = req.session.User.id;

		Event.findOneById(thisEvent)
		.populateAll()
		.exec(function(err, eventToDelete) {
			if (err) {
				return res.serverError();
			}
			if (eventToDelete.eventTeam.teamAdmin == activeUser){
				Event.destroy({id: thisEvent})
				.exec(function(err, deletedEvent) {
					res.redirect('/events');
				});
			}
			else {
				res.redirect('/events/' + thisEvent);
			}
		});

	},	

	rsvp: function(req, res, next){

		var thisEvent = req.param('id');
		var activeUser = req.session.User.id;

		if (req.session.User.userName){

			Event.findOneById(thisEvent)
			.populateAll()
			.exec(function(err, eventToUpdate) {
				// add error handling
				eventToUpdate.attendees.add(activeUser); // add yourself to the event attendees list
				eventToUpdate.save(function(err, user) {
					
					if (err){
						res.redirect('/events' + thisEvent);
					}

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

