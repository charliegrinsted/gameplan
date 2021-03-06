/**
 * NotificationController
 *
 * @description :: Server-side logic for managing notifications
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var utility = require('../services/utility');

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
				page_title: "Your notifications",
				notifications: notifications
			});
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

