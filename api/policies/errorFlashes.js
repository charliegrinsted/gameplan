/* This file takes the flash messages stored in the user's session, if any, and 
passes them to the view. It then empties the session object, ensuring that the
message isn't displayed again on the next viewed page */

module.exports = function(req, res, next) {

	res.locals.flashMsg = {};

	if(!req.session.flashMsg) return next();

	res.locals.flashMsg = _.clone(req.session.flashMsg);

	req.session.flashMsg = {};

	next();

};