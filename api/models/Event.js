/**
* Event.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

	types: {

		point: function(latlng){
			return latlng.x && latlng.y
		},

	},	

	attributes: {

		eventTitle:{
			type:'string'
		},

		eventTeam:{
			model:'team'
		},

		eventType:{
			type:'string'
		},

		startTime:{
			type:'datetime'
		},

		endTime:{
			type:'datetime'
		},

		attendees:{
			collection:'user',
			via:'eventsAttending'
		},

		spacesAvailable:{
			type:'integer'
		},

		location: {
			type: 'json',
			point: true
		},
	}

};

