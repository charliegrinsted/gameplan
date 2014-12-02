/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

	/***************************************************************************
	*                                                                          *
	* Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
	* etc. depending on your default view engine) your home page.              *
	*                                                                          *
	* (Alternatively, remove this and add an `index.html` file in your         *
	* `assets` directory)                                                      *
	*                                                                          *
	***************************************************************************/

	// Here, I'm manually dictating some routes instead of relying on the Blueprints.

	'/': {
		view: 'homepage'
	},
	
	'/login': 'SessionController.new',

	'/signup': 'UserController.new',

	'GET /users/:userName': 'UserController.show',

	'GET /users/:userName/add': 'UserController.sendFriendRequest',

	'GET /users/:userName/delete': 'UserController.delete',

	'GET /users/:userName/request/accept': 'UserController.acceptFriendRequest',

	'GET /teams/:id': 'TeamController.show',

	'GET /teams/manage/:id': 'TeamController.edit',

	'POST /teams/update/:id': 'TeamController.update',		

	'GET /events/:id': 'EventController.show',

	'GET /teams/:id/delete': 'TeamController.delete',

	'GET /teams/:id/joinTeam': 'TeamController.joinTeam',

	'GET /events/:id/rsvp': 'EventController.rsvp',

	'/settings': 'UserController.edit',

	'/logout': 'SessionController.destroy',

	'/create/team': 'TeamController.new',

	'/create/event': 'EventController.new',

	'/create/user': 'UserController.create',

	// 'POST /settings/addPhoto': 'UserController.addProfilePhoto',

	// Routes for use with API

	'/api/users': 'UserController.indexJSON',

	'GET /api/users/:userName': 'UserController.showJSON',

	'/api/teams': 'TeamController.indexJSON',

	'GET /api/teams/:id': 'TeamController.showJSON',	

	'POST /api/session/create': 'SessionController.createAPIsession'	

	/***************************************************************************
	*                                                                          *
	* Custom routes here...                                                    *
	*                                                                          *
	*  If a request to a URL doesn't match any of the custom routes above, it  *
	* is matched against Sails route blueprints. See `config/blueprints.js`    *
	* for configuration options and examples.                                  *
	*                                                                          *
	***************************************************************************/

};
