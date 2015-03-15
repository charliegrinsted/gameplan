/* This model defines all of the attributes for Events, including relationships and a JSON object for storing a location point */

module.exports = {	

	attributes: {

		eventTitle:{
			type:'string'
		},

		eventTeam:{
			model:'team'
		},

		eventInfo:{
			type:'text'
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

		eventPrivacy:{
			type:'string'
		},

		location: {
			type: 'json',
		},
	}

};

