/* This file contains a few functions which are used in multiple API controllers. In the spirit of efficient programming,
these functions are defined here and imported into the relevant controllers, rather than being repeated. */

var fileAdapter = require('skipper-gridfs')({uri: 'mongodb://localhost/gameplan.fs' }); // create an instance of the adapter that handles file uploads/downloads from the MongoDB GridFS

module.exports = {

	/* This function is used to create a single notifications for a specified user. 
	The other parameters are the HTML content of the notification message, and the URL
	to which the user is taken when the notification is clicked on */
	createNotification: function(title, userID, content, url){

		// Create an object containing all of the Notification parameters (see ./models/Notification.js)
		var notificationObject = {
			notifiedUser: userID,
			title: title,
			url: url,
			content: content,
			read: false
		}

		// Create a new notification object in the MongoDB database
		Notification.create(notificationObject)
		.exec(function NotificationCreated(err, notification){

			// Return an error if it fails
			if (err) return next(err);

			/* Callback function. 
			Since the creation notification is always secondary to a primary
			action, such as creating or updating an event, there is never
			a required response from the server */
			notification.save(function(err) {
					
				if (err) return next(err);

			});

		});

	},

	/* This function is used to upload a file to the MongoDB GridFS. It uses the adapter instance
	defined at the top of this file. It takes an input field name as a parameter, along with a 
	callback function. This callback function is called once the file has successfully uploaded, 
	alleviating the issue of the subsequent code running prior to the upload completion */
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

	/* This works in a similar way to above, but the other way around, reading a file instead of writing.
	If the file is read successfully, a base64 encoded string is returned, containing the image data. This
	can then be passed to the relevant view to display the image using a data URI. */
	readFile: function(parent, fileToGet, cb){

		fileAdapter.readLastVersion(fileToGet, function (err, file){
			if (!file){
				var error = null;
				cb(parent, error);
			}
			else {
				var encoded = file.toString('base64');
				cb(parent, encoded);
			}
		});

	}

}