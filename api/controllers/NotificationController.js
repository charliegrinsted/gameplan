/**
 * NotificationController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	index: function(req, res, next){

		Notification.find()
		.where({ read: false, notifiedUser: req.session.User.id })
		.populateAll()
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

		var notObj = {
			notifiedUser: req.session.User.id,
			title: req.param('title'),
			content: req.param('content'),
			read: false
		}

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

	new: function(req, res){

		res.view({
			
		});

	},

	read: function(req, res){

		Notification.findOneById(req.param('id'))
		.populateAll()
		.exec(function(err, notification) {
			notification.read = true;
			if (err) return next(err);
			if (!notification) return next();
			notification.save(function(err) {
				if (err) return next(err);
				res.redirect('/notifications');
			});
		});

	}
	
};

