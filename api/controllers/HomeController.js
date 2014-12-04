/**
 * HomeController
 *
 * @description :: Server-side logic for managing the dashboard areas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	index: function(req, res, next){

		if (req.session.authenticated){

			console.log("we tried");

			var currentUser = req.session.User.id;

			User.findOneById(currentUser)
			.populateAll()
			.exec(function (err, user){
				if (err){
					return next(err);
				}
				console.log(user);
				res.view('dashboard/index', {
					user: user
				});
			});
			
		} 
		else {

			res.view('homepage');

		}
		/*
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
				user: user
			});
		}))*/
	}
};

