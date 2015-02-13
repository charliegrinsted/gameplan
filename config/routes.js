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

	'/': 'HomeController.index',
	
	'/login': 'SessionController.new',

	'/register': 'UserController.new',

	'GET /test/socket': 'HomeController.test',

	'GET /users/:userName': 'UserController.show',

	'GET /users/:userName/add': 'UserController.sendFriendRequest',

	'GET /users/:userName/delete': 'UserController.delete',

	'GET /users/:userName/request/accept': 'UserController.acceptFriendRequest',

	'POST /search/users': 'UserController.search',

	'POST /search/teams': 'TeamController.search',

	'POST /search/events/nearby': 'EventController.nearby',

	'GET /teams/:id': 'TeamController.show',

	'GET /teams/manage/:id': 'TeamController.edit',

	'POST /teams/manage/:id/photo': 'TeamController.addTeamPhoto',

	'POST /teams/update/:id': 'TeamController.update',		

	'POST /events/update/:id': 'EventController.update',		

	'GET /events/:id': 'EventController.show',

	'GET /teams/:id/delete': 'TeamController.delete',

	'GET /teams/:id/join': 'TeamController.requestToJoinTeam',

	'GET /teams/:id/:user/accept': 'TeamController.acceptJoinRequest',

	'GET /teams/:id/leave': 'TeamController.leaveTeam',

	'GET /events/:id/rsvp': 'EventController.rsvp',

	'GET /events/:id/cancel': 'EventController.cancel',

	'GET /events/edit/:id': 'EventController.edit',

	'GET /events/:id/delete': 'EventController.delete',

	'GET /notifications/:id/read': 'NotificationController.read',

	'/settings': 'UserController.edit',

	'/logout': 'SessionController.destroy',

	'/create/team': 'TeamController.new',

	'/create/notification': 'NotificationController.new',

	'/create/event': 'EventController.new',

	'/create/user': 'UserController.create',

	'POST /settings/addPhoto': 'UserController.addProfilePhoto',

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
