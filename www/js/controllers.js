'use strict';

angular.module('tco14app.controllers', ['tco14app.constants', 'tco14app.services'])

/**
 * Global controller
 */
.controller('AppCtrl', function($scope, $rootScope, $http, $state, $ionicSideMenuDelegate, $ionicScrollDelegate, $ionicModal, AuthService, AUTH_EVENTS, URL) {
    // Stores the currently logged in user
    $scope.currentUser = null;
    // Profile Information
    $scope.signIn = {
        email: '',
        password: ''
    };
    $scope.credentials = {};

    $scope.$state = $state;

    /* Save the currently logged in user */
    $scope.setCurrentUser = function (user) {
        $scope.currentUser = user;
    };

    /* Blur the main content method */
    $scope.blurMainContent = function () {
        // Since the modal take some time to appear, dealy the blur too
        setTimeout(function() {
            document.getElementById('main-content-wrapper').className = 'blurred';
        }, 140);
    };

    /* Dis-Blur the main content method */
    $scope.disblurMainContent = function () {
        document.getElementById('main-content-wrapper').className = '';
    };

    /* Method for toggling the main menu */
    $scope.toggleMainMenu = function () {
        $ionicSideMenuDelegate.toggleLeft();
    };
    
    /* Initialize signInModal */
    $ionicModal.fromTemplateUrl('templates/sign-in-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.signInModal = $ionicModal;
    });
    /* Display the signInModal method */
    $scope.showSignInModal = function () {
        if ($scope.signInModal) {
            // Show modal
            $scope.signInModal.show();
            $scope.blurMainContent();
            $scope.resetModalScroll();
        }
    };
    /* Close signInModal method */
    $scope.hideSignInModal = function () {
        $scope.signInModal.hide();
        $scope.disblurMainContent();
    };
    /* Successfully signed in */
    $scope.signInSuccessful = function () {
        $scope.hideSignInModal();
        //unread-messages-count API not working right now
        if (AuthService.isAuthenticated() && false) {
            var msgUrl = URL.tco + '/' + AuthService.getId() + '/unread-messages-count';
            $http.get(msgUrl)
            .success(function (data) {
                $scope.newMessages = data.count;
            });
        }   
        window.location.href = '#/app/my-profile';
    };
    /* Could not sign in - close the modal and navigate away */
    $scope.cancelSignInModal = function () {
        $scope.hideSignInModal();
        window.location.href = '#/app/welcome';
    };
    /* On logout button press, sign out the current user and navigate away */
    $scope.signOut = function () {
        AuthService.logout();
        window.location.href = '#/app/welcome';
    }
    /* Process the signin using AuthService */
    $scope.processSignInModal = function() {
        if ($scope.signInModal) {
            // Sync data
            var fields = ['email', 'password'];
            for (var i = 0; i < fields.length; ++i) {
                var field = fields[i];
                $scope.credentials[field] = $scope.signIn[field];
            }
            var user = AuthService.login($scope.credentials);
            if (AuthService.isAuthenticated()) {
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                $scope.setCurrentUser(user);
            }
        }
    }

    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        $ionicScrollDelegate.scrollTop();
    };

    /* Method for revealing the header after showing a modal */
    $scope.revealHeaderFromModal = function () {
        setTimeout(function() {
            var backdrops = document.getElementsByClassName('modal-backdrop');
            // Always check the top modal first
            for (var i = backdrops.length - 1; i >= 0; i -= 1) {
                var backdrop = backdrops[i];
                if (backdrop.className.indexOf("hide") === -1) {
                    var modal = backdrop.getElementsByClassName('modal')[0];
                    // This commented line will reveal the header area, just in case u need it
                    //backdrop.setAttribute('style', 'top: 64px; bottom: 0; height: auto;');
                    modal.setAttribute('style', 'top: 64px; bottom: 0; height: auto; position: absolute; min-height: 0;');
                    break;
                }
            }
        }, 10);
    };

    // Register the recievers for AUTH_EVENTS
    // So the sign in modal is opened whenever a authenticated route is opened without logging in
    $rootScope.$on(AUTH_EVENTS.notAuthenticated, $scope.showSignInModal);
    $rootScope.$on(AUTH_EVENTS.loginSuccess, $scope.signInSuccessful);

    // Messy hack - remove the duplicate event listener 
    $rootScope.$$listeners[AUTH_EVENTS.notAuthenticated].splice(1,1);
})

/**
 * Welcome Page Controller 
 */
.controller('WelcomeCtrl', function($http, $scope, $ionicSideMenuDelegate, $ionicModal, $ionicScrollDelegate, URL) {
    $scope.newProfile = {
        username: '',
        password: '',
        email: '',
        handle: ''
    };

    $scope.signIn = function () {
        window.location.href = '#/app/my-profile';
    };    

    /* Initialize newProfileModal */
    $ionicModal.fromTemplateUrl('templates/sign-up-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.newProfileModal = $ionicModal;
    });
    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        // Save/Restore main scroll
        $ionicScrollDelegate.scrollTop();
    };
    /* Show newProfileModal method */
    $scope.showNewProfileModal = function () {
        if ($scope.newProfileModal) {
            // Show modal
            $scope.newProfileModal.show();
            $scope.blurMainContent();
            $scope.resetModalScroll();
        }
    };
    /* Clear form field methods */
    $scope.clearName = function () {
        $scope.newProfile.username = '';
    };
    $scope.clearEmail = function () {
        $scope.newProfile.email = '';
    };
    $scope.clearPassword = function () {
        $scope.newProfile.email = '';
    };
    $scope.clearHandle = function () {
        $scope.newProfile.handle = '';
    };
    /* Save the new profile method */
    $scope.saveNewProfile = function () {
        var url = URL.tco + '/signup';
        $http.post(url, $scope.newProfile)
        .success(function(data) {
            $scope.hideNewProfileModal();
        });
    };
    /* Close the newProfileModal method */
    $scope.hideNewProfileModal = function () {
        $scope.newProfileModal.hide();
        $scope.disblurMainContent();
    };
    /* Open the newProfileModal on sign up button press method */
    $scope.signUp = function () {
        $scope.showNewProfileModal();
    };

    /* Clean up modal when state change */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.newProfileModal) {
            $scope.newProfileModal.remove();
        }
    });
})

/**
 * My Profile Page Conroller 
 */
.controller('MyProfileCtrl', function ($scope, $stateParams, $http, $ionicModal, $ionicScrollDelegate, AuthService, URL) {
    $scope.profile = {};
    /* Variables binded to Edit profile modals
     * NOTE: DO NOT USE statements like ng-model="editedName", use ng-model="editedProfile.editedName"
     * Because we need bind variables in a modal and the modal's scope is a sub-scope. Otherwise
     * variables in this scope won't be correctly updated.
     */
     // Can also retrieve id from $scope.currentUser
    var userId = AuthService.getId();
    $scope.editedProfile = {
        id: userId,
        name: '',
        county: '',
        email: '',
        role: '',
        quote: ''
    };
    // Get profile data
    $http.get(URL.myProfile)
    .success(function (data) {
        $scope.profile = data;
        /* Format date */
        var date = new Date(data.member_since);
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        // Padding zero
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        $scope.profile.member_since = month + '/' + day + '/' + year;
    });

    /* Initialize editProfileModal method */
    $ionicModal.fromTemplateUrl('templates/edit-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.editProfileModal = $ionicModal;
    });
    /* Initialize current registered modal */
    $ionicModal.fromTemplateUrl('templates/currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.currentlyRegisteredModal = $ionicModal;
    });
    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        // Save/Restore main scroll, and reset all other scrolls
        var position = $ionicScrollDelegate.$getByHandle('main-scroll').getScrollPosition();
        $ionicScrollDelegate.scrollTop();
        $ionicScrollDelegate.$getByHandle('main-scroll').scrollTo(position.left, position.top);
    };
    /* Show editProfileModal method */
    $scope.showEditProfileModal = function () {
        if ($scope.editProfileModal) {
            // Sync data
            var fields = ['name', 'country', 'email', 'role', 'quote', 'twitterInactive', 'googleplusInactive',
                          'facebookInactive', 'linkedinInactive', 'githubInactive'];
            for (var i = 0; i < fields.length; ++i) {
                var field = fields[i];
                $scope.editedProfile[field] = $scope.profile[field];
            }
            // Show modal
            $scope.editProfileModal.show();
            $scope.blurMainContent();
            $scope.resetModalScroll();
        }
    };
    /* Close editProfileModal method */
    $scope.hideEditProfileModal = function () {
        $scope.editProfileModal.hide();
        $scope.disblurMainContent();
    };
    /* Save the edited profile method */
    $scope.saveEditedProfile = function () {
        var fields = ['name', 'county', 'email', 'role', 'quote', 'twitterInactive', 'googleplusInactive',
                      'facebookInactive', 'linkedinInactive', 'githubInactive'];
        for (var i = 0; i < fields.length; ++i) {
            var field = fields[i];
            $scope.profile[field] = $scope.editedProfile[field];
        }
        $http.put(URL.myProfile, $scope.profile)
        .success(function(data) {
            $scope.editProfileModal.hide();
            $scope.disblurMainContent();
        });
    };
    /* Show currentlyRegisteredModal method */
    $scope.showCurrentlyRegisteredModal = function () {
        if ($scope.currentlyRegisteredModal) {
            var challengeUrl = URL.myProfile + '/current-challenges';
            $http.get(challengeUrl)
            .success(function (data) {
                $scope.profile.currentlyRegistered = data;
                $scope.currentlyRegisteredModal.show();
                $scope.revealHeaderFromModal();
                $scope.resetModalScroll();  
            })
        }
    };
    /* Clear form field methods */
    $scope.clearName = function () {
        $scope.editedProfile.name = '';
    };
    $scope.clearEmail = function () {
        $scope.editedProfile.email = '';
    };
    $scope.clearCounty = function () {
        $scope.editedProfile.county = '';
    };
    $scope.clearQuote = function () {
        $scope.editedProfile.quote = '';
    };
    /* Clean up modal when state change */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.currentlyRegisteredModal) {
            $scope.currentlyRegisteredModal.remove();
        }
        if ($scope.editProfileModal) {
            $scope.editProfileModal.remove();
        }
    });
})

/* 
 * Agenda Page Controller
 */
.controller('AgendaCtrl', function($scope, $http, $interval, $timeout, $state, $ionicModal, $ionicScrollDelegate, AuthService, URL) {
    /* Filter flags */
    $scope.showFood = true;
    $scope.showContest = true;
    $scope.showPresentation = true;
    /* Current day */
    $scope.day = new Date();
    $scope.isToday = true;
    /* Agenda data */
    $scope.agenda = [];
    $scope.event = {};
    /* Load agenda method */
    $scope.loadAgenda = function () {
        var url = URL.tco + '/events?date=' + $scope.formattedDate;
        $http.get(url)
        .success(function(data) {
            $scope.agenda = data;
        });
    };
    /* Agenda filter */
    $scope.filterByType = function (item) {
        return item.type === 'food' && $scope.showFood ||
            item.type === 'presentation' && $scope.showPresentation ||
            item.type === 'Competition' && $scope.showContest;
    };
    /* Date formatting method */
    $scope.formatDate = function (date) {
        /* Format date */
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var year = date.getFullYear();
        // Padding zero
        if (month < 10) {
            month = '0' + month;
        }
        if (day < 10) {
            day = '0' + day;
        }
        return year + '-' + month + '-' + day;
    };
    /* Go prev/next day methods */
    $scope.goPrevDay = function () {
        $scope.day.setDate($scope.day.getDate() - 1);
        $scope.formattedDate = $scope.formatDate($scope.day);
        $scope.isToday = $scope.day.toDateString() === (new Date()).toDateString();
        $scope.loadAgenda();
    };
    $scope.goNextDay = function () {
        $scope.day.setDate($scope.day.getDate() + 1);
        $scope.formattedDate = $scope.formatDate($scope.day);
        $scope.isToday = $scope.day.toDateString() === (new Date()).toDateString();
        $scope.loadAgenda();
    };
    /* Toggle filter flags methods */
    $scope.toggleFilterFood = function toggleFilterFood() {
        $scope.showFood = !$scope.showFood;
    };
    $scope.toggleFilterContest = function toggleFilterContest() {
        $scope.showContest = !$scope.showContest;
    };
    $scope.toggleFilterPresentation = function toggleFilterPresentation() {
        $scope.showPresentation = !$scope.showPresentation;
    };
    /* Initialize Agenda details modal */
    $ionicModal.fromTemplateUrl('templates/agenda-details-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.eventDetailsModal = $ionicModal;
    });
    /* Initialize Alert modal method */
    $ionicModal.fromTemplateUrl('templates/alert-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.alertModal = $ionicModal;
    });
    /* Initialize attendeeProfileModal method */
    $ionicModal.fromTemplateUrl('templates/attendee-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.attendeeProfileModal = $ionicModal;
    });
    /* Initialize attendeeCurrentlyRegisteredModal method */
    $ionicModal.fromTemplateUrl('templates/attendee-currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.attendeeCurrentlyRegisteredModal = $ionicModal;
    });
    /* Method for opening the attendeeProfileModal method */
    $scope.showAttendeeProfileModal = function (selectedAttendee) {
        if ($scope.attendeeProfileModal) {
            var url = URL.tco + '/attendees/' + selectedAttendee.id;
            $http.get(url)
            .success(function(data) {
                $scope.attendeeProfile = data;
                $scope.attendeeProfileModal.show();
            });
        }
    };
    /* Method for chatting with attendee */
    $scope.chatWithAttendee = function (attendee) {
        $scope.attendeeProfileModal.hide();
        window.location.href = '#/app/messages-auto-suggest/' + $scope.attendeeProfile.handle;
    };
    /* Method for liking an attendee */
    $scope.likeAttendee = function (attendeeId) {   
        var url = URL.tco + '/attendees/' + attendeeId + '/like';
        $http.post(url, {
            "liked": true
        });
    };
    /* Method for opening the "Currently Registered" modal */
    $scope.showAttendeeCurrentlyRegisteredModal = function (userId) {
        if ($scope.attendeeCurrentlyRegisteredModal) {
            var challengeUrl = URL.tco + '/attendees/' + userId + '/current-challenges';
            $http.get(challengeUrl)
            .success(function (data) {
                $scope.attendeeCurrentlyRegistered = data;
                $scope.attendeeCurrentlyRegisteredModal.show();
            })
        }
    };
    /* Show details modal method */
    $scope.showEventDetailsModal = function (agendaEvent) {
        if ($scope.eventDetailsModal) {
            $scope.eventDetailsModal.show();
            $scope.revealHeaderFromModal();
            // Fold 2 expandable panels in the modal
            $scope.eventExpanded = false;
            $scope.competitorsExpanded = false;
            
            // Get event details
            var eventUrl = URL.tco + '/events/' + agendaEvent.id.toString();
            $http.get(eventUrl).success(function(data) {
                $scope.event = data;
            });

            // Get event competitor details
            var eventCompUrl = URL.tco + '/events/' + agendaEvent.id.toString() + '/attendees';
            $http.get(eventCompUrl).success(function(data) {
                $scope.event.theCompetitors = data;
                    
                // reset modal scroll
                $timeout(function () {
                    var position = $ionicScrollDelegate.$getByHandle('agenda-list').getScrollPosition();
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.scrollTop(false);
                    $ionicScrollDelegate.$getByHandle('agenda-list').scrollTo(position.left, position.top);
                }, 100);
            });
        }
    };
    /* Show alert modal method */
    $scope.showAlert = function (event) {
        if ($scope.alertModal) {
            var notifUrl = URL.myProfile + '/event-notifications';
            $http.get(notifUrl)
            .success(function (data) {
                $scope.alerts = data;
            });
            $scope.alertModal.show();
            $scope.blurMainContent();
        }
    };
    /* Toggle expand Event Description/The Competitiors section */
    $scope.toggleEventExpanded = function () {
        $scope.eventExpanded = !$scope.eventExpanded;
        // Content height changes, need resize scroll
        $ionicScrollDelegate.resize();
    };
    $scope.toggleCompetitorsExpanded = function () {
        $scope.competitorsExpanded = !$scope.competitorsExpanded;
        // Content height changes, need resize scroll
        $ionicScrollDelegate.resize();
    };
    /* Update countdown */
    $interval(function () {
        // TODO: Out of scope
        $scope.countdown = "5 hr 2 min";
    }, 1000);

    /* Load Agenda Data */
    $scope.loadAgenda();

    /* Load Alerts Data */
    var alertUrl = URL.myProfile + '/event-notifications/count';
    $http.get(alertUrl).success(function (data) {
        $scope.alertsLength = data.count;
    });

    /* Clean up modal when state change */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.alertModal) {
            $scope.alertModal.remove();
        }
        if ($scope.eventDetailsModal) {
            $scope.eventDetailsModal.remove();
        }
        if ($scope.attendeeCurrentlyRegisteredModal) {
            $scope.attendeeCurrentlyRegisteredModal.remove();
        }
        if ($scope.attendeeProfileModal) {
            $scope.attendeeProfileModal.remove();
        }
    });
})

/**
 * Attendees page controller
 */
.controller('AttendeesCtrl', function($scope, $http, $state, $ionicModal, $ionicScrollDelegate, URL) {
    // Attendees list
    $scope.attendees = [];
    // Individual attendee
    $scope.attendeeProfile = [];
    // Current active group (current active tab)
    $scope.currentGroup = 'Competitor';
    // Search keyword. Have to wrap an object, since modal scope is a sub-scope.
    $scope.searchOptions = {
        keyword: ''
    };

    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        // Save/Restore main scroll, and reset all other scrolls
        var position = $ionicScrollDelegate.$getByHandle('attendee-list-scroll').getScrollPosition();
        $ionicScrollDelegate.scrollTop();
        $ionicScrollDelegate.$getByHandle('attendee-list-scroll').scrollTo(position.left, position.top);
    };

    /* Set current group method */
    $scope.setCurrentGroup = function (group) {
        $scope.currentGroup = group;
        $ionicScrollDelegate.scrollTop();
    };

    /* Open/Close search modal method */
    $scope.openSearchModal = function () {
        $scope.searchOptions.keyword = '';
        $scope.searchAttendeesModal.show();
        $scope.blurMainContent();
        $scope.resetModalScroll();
    };
    $scope.hideSearchModal = function () {
        $scope.searchAttendeesModal.hide();
        $scope.disblurMainContent();
    };

    /* Clear search method */
    $scope.clearSearch = function () {
        $scope.searchOptions.keyword = '';
    };

    /* Filter attendee by group */
    $scope.filterByGroup = function (item) {
        return item.type === $scope.currentGroup;
    };

    /* Search attendee by keyword */
    $scope.filterByKeyword = function (item) {
        var keyword = $scope.searchOptions.keyword;
        return item.handle && item.handle.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
            item.country && item.country.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
            item.track && item.track.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    };

    /* Initialize Search Modal */
    $ionicModal.fromTemplateUrl('templates/search-attendees-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }, {
        focusFirstInput: false
    }).then(function ($ionicModal) {
        $scope.searchAttendeesModal = $ionicModal;
    });
    /* Initialize attendeeProfileModal method */
    $ionicModal.fromTemplateUrl('templates/attendee-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.attendeeProfileModal = $ionicModal;
    });
    /* Initialize attendeeCurrentlyRegisteredModal method */
    $ionicModal.fromTemplateUrl('templates/attendee-currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.attendeeCurrentlyRegisteredModal = $ionicModal;
    });
    /* Method for opening the attendee profile modal */
    $scope.showAttendeeProfileModal = function (userId) {
        if ($scope.attendeeProfileModal) {
            // Load attendee profile
            var attendeeUrl = URL.tco + '/attendees/' + userId;
            $http.get(attendeeUrl)
            .success(function(data) {
                $scope.attendeeProfile = data;
                $scope.attendeeProfileModal.show();
                $scope.resetModalScroll();
                // Bring the modal to the top, by appending to the last of <body>
                var modal = document.getElementsByClassName('attendee-profile-modal')[0].parentNode.parentNode;
                document.getElementsByTagName('body')[0].appendChild(modal);
            });
        }
    };
    /* Method for chatting with attendee */
    $scope.chatWithAttendee = function (attendee) {
        $scope.searchAttendeesModal.hide();
        $scope.attendeeProfileModal.hide();
        $scope.disblurMainContent();
        window.location.href = '#/app/messages-auto-suggest/' + $scope.attendeeProfile.handle;
    };
    /* Method for liking an attendee */
    $scope.likeAttendee = function (attendeeId) {   
        var url = URL.tco + '/attendees/' + attendeeId + '/like';
        $http.post(url, {
            "liked": true
        });
    };
    /* Method for opening the "Currently Registered" modal */
    $scope.showAttendeeCurrentlyRegisteredModal = function (userId) {
        if ($scope.attendeeCurrentlyRegisteredModal) {
            var challengeUrl = URL.tco + '/attendees/' + userId + '/current-challenges';
            $http.get(challengeUrl)
            .success(function (data) {
                $scope.attendeeCurrentlyRegistered = data;
                $scope.attendeeCurrentlyRegisteredModal.show();
            })
        }
    };

    // Load attendees
    var loadUrl = URL.tco + '/attendees';
    $http.get(loadUrl).success(function (data) {
        $scope.attendees = data;
    });

    /* Clean up modal when state changes */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.searchAttendeesModal) {
            $scope.searchAttendeesModal.remove();
        }
        if ($scope.attendeeCurrentlyRegisteredModal) {
            $scope.attendeeCurrentlyRegisteredModal.remove();
        }
        if ($scope.attendeeProfileModal) {
            $scope.attendeeProfileModal.remove();
        }
        $scope.disblurMainContent();
    });
})

/**
 * Multimedia Page Controller
 */
.controller('MultimediaCtrl', function ($scope, $http, $ionicScrollDelegate, $ionicActionSheet, $ionicModal, URL) {
    $scope.medias = [];
    $scope.currentTab = 'photo';

    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        // Save/Restore main scroll, and reset all other scrolls
        var position = $ionicScrollDelegate.$getByHandle('main-scroll').getScrollPosition();
        $ionicScrollDelegate.scrollTop();
        $ionicScrollDelegate.$getByHandle('main-scroll').scrollTo(position.left, position.top);
    };

    /* Load videos & photos methods*/
    $scope.loadVideos = function () {
        $http.get('data/videos.json').success(function (data) {
            $scope.medias = data;
            $ionicScrollDelegate.resize();
        });
    };
    $scope.loadPhotos = function () {
        $http.get('data/photos.json').success(function (data) {
            $scope.medias = data;
            $ionicScrollDelegate.resize();
        });
    };

    /* Change tab method */
    $scope.changeTab = function (tabName) {
        $scope.currentTab = tabName;
        $ionicScrollDelegate.scrollTop();
        if (tabName === 'photo') {
            $scope.loadPhotos();
        }
        if (tabName === 'video') {
            $scope.loadVideos();
        }
    };

    /* Toggle Favorite icon method */
    $scope.toggleIsFavorite = function (media) {
        media.isFavorite = !media.isFavorite;
    };

    /* Add Media method */
    $scope.addMedia = function () {
        var noun = $scope.currentTab === 'photo' ? 'Photo(s)' : 'Video(s)';
        var icon = '<span class="icon-sprite icon-arrow-right"></span>';
        var menuLevel = 1;
        $scope.addMediaMenuShown = true;
        $ionicActionSheet.show({
            buttons: [
                { text: 'Upload ' + noun + icon },
                { text: 'Download ' + noun + icon },
                { text: 'Share ' + noun + icon }
            ],
            cancelText: 'Close',
            cancel: function () {
                $scope.addMediaMenuShown = false;
            },
            buttonClicked: function (index) {
                if (menuLevel === 2) {
                    // second level, all deadlink
                    $scope.addMediaMenuShown = false;
                    return true;
                }
                if (index <= 1) {
                    // Upload/Download buttons, deadlink
                    $scope.addMediaMenuShown = false;
                    return true;
                } else {
                    // Share button, change to 2nd level
                    var actionSheet = document.getElementsByClassName("action-sheet")[0];
                    var firstGroup = actionSheet.getElementsByClassName("action-sheet-group")[0];
                    var buttons = firstGroup.getElementsByClassName("button");
                    buttons[0].innerHTML = 'Facebook' + icon;
                    buttons[0].className += " facebook-color";
                    buttons[1].innerHTML = 'Twitter' + icon;
                    buttons[1].className += " twitter-color";
                    buttons[2].innerHTML = 'Send to Email' + icon;
                    buttons[2].className += " red-color";
                    menuLevel = 2;
                }
            }
        });
    };

    /* Share media method */
    $scope.shareMedia = function () {
        var noun = $scope.currentTab === 'photo' ? 'Photo(s)' : 'Video(s)';
        var icon = '<span class="icon-sprite icon-arrow-right"></span>';
        var menuLevel = 1;
        $ionicActionSheet.show({
            buttons: [
                { text: 'Facebook ' + icon },
                { text: 'Twitter ' + icon },
                { text: 'Send to Email ' + icon }
            ],
            cancelText: 'Close',
            buttonClicked: function (index) {
                return true;
            }
        });
        setTimeout(function() {
            var actionSheet = document.getElementsByClassName("action-sheet")[0];
            var firstGroup = actionSheet.getElementsByClassName("action-sheet-group")[0];
            var buttons = firstGroup.getElementsByClassName("button");
            buttons[0].className += " facebook-color";
            buttons[1].className += " twitter-color";
            buttons[2].className += " red-color";
        }, 10);
    };

    /* Show Details Modal method */
    $scope.showDetailsModal = function (image) {
        if ($scope.multimediaDetailsModal) {
            $scope.image = image;
            $scope.multimediaDetailsModal.show();
            $scope.resetModalScroll();
        }
    };

    // Initialize detail modal
    $ionicModal.fromTemplateUrl("templates/multimedia-details-modal.html", {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.multimediaDetailsModal = $ionicModal;
    });
    // Clean up modal when state changes
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.multimediaDetailsModal) {
            $scope.multimediaDetailsModal.remove();
        }
    });

    // Load photo
    $scope.loadPhotos();
})

/**
 * Settings Page Controller
 */
.controller('SettingsCtrl', function ($http, $scope, $ionicModal, AuthService, URL) {
    // Variable Declarations
    $scope.settings = {};

    /* Initialize privacyPolicy/termsAndServices/rateThisApp Modals */
    $ionicModal.fromTemplateUrl('templates/privacy-policy-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.privacyPolicyModal = $ionicModal;
    });
    
    $ionicModal.fromTemplateUrl('templates/terms-and-services-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.termsAndServicesModal = $ionicModal;
    });

    $ionicModal.fromTemplateUrl('templates/rate-this-app-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.rateThisAppModal = $ionicModal;
    });

    /* Clean up modal when state changes */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.privacyPolicyModal) {
            $scope.privacyPolicyModal.remove();
        }
        if ($scope.termsAndServicesModal) {
            $scope.termsAndServicesModal.remove();
        }
        if ($scope.rateThisAppModal) {
            $scope.rateThisAppModal.remove();
        }
    });
    /* Load profile settings method */
    $scope.getSettings = function() {
        var setUrl = URL.myProfile + '/settings';
        $http.get(setUrl)
        .success(function (data) {
            $scope.settings = data;
        });
    };

    /* Update profile settings */
    $scope.updateSettings = function() {
        var updateUrl = URL.myProfile + '/settings';
        $http.put(updateUrl, {
            event_push_notifications: $scope.settings.event_push_notifications,
            allow_private_messages: $scope.settings.allow_private_messages
        }).success(function (data) {
            $scope.getSettings();
        });
    }

    $scope.getSettings();
})

/**
 * Favorites page controller
 */
.controller('FavoritesCtrl', function ($scope, $http, $state, $ionicModal, $timeout, $interval, $ionicScrollDelegate, $ionicActionSheet, URL) {

    $scope.currentGroup = 'Attendee';
    $scope.event = {};
    // Individual attendee
    $scope.attendeeProfile = [];

    /* Set Current Group method */
    $scope.setCurrentGroup = function (group) {
        $scope.currentGroup = group;
    };

    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        // Save/Restore main scroll, and reset all other scrolls
        var position = $ionicScrollDelegate.$getByHandle('favorites-list-scroll').getScrollPosition();
        $ionicScrollDelegate.scrollTop();
        $ionicScrollDelegate.$getByHandle('favorites-list-scroll').scrollTo(position.left, position.top);
    };

    /* Initialize attendeeProfileModal method */
    $ionicModal.fromTemplateUrl('templates/attendee-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.attendeeProfileModal = $ionicModal;
    });
    /* Initialize attendeeCurrentlyRegisteredModal method */
    $ionicModal.fromTemplateUrl('templates/attendee-currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.attendeeCurrentlyRegisteredModal = $ionicModal;
    });
    /* Initialize multimedia detail modal */
    $ionicModal.fromTemplateUrl("templates/multimedia-details-modal.html", {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.multimediaDetailsModal = $ionicModal;
    });
     /* Initialize Agenda details modal */
    $ionicModal.fromTemplateUrl('templates/agenda-details-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.eventDetailsModal = $ionicModal;
    });
    /* Method for opening the attendee profile modal */
    $scope.showAttendeeProfileModal = function (user) {
        if ($scope.attendeeProfileModal) {
            var url = URL.tco + '/attendees/' + user.attendee.id;
            $http.get(url)
            .success(function(data) {
                $scope.attendeeProfile = data;
                $scope.attendeeProfileModal.show();
            });
        }
    };
    /* Method for opening the event details modal */
    $scope.showEventDetailsModal = function (fEvent) {
        if ($scope.eventDetailsModal) {
            $scope.eventDetailsModal.show();
            $scope.revealHeaderFromModal();
            // Fold 2 expandable panels in the modal
            $scope.eventExpanded = false;
            $scope.competitorsExpanded = false;
            
            // Get event details
            var eventUrl = URL.tco + '/events/' + fEvent.id.toString();
            $http.get(eventUrl).success(function(data) {
                $scope.event = data;
            });

            // Get event competitor details
            var eventUrl = URL.tco + '/events/' + fEvent.id + '/attendees';
            $http.get(eventUrl).success(function(data) {
                $scope.event.theCompetitors = data;
                    
                // reset modal scroll
                $timeout(function () {
                    var position = $ionicScrollDelegate.$getByHandle('favorites-list-scroll').getScrollPosition();
                    $ionicScrollDelegate.resize();
                    $ionicScrollDelegate.scrollTop(false);
                    $ionicScrollDelegate.$getByHandle('favorites-list-scroll').scrollTo(position.left, position.top);
                }, 100);
            });
        }
    };
    /* Toggle expand Event Description/The Competitors section */
    $scope.toggleEventExpanded = function () {
        $scope.eventExpanded = !$scope.eventExpanded;
        // Content height changes, need resize scroll
        $ionicScrollDelegate.resize();
    };
    $scope.toggleCompetitorsExpanded = function () {
        $scope.competitorsExpanded = !$scope.competitorsExpanded;
        // Content height changes, need resize scroll
        $ionicScrollDelegate.resize();
    };
    /* Update countdown */
    $interval(function () {
        // TODO: Out of scope
        $scope.countdown = "5 hr 2 min";
    }, 1000);

    /* Method for chatting with attendee */
    $scope.chatWithAttendee = function (attendee) {
        $scope.attendeeProfileModal.hide();
        window.location.href = '#/app/messages-auto-suggest/' + $scope.attendeeProfile.handle;
    };    
    /* Method for liking an attendee */
    $scope.likeAttendee = function (attendeeId) {
        var url = URL.tco + '/attendees/' + attendeeId + '/like';
        $http.post(url, {
            "liked": true
        });
    };
    /* Method for opening the "Currently Registered" modal */
    $scope.showAttendeeCurrentlyRegisteredModal = function (userId) {
        if ($scope.attendeeCurrentlyRegisteredModal) {
            var challengeUrl = URL.tco + '/attendees/' + userId + '/current-challenges';
            $http.get(challengeUrl)
            .success(function (data) {
                $scope.attendeeCurrentlyRegistered = data;
                $scope.attendeeCurrentlyRegisteredModal.show();
            })
        }
    };
    /* Show Multimedia Details Modal method */
    $scope.showMultimediaDetailsModal = function (image) {
        if ($scope.multimediaDetailsModal) {
            $scope.image = image;
            $scope.multimediaDetailsModal.show();
            $scope.resetModalScroll();
        }
    };
    /* Share media method */
    $scope.shareMedia = function () {
        var noun = $scope.currentTab === 'photo' ? 'Photo(s)' : 'Video(s)';
        var icon = '<span class="icon-sprite icon-arrow-right"></span>';
        var menuLevel = 1;
        $ionicActionSheet.show({
            buttons: [
                { text: 'Facebook ' + icon },
                { text: 'Twitter ' + icon },
                { text: 'Send to Email ' + icon }
            ],
            cancelText: 'Close',
            buttonClicked: function (index) {
                return true;
            }
        });
        setTimeout(function() {
            var actionSheet = document.getElementsByClassName("action-sheet")[0];
            var firstGroup = actionSheet.getElementsByClassName("action-sheet-group")[0];
            var buttons = firstGroup.getElementsByClassName("button");
            buttons[0].className += " facebook-color";
            buttons[1].className += " twitter-color";
            buttons[2].className += " red-color";
        }, 10);
    };
    /*
    // Load favourite multimedias
    var favMulUrl = URL.tco + '/favorite-albums';
    $http.get(favMulUrl)
    .success(function (data) {
        $scope.multimedias = data;
    });
    */
    // Load favourite attendees
    var favAttUrl = URL.tco + '/favorite-attendees';
    $http.get(favAttUrl)
    .success(function (data) {
        $scope.attendees = data;
    });
    // Load favourite events
    var favEvUrl = URL.tco + '/favorite-events';
    $http.get(favEvUrl)
    .success(function (data) {
        $scope.events = data;
    });
    
    $http.get('data/favorites.json').success(function (data) {
        //$scope.attendees = data.attendees;
        //$scope.events = data.events;
        $scope.multimedias = data.multimedias;
    });
    
})

/**
 * Sponsors page controller
 */
.controller('SponsorsCtrl', function ($scope, $http, $ionicModal, $ionicScrollDelegate, $sce, AuthService, URL) {
    /* Reset scrolls position in modal method */
    $scope.resetModalScroll = function () {
        // Save/Restore main scroll, and reset all other scrolls
        var position = $ionicScrollDelegate.$getByHandle('main-scroll').getScrollPosition();
        $ionicScrollDelegate.scrollTop();
        $ionicScrollDelegate.$getByHandle('main-scroll').scrollTo(position.left, position.top);
    };
    /* Show sponsor details model method */
    $scope.showSponsorDetailModal = function (sponsor) {
        if ($scope.sponsorDetailsModal) {            
            var sponsorUrl = URL.tco + '/sponsors/' + sponsor.id;
            $http.get(sponsorUrl)
            .success(function(data) {
                $scope.sponsor = data;
                $scope.sponsorDetailsModal.show();
                $scope.revealHeaderFromModal();
                $scope.resetModalScroll();
            });
        }
    };
    /* Show apply modal method */
    $scope.showApplyModal = function (applySponsor) {
        if ($scope.applyModal) {
            $scope.applyModal.show();
            $scope.blurMainContent();
            // Track the current selected sponsor
            $scope.applySponsor = applySponsor;
            // Blur the underlying modal
            // Delay some time since the modal takes time to slide up
            setTimeout(function() {
                var modals = document.getElementsByClassName('sponsor-details-modal');
                for (var i = 0; i < modals.length; ++i) {
                    modals[i].parentNode.parentNode.originalClassName = modals[i].parentNode.parentNode.className;
                    modals[i].parentNode.parentNode.className += ' blurred';
                }
            }, 140);
        }
    };
    /* Process the sponsor apply modal method */
    $scope.processApplyModal = function () {
        var applyUrl = URL.tco + '/sponsors/' + $scope.applySponsor.id + '/apply';
        $http.post(applyUrl, {
            id: AuthService.getId()
        })
        .success(function(data) {
            if(data.success) {
                $scope.hideApplyModal();
            }
        })
    };
    /* Close the sponsor apply modal method */
    $scope.hideApplyModal = function (sponsor) {
        $scope.applyModal.hide();
        $scope.disblurMainContent();
        var modals = document.getElementsByClassName('sponsor-details-modal');
        for (var i = 0; i < modals.length; ++i) {
            modals[i].parentNode.parentNode.className = modals[i].parentNode.parentNode.originalClassName;
        }
    };
    /* Hide Sponsor Details modal method */
    $scope.hideSponsorDetailsModal = function () {
        // Reset video
        var video = document.getElementById('sponsor-video');
        var code = video.innerHTML;
        video.innerHTML = '';
        setTimeout(function () {
            video.innerHTML = code;
        }, 10);
        // Hide modal
        $scope.sponsorDetailsModal.hide();
    };

    // Load list of sponsors
    var sponsUrl = URL.tco + '/sponsors';
    $http.get(sponsUrl)
    .success(function (data) {
        $scope.sponsorsList = data;

        // Sorting and ordering logic
        // Order alphabetically, so all sponsors of the same level are adjacent
        $scope.sponsorsList.sort(function (a,b) {
            return (a.level > b.level) ? 1 : ((b.level > a.level) ? -1 : 0);
        });
        
        // Set the property newTitle = true if the level of one sponsor is different from the level of the last one
        // We check for the newTitle property in the template, if it is true then a new title bar is created
        $scope.sponsorsList[0].newTitle = true;
        for (var i = 1; i < $scope.sponsorsList.length; ++i) {
                if ($scope.sponsorsList[i].level.toString() !== $scope.sponsorsList[i-1].level.toString()) {
                $scope.sponsorsList[i].newTitle = true;
            }
            else {
                $scope.sponsorsList[i].newTitle = false;
            }
        }
        
        var makeSponsorsDetailsSafe = function (sponsorsList) {
            for (var i = 0; i < sponsorsList.length; ++i) {
                // Logo and video have html content so make those safe
                sponsorsList[i].logo = $sce.trustAsHtml(sponsorsList[i].logo);
                sponsorsList[i].video = $sce.trustAsHtml(sponsorsList[i].video);
            }
        }
        makeSponsorsDetailsSafe($scope.sponsorsList);
    });

    /* Custom sorting function to give preference to gold, followed by silver and bronze */
    $scope.sortLevels = function(sponsor) {
        if (sponsor.level == 'Gold') return 1;
        if (sponsor.level == 'Silver') return 2;
        if (sponsor.level == 'Bronze') return 3;        
    };

    /* Initialize sponsors details modal */
    $ionicModal.fromTemplateUrl('templates/sponsor-details-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.sponsorDetailsModal = $ionicModal;
    });

    /* Initialize applying modal */
    $ionicModal.fromTemplateUrl('templates/apply-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.applyModal = $ionicModal;
    });

    /* Clean up modal when state changes */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.sponsorDetailsModal) {
            $scope.sponsorDetailsModal.remove();
        }
        if ($scope.applyModal) {
            $scope.applyModal.remove();
        }
    });
})

.controller('MessagesCtrl', function ($scope, $http, AuthService, URL) {
    $scope.userSelectedCount = 0;
    $scope.usersHaveThreads = [];
    /* New message method */
    $scope.newMessage = function () {
        window.location.href = '#/app/messages-auto-suggest';
    };
    /* delete selected user method */
    $scope.deleteSelectedUsers = function () {
        var newArray = [];
        for (var i in $scope.usersHaveThreads) {
            var user = $scope.usersHaveThreads[i];
            if (!user.checked) {
                newArray.push(user);
            }
        }
        $scope.usersHaveThreads = newArray;
    };
    /* Toggle User Checked method */
    $scope.toggleUserChecked = function (user) {
        $scope.userSelectedCount += user.checked ? -1 : 1;
        user.checked = !user.checked; 
    };
    // Load users that have threads
    $http.get('data/users-have-threads.json').success(function (data) {
        $scope.usersHaveThreads = data;
    });
})

/* Messages Auto Suggest page */
.controller('MessagesAutoSuggestCtrl', function ($scope, $http, $stateParams, AuthService, URL) {
    $scope.messageTyped = "";
    $scope.selectedUser = { handle: $stateParams.selected };
    $scope.selectedUserHandle = $stateParams.selected;
    $scope.users = [];
    $scope.messages = [];

    /* Go to all messages method */
    $scope.goToAllMessages = function () {
        window.location.href = '#/app/messages';
    };
    /* Send message method */
    $scope.sendMessage = function () {
        if ($scope.messageTyped.length > 0 && $scope.selectedUserHandle) {
            // Send message
            var msgUrl = URL.tco + '/messages';
            $http.post(msgUrl, {
                tco_id: 'tco14',
                content: $scope.messageTyped,
                from_attendee: AuthService.getId(),
                to_attendee: $scope.selectedUserHandle
            })
            .success(function (data) {
                $scope.users = [];
                $scope.messageTyped = "";
            });
            $scope.users = [];
            $scope.messageTyped = "";
            // Load messages
            var msgListUrl = URL.tco + '/messages';
            $http.get(msgListUrl).success(function (data) {
                $scope.messages = data;
            });
        }
    };
    /* Select user method */
    $scope.selectUser = function (user) {
        $scope.selectedUser = user;
        $scope.selectedUserHandle = user.handle;
    };
    // Load autosuggest users
    if (!$stateParams.selected) {
        $http.get('data/messages-auto-suggest.json').success(function (data) {
            $scope.users = data;
        });
    }
})

/* News List Page Controller */
.controller('NewsCtrl', function ($scope, $http, $ionicModal, $ionicScrollDelegate, $sce, URL) {
    /* News list data */
    $scope.newsList = [];

    /* Show newsDetailsModal method */
    $scope.showNewsDetailsModal = function (news) {
        var newsUrl = URL.tco + '/news/' + news.id.toString();
        $http.get(newsUrl)
        .success(function(data) {
            $scope.newsDetails = data;
            $scope.newsDetails.content = $sce.trustAsHtml($scope.newsDetails.content);
            $scope.newsDetailsModal.show();
            // Score modal to top but leave news-list scroll
            var position = $ionicScrollDelegate.$getByHandle('news-list-scroll').getScrollPosition();
            $ionicScrollDelegate.scrollTop();
            $ionicScrollDelegate.$getByHandle('news-list-scroll').scrollTo(position.left, position.top, false);
            // Style the modal
            $scope.revealHeaderFromModal();
        });
    };

    /* Initialize newsDetailsModal method */
    $ionicModal.fromTemplateUrl('templates/news-details-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.newsDetailsModal = $ionicModal;
    });

    /* Load news list data */
    var newsListUrl = URL.tco + '/news';
    $http.get(newsListUrl)
    .success(function (data) {
        $scope.newsList = data;
        // Trust HTML in news objects
        for (var i = 0; i < $scope.newsList.length; ++i) {
            $scope.newsList[i].content = $sce.trustAsHtml($scope.newsList[i].content);
        }
    });

    /* Clean up modal when state changes */
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.newsDetailsModal) {
            $scope.newsDetailsModal.remove();
        }
    });

})

;