/**
* Event.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

attributes: {

	eventTitle:{
		type:'string'
	},

	eventTeam:{
		model:'team'
	},

	startTime:{
		type:'datetime'
	},

	endTime:{
		type:'datetime'
	},

	eventIsPublic:{
		type:'boolean'
	},

	attendees:{
		collection:'user',
		via:'eventsAttending'
	}
}

};

