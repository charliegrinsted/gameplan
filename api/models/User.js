/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {

  	firstName:{type:'string'},
	lastName:{type:'string'},
  	email:{type:'string', required:true, unique:true},
  	encryptedPass:{type:'string'},

    teamsAdministered: {
      collection: 'team', via: 'teamAdmin'
    },

  	toJSON: function(){

  		var obj = this.toObject();
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

