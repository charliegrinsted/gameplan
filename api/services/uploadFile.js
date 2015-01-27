module.exports = {
	
	createNotification: function(title, userID, content){

		var notificationObject = {
			notifiedUser: req.session.User.id,
			title: req.param('title'),
			content: req.param('content'),
			read: false
		}

		Notification.create(notificationObject)
			.exec(function NotificationCreated(err, notification){

				// Error
				if (err) return next(err);

				notification.save(function(err) {
						
					if (err) return next(err);

					res.redirect('/notifications');

				});

			});

	}
}