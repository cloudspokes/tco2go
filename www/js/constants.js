'use strict';

angular.module('tco14app.constants', [])

/**
 * Global constants
 */
.constant('AUTH_EVENTS', {
	// Broadcast when user logs in successfully
	loginSuccess: 'auth-login-success',
	// Broadcast when user login fails
	loginFailed: 'auth-login-failed',
	// Broadcast when an authenticatedRoute is navigated to, and the user is not logged in - opens the signInModal
	notAuthenticated: 'auth-not-authenticated'
})

.constant('URL', {
	// my-profile API routes
	myProfile: 'http://tcoapi.apiary-mock.com/my-profile',
	// tcos/tco14 API routes
	tco: 'http://tcoapi.apiary-mock.com/tcos/tco14'
})
;