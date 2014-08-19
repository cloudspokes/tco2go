// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('tco14app', ['ionic', 'tco14app.controllers', 'tco14app.constants'])

.run(function($ionicPlatform, $rootScope, AUTH_EVENTS, AuthService) {
    $ionicPlatform.ready(function() {
        if(window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });

    $rootScope.$on('$stateChangeStart', function(event, next) {
        // If the route needs authentication and user is not logged in
        if (next.data) {
            if (next.data.authenticatedRoute == true && !AuthService.isAuthenticated()) {
                // Stop the state change
                event.preventDefault();
                // Open the sign in modal
                $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }   
        }
    });

    $rootScope.getViewportWidth = function() {
        return Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    };
})

.config(function($stateProvider, $urlRouterProvider) {

    // Configure states (URLs)
    $stateProvider

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl'
    })

    .state('app.welcome', {
        url: '/welcome',
        views: {
            mainContent: {
                templateUrl: 'templates/welcome.html',
                controller: 'WelcomeCtrl'
            }
        }
    })

    .state('app.myprofile', {
        url: '/my-profile',
        views: {
            mainContent: {
                templateUrl: 'templates/my-profile.html',
                controller: 'MyProfileCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.myprofileInactive', {
        url: '/my-profile/:inactive',
        views: {
            mainContent: {
                templateUrl: 'templates/my-profile.html',
                controller: 'MyProfileCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.agenda', {
        url: '/agenda',
        views: {
            mainContent: {
                templateUrl: 'templates/agenda.html',
                controller: 'AgendaCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.attendees', {
        url: '/attendees',
        views: {
            mainContent: {
                templateUrl: 'templates/attendees.html',
                controller: 'AttendeesCtrl'
            }
        }
    })

    .state('app.multimedia', {
        url: '/multimedia',
        views: {
            mainContent: {
                templateUrl: 'templates/multimedia.html',
                controller: 'MultimediaCtrl'
            }
        }
    })

    .state('app.settings', {
        url: '/settings',
        views: {
            mainContent: {
                templateUrl: 'templates/settings.html',
                controller: 'SettingsCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.favorites', {
        url: '/favorites',
        views: {
            mainContent: {
                templateUrl: 'templates/favorites.html',
                controller: 'FavoritesCtrl'
            }
        }
    })

    .state('app.sponsors', {
        url: '/sponsors',
        views: {
            mainContent: {
                templateUrl: 'templates/sponsors.html',
                controller: 'SponsorsCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.messages', {
        url: '/messages',
        views: {
            mainContent: {
                templateUrl: 'templates/messages.html',
                controller: 'MessagesCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.messagesAutosuggest', {
        url: '/messages-auto-suggest',
        views: {
            mainContent: {
                templateUrl: 'templates/messages-auto-suggest.html',
                controller: 'MessagesAutoSuggestCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.messagesSelected', {
        url: '/messages-auto-suggest/:selected',
        views: {
            mainContent: {
                templateUrl: 'templates/messages-auto-suggest.html',
                controller: 'MessagesAutoSuggestCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.messagesChat', {
        url: '/messages-chat',
        views: {
            mainContent: {
                templateUrl: 'templates/messages-chat.html',
                controller: 'MessagesChatCtrl'
            }
        },
        data: {
            authenticatedRoute: true 
        }
    })

    .state('app.news', {
        url: '/news',
        views: {
            mainContent: {
                templateUrl: 'templates/news.html',
                controller: 'NewsCtrl'
            }
        }
    })
    
    ;

    $urlRouterProvider.otherwise('/app/welcome');
});

