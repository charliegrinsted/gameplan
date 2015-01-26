/**
 * NotificationController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	index: function(req, res, next){

		Notification.find() // find all teams and create an array
		.populateAll() // fetch the related values from the User model
		.exec(function (err, notifications){
			if (err){
				return next(err);
			}
			res.view({
				notifications: notifications
			});
		});
	},

	create: function(req, res, next){

		// Create an object from the parameters passed in by the form.
		var notObj = {
			notifiedUser: req.session.User.id,
			title: req.param('title'),
			content: req.param('content')
		}

		// Add a new database entry using the created object values
		Notification.create(notObj)
		.exec(function NotificationCreated(err, notification){

			// Error
			if (err) return next(err);

			notification.save(function(err) {
					
				if (err) return next(err);

				res.redirect('/notifications');

			});

		});
	},

	'new': function(req, res){

		res.view({
			
		});
		
	}
	
};

