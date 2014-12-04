/**
 * HomeController
 *
 * @description :: Server-side logic for managing the dashboard areas
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

	index: function(req, res, next){

		if (req.session.authenticated){

			console.log("we tried");

			var currentUser = req.session.User.id;

			User.findOneById(currentUser)
			.populateAll()
			.exec(function (err, user){

				if (err){
					return next(err);
				}
				res.view('dashboard/index', {
					user: user
				});
			});
			
		} 
		else {

			res.view('homepage');

		}

	}
};

