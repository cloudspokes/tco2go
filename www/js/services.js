'use strict';

angular.module('tco14app.services', ['tco14app.constants'])

/**
  * Store user session service
  */
.service('Session', function () {
	this.create = function(userId, userHandle) {
		this.userId = userId;
		this.userHandle = userHandle;
	};
	this.destroy = function () {
		this.userId = null;
		this.userHandle = null;
	};
	return this;
})

/**
  * Global service for authentication service
  */
.factory('AuthService', function($http, Session, URL) {
	var authService = {};

	authService.login = function(credentials) {
		/* commented out since authorization not implemented
		var signinUrl = URL.tco + '/signin';
		return $http.post(signinUrl, {
			'email': credentials.email,
			'password': credentials.password
		})
		.then(function (res) {
			Session.create(res.user.id, res.user.handle);
			return res.user;
		});
		*/
		Session.create(24, 'sampleTCO');
		return {
			"id": 24,
	        "tco_id": "tco14",
	        "handle": "sampleTCO",
	        "name": "sampleUser",
	        "avatar": "http://community.topcoder.com/i/m/jeffdonthemic.jpeg",
	        "type": "Competitor",
	        "email": "sample@tcosapi.com",
	        "country": "United States"
		}
	};

	authService.logout = function () {
		Session.destroy();
	}

	// Returns true if user logged in, else false
	authService.isAuthenticated = function () {
		return !!Session.userId;
	};
	// Returns logged in user's Id
	authService.getId = function () {
		return Session.userId;
	};
	
	return authService;
})

;