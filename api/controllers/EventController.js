/* EventController - Server-side logic for managing events */

// Include Moment.js for easier date formatting to compare with stored event times
var moment = require('moment');
// Include the global helper functions for building notifications & handling files
var utility = require('../services/utility');

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
				page_title: "Create an event",
				teams: teams
			});
		});

	},

	search: function(req, res, next){

		// Take the search query string
		var query = req.param('query');

		// Search through all events to find the query, then pass results to a view
		Event.find({ or: [{ eventTitle: { 'contains': query }}]})
		.populateAll()
		.exec(function(err, results){
			if (err){
				return next(err);
			}
			res.view({
				page_title: "Search for an event",
				events: results
			});
		});

	},	

	index: function(req, res, next){

		// What's the time right now?
		var now = new Date(moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');

		Event.find() // find all events
		.where({ endTime: { '>=': now }}) // that end after the current time, thus not expired/past events
		.populate('eventTeam') // fetch the related values from the Team model for each event
		.exec(function (err, events){
			if (err){
				return next(err);
			}
			res.view({
				page_title: "Events",
				events: events
			});
		});
	},

	nearby: function(req, res, next){

		var lat = parseFloat(req.param('lat')); // get the latitude from POST and make it a number
		var lng = parseFloat(req.param('lng')); // get the longitude from POST and make it a number
		var distance = parseFloat(req.param('distance')); // get the search radius and make it a number

		var locationObj = {
			lat : lat,
			lng : lng
		}

		Event.native(function(err, collection) {
			collection.geoNear(lng, lat, {
				maxDistance: distance / 10000, // calculate radius to search
				query: { eventPrivacy: 'public' }, // filters out group-only events
				spherical : true
			}, function(mongoErr, results) {
				if (mongoErr) {
					console.error(mongoErr);
					res.send('geoProximity failed with error='+mongoErr);
				} else {
					res.json(results);
				}
		  	});
		});
	},

	nearbyJSON: function(req, res, next){ 

		/* Despite being identical to the action above, this is required to properly handle permissions with policies. 
		The app requires a JSON Web Token, whereas the previous action will rely on the session authentication.
		Taking a look at config/policies.js will clarify this if need be. */

		var lat = parseFloat(req.param('lat')); // get the latitude from POST and make it a number
		var lng = parseFloat(req.param('lng')); // get the longitude from POST and make it a number
		var distance = parseFloat(req.param('distance')); // get the search radius and make it a number

		var locationObj = {
			lat : lat,
			lng : lng
		}

		Event.native(function(err, collection) {
			collection.geoNear(lng, lat, {
				maxDistance: distance / 10000, // calculate radius to search
				query: { eventPrivacy: 'public' }, // filters out group-only events
				spherical : true
			}, function(mongoErr, results) {
				if (mongoErr) {
					console.error(mongoErr);
					res.send('geoProximity failed with error='+mongoErr);
				} else {
					res.json(results);
				}
		  	});
		});
	},	

	show: function(req, res, next) {

		var now = new Date(moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');

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
				page_title: eventData.eventTitle,
				thisEvent: eventData,
				moment: moment
			});
		});
	},

	showJSON: function(req, res, next) {

		var now = new Date(moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z');

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
			res.json({
				thisEvent: eventData
			});
		});
	},	

	create: function(req, res, next){

		var valid = true;
		var lng = parseFloat(req.param('locationLng'));
		var lat = parseFloat(req.param('locationLat'));

		// probably turn this into a switch statement
		var checkFields = function(param, message){
			if (param == ''){
				req.session.flashMsg = {
					err: message
				}
				valid = false;
			}
		}

		checkFields(req.param('eventTitle'), "You haven't set a title!");
		checkFields(req.param('startTime'), "You haven't set a start time!");
		checkFields(req.param('endTime'), "You haven't set an end time!");

		if (req.param('startTime') > req.param('endTime')){

			var message = [{message: 'The event start time cannot be after the end time'}]
			req.session.flashMsg = {
				err: message
			}
			valid = false;
		}

		if (valid == true){

			var locationObj = { 
				"type": "Point", 
				"coordinates": [lng, lat]
			}

			// Create an object containing all of the parameters passed in by the user sign-up form
			var eventObj = {
				eventTitle: req.param('eventTitle'),
				eventTeam: req.param('eventTeam'),
				eventInfo: req.param('eventInfo'),
				spacesAvailable: req.param('spacesAvailable'),
				eventPrivacy: req.param('eventPrivacy'),
				startTime: req.param('startTime'),
				endTime: req.param('endTime'),
				location: locationObj
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

						// Create the notification and send it to everyone in the team
						var content = team.teamAdmin.firstName + " " + team.teamAdmin.lastName + " created the event " + savedEvent.eventTitle;
						var title = savedEvent.eventTitle;
						var url = "/events/" + savedEvent.id;

						for (var i = 0; i < team.teamMembers.length; i++) {
							var userID = team.teamMembers[i].id;
							utility.createNotification(title, userID, content, url);
						};

						savedEvent.save(function(err, thisEvent) {
								
							if (err) return next(err);

							res.redirect('/events/' + savedEvent.id);

						});

					});

				}
			});
		}
		else {
			return res.redirect('/create/event');
		}
	},

	update: function(req, res, next) {

		thisEventId = req.param('id');

		if (req.session.User.userName){

			if (req.param('startTime') > req.param('endTime')){

				var timeError = [{
					name: 'Date/Time mismatch',
					message: 'The event start time cannot be after the end time'
				}]
				req.session.flashMsg = {
					err: timeError
				}
				res.redirect('/events/edit/' + req.param('id'));
			}

			var currentUser = req.session.User.userName;
			var thisEvent = req.param('id');

			var lng = parseFloat(req.param('locationLng'));
			var lat = parseFloat(req.param('locationLat'))

			var locationObj = { 
				"type": "Point", 
				"coordinates": [lng, lat]
			}

			var eventObj = {
				eventTitle: req.param('eventTitle'),
				eventTeam: req.param('eventTeam'),
				eventInfo: req.param('eventInfo'),
				spacesAvailable: req.param('spacesAvailable'),
				eventPrivacy: req.param('eventPrivacy'),
				startTime: req.param('startTime'),
				endTime: req.param('endTime'),
				location: locationObj
			}

			Event.update(thisEvent, eventObj)
			.exec(function updatedEvent(err, updated){
				
				res.redirect('/events/' + thisEvent);

			});
		}

		else {

			// Currently, this simply redirects home if the event couldn't be updated.

			res.redirect('/');

		}
	},

	edit: function(req, res, next) {

		/* Look up an event by ID, then pass its properties to the view, allowing the
		edit form to be pre-populated with the event's current values */
		Event.findOneById(req.param('id'))
		.populateAll()
		.exec(function(err, thisEvent) {
			if (!req.session.User.userName){
				res.redirect('/events/' + thisEvent.id);
			}
			if (err) return next(err);
			if (!thisEvent) return next();
			res.view({
				page_title: "Editing " + thisEvent.eventTitle,
				thisEvent: thisEvent
			});
		});

	},

	delete: function(req, res, next){

		var thisEvent = req.param('id'); // The ID of the event you'd like to delete
		var activeUser = req.session.User.id; // Your User ID

		Event.findOneById(thisEvent)
		.populateAll()
		.exec(function(err, eventToDelete) {
			if (err) {
				return res.serverError();
			}

			// Make sure that you're the Team Admin, or you won't be allowed to delete the team
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

	cancel: function(req, res, next){

		var thisEvent = req.param('id'); // The ID of the event you'd like to cancel attendance of
		var activeUser = req.session.User.id; // Your User ID

		if (req.session.User.userName){

			Event.findOneById(thisEvent) // find the Event using the ID
			.populateAll()
			.exec(function(err, eventToUpdate) {

				/* If you're the admin of the team, you can't leave an event. In the future,
				this would show an error or perhaps allow this under certain conditions */
				if (eventToUpdate.eventTeam.teamAdmin == activeUser){

					var adminError = [{
						name: 'Cannot cancel attendance',
						message: 'You cannot remove yourself from this event because you are the administrator'
					}]
					req.session.flashMsg = {
						err: adminError
					}
					res.redirect('/events/' + thisEvent);
				}
				else {

					eventToUpdate.attendees.remove(activeUser); // remove the User from the event attendees list
					eventToUpdate.save(function(err, user) {
						
						if (err){
							res.redirect('/events/' + thisEvent);
						}

						res.redirect('/events/' + thisEvent); // if it worked, redirect to the event's page

					});
				}
			});	
		}

		else {

			res.redirect('/');

		}
	},

	rsvp: function(req, res, next){

		var thisEvent = req.param('id');
		var activeUser = req.session.User.id;

		Event.findOneById(thisEvent)
		.populateAll()
		.exec(function(err, eventToUpdate) {

			eventToUpdate.attendees.add(activeUser); // Add yourself to the event attendees list
			eventToUpdate.save(function(err, user) {
					
				if (err){
					res.redirect('/events' + thisEvent);
				}

				res.redirect('/events/' + thisEvent);

			});
		});
	}
	
};

