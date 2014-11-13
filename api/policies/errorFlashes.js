module.exports = function(req, res, next) {

	res.locals.flashMsg = {};

	if(!req.session.flashMsg) return next();

	res.locals.flashMsg = _.clone(req.session.flashMsg);

	req.session.flashMsg = {};

	next();

};