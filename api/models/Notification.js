/* This model defines all of the attributes for a Notification */

module.exports = {

  attributes: {

	title:{
		type:'string'
	},

	notifiedUser:{
		model:'user'
	},

	content:{
		type:'text'
	},

	url:{
		type:'text'
	},

	read:{
		type:'boolean'
	}

  }
};

