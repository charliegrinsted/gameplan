/* This model defines all of the attributes for Teams, including relationships to Users and Events */

module.exports = {

  attributes: {

	teamName:{
		type:'string'
	},

	teamSport:{
		type:'string'
	},

	teamAdmin: {
		model:'user'
	},

	teamEvents: {
		collection:'event',
		via:'eventTeam'
	},

	teamMembers:{
		collection:'user',
		via:'userTeams'
	},

	joinRequestsReceived:{
		collection:'user',
		via:'joinRequestsSent'
	},

	teamInfo:{
		type:'text'
	},

	teamPhoto:{
		type:'string'
	}

  },

};

