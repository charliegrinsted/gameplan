/* This model defines all of the attributes for Users, including relationships to Teams, Events and Notifications */

module.exports = {

	attributes: {

		firstName:{
			type:'string'
		},

		lastName:{
			type:'string'
		},

		userName:{
			type:'string',
			unique:true
		},

		email:{
			type:'string', 
			required:true, 
			unique:true // this doesn't seem to work with Waterline & MongoDB currently
		},

		profilePhoto:{
			type:'string'
		},

		encryptedPass:{
			type:'string'
		},

		publicView:{
			type:'boolean'
		},

		bio:{
			type:'text'
		},

		userNotifications: {
			collection:'notification', 
			via:'notifiedUser'
		},

		teamsAdministered: {
			collection:'team', 
			via:'teamAdmin'
		},

		friends:{
			collection:'user',
			via:'friendOf',
			dominant:true
		},
		
		friendOf:{
			collection:'user',
			via:'friends'
		},

		friendRequestsSent:{
			collection:'user',
			via:'friendRequestsReceived',
			dominant:true
		},

		friendRequestsReceived:{
			collection:'user',
			via:'friendRequestsSent'
		},

		joinRequestsSent:{
			collection:'team',
			via:'joinRequestsReceived',
			dominant:true
		},

		eventsAttending:{
			collection:'event',
			via:'attendees',
			dominant:true
		},

		userTeams:{
			collection:'team',
			via:'teamMembers',
			dominant:true
		},

		toJSON: function(){

			var obj = this.toObject();
			delete obj.email;
			delete obj.password;
			delete obj.passwordConfirmation;
			delete obj.encryptedPass;
			delete obj._csrf;
			return obj;

		}

	},

	beforeCreate: function(obj, next){

		// Do the two passwords match?
		if (!obj.password || obj.password != obj.passwordConfirmation ){
			return next({ err: ["Passwords don't match"]});
		}

		require('bcrypt').hash(obj.password, 10, function runEncryption(err, encryptedResult){

			// Return the error if it failed
			if (err){
				return next(err);
			}
			obj.encryptedPass = encryptedResult;
			next();

		} );
	}

};

