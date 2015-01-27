/**
* Team.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

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

