/**
 * EventController
 *
 * @description :: Server-side logic for managing events
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	'new': function(req, res){

		res.view();

	},

	index: function(req, res, next){

		Event.find() // find all teams and create an array
		//.populate('teamsAdministered') // fetch the related values from the User model
		.exec(function (err, events){
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
			eventTitle: req.param('eventTitle')
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

