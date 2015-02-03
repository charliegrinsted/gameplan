/**
 * HomeController
 *
 * @description :: Server-side logic for managing the dashboard areas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var moment = require('moment'); // include Moment.js for funky date formatting to compare with stored event times

module.exports = {

	index: function(req, res, next){

		if (req.session.authenticated){

			var currentUser = req.session.User.id; // get the active user ID
			var now = new Date(moment().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z'); // get the current time

			User.findOneById(currentUser) // query to return the details for the active user
			.populate('eventsAttending', {endTime: {'>=': now}}) // populate user object with only upcoming, not past, events.
			.populate('userTeams')
			.populate('friendRequestsReceived')
			.exec(function (err, user){

				if (err){
					return next(err);
				}
				res.view('dashboard/index', {
					user: user
				});
			});
			
		} 
		else {

			res.view('homepage');

		}

	}
};

