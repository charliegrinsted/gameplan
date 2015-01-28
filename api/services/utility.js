var fileAdapter = require('skipper-gridfs')({uri: 'mongodb://localhost/gameplan.fs' });
module.exports = {
	

	createNotification: function(title, userID, content){

		var notificationObject = {
			notifiedUser: userID,
			title: title,
			content: content,
			read: false
		}

		Notification.create(notificationObject)
		.exec(function NotificationCreated(err, notification){

			// Error
			if (err) return next(err);

			notification.save(function(err) {
					
				if (err) return next(err);

			});

		});

	},

	uploadFile: function(req, fieldName, cb){

		var returnedFile = null;

		req.file(fieldName)
		.upload(fileAdapter.receive(), function complete(err, uploaded) {
			if (err){ 
				return res.negotiate(err);
			}
			else {
				returnedFile = uploaded[0].fd;
				cb(returnedFile);
			}
		});
	},

}