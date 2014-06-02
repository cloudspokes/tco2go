'use strict';

angular.module('tco14app.controllers', [])

/**
 * Global controller
 */
.controller('AppCtrl', function($scope, $http, $state, $ionicSideMenuDelegate, $ionicModal) {
    // New Messages Count
    $scope.newMessages = 2;

    $scope.$state = $state;

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
                    // backdrop.setAttribute('style', 'top: 64px; bottom: 0; height: auto;');
                    modal.setAttribute('style', 'top: 64px; bottom: 0; height: auto; position: absolute; min-height: 0;');
                    break;
                }
            }
        }, 10);
    };
})

/**
 * Welcome Page Controller 
 */
.controller('WelcomeCtrl', function($scope, $ionicSideMenuDelegate) {
    $scope.signIn = function () {
        window.location.href = '#/app/my-profile';
    };
})

/**
 * My Profile Page Conroller 
 */
.controller('MyProfileCtrl', function ($scope, $stateParams, $http, $ionicModal, $ionicScrollDelegate) {
    $scope.profile = {};
    /* Variables binded to Edit profile modals
     * NOTE: DO NOT USE statements like ng-model="editedName", use ng-model="editedProfile.editedName"
     * Because we need bind variables in a modal and the modal's scope is a sub-scope. Otherwise
     * variables in this scope won't be correctly updated.
     */
    $scope.editedProfile = {
        name: '',
        country: '',
        email: '',
        role: '',
        quote: ''
    };
    // Get profile data
    var data = $stateParams.inactive ? 'data/my-profile-inactive.json' : 'data/my-profile.json';
    $http.get(data).success(function (data) {
        $scope.profile = data;
        /* Format date */
        var date = new Date(data.memberSince);
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
        $scope.profile.memberSince = month + '/' + day + '/' + year;
    });
    // Initialize Edit Profile modal
    $ionicModal.fromTemplateUrl('templates/edit-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.editProfileModal = $ionicModal;
    });
    // Initialize current registered modal
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
    // Show Edit Profile modal method
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
    // Close edit profile method
    $scope.hideEditProfileModal = function () {
        $scope.editProfileModal.hide();
        $scope.disblurMainContent();
    };
    // Show Currently Registered modal method
    $scope.showCurrentlyRegisteredModal = function () {
        if ($scope.currentlyRegisteredModal) {
            $scope.currentlyRegisteredModal.show();
            $scope.revealHeaderFromModal();
            $scope.resetModalScroll();
        }
    };
    // Save edited profile method
    $scope.saveEditedProfile = function () {
        var fields = ['name', 'country', 'email', 'role', 'quote', 'twitterInactive', 'googleplusInactive',
                      'facebookInactive', 'linkedinInactive', 'githubInactive'];
        for (var i = 0; i < fields.length; ++i) {
            var field = fields[i];
            $scope.profile[field] = $scope.editedProfile[field];
        }
        $scope.editProfileModal.hide();
        $scope.disblurMainContent();
    };
    // Clear form field methods
    $scope.clearName = function () {
        $scope.editedProfile.name = '';
    };
    $scope.clearEmail = function () {
        $scope.editedProfile.email = '';
    };
    $scope.clearQuote = function () {
        $scope.editedProfile.quote = '';
    };
    // Clean up modal when state change
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
.controller('AgendaCtrl', function($scope, $http, $interval, $timeout, $state, $ionicModal, $ionicScrollDelegate) {
    /* Filter flags */
    $scope.showFood = true;
    $scope.showContest = true;
    $scope.showPresentation = true;
    /* Current day */
    $scope.day = new Date();
    $scope.isToday = true;
    /* Agenda data */
    $scope.agenda = [];
    /* Load agenda method */
    $scope.loadAgenda = function () {
        // Mock agenda by odd/even day
        $http.get($scope.day.getDate() % 2 ? 'data/agenda.json' : 'data/agenda1.json').success(function (data) {
            $scope.agenda = data;
        });
    };
    /* Agenda filter */
    $scope.filterByType = function (item) {
        return item.type === 'food' && $scope.showFood ||
            item.type === 'presentation' && $scope.showPresentation ||
            item.type === 'contest' && $scope.showContest;
    };
    /* Go prev/next day methods */
    $scope.goPrevDay = function () {
        $scope.day.setDate($scope.day.getDate() - 1);
        $scope.isToday = $scope.day.toDateString() === (new Date()).toDateString();
        $scope.loadAgenda();
    };
    $scope.goNextDay = function () {
        $scope.day.setDate($scope.day.getDate() + 1);
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
    /* Initialize Alert modal */
    $ionicModal.fromTemplateUrl('templates/alert-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.alertModal = $ionicModal;
    });
    // Initialize attendee profile modal
    $ionicModal.fromTemplateUrl('templates/attendee-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.attendeeProfileModal = $ionicModal;
    });
    // Initialize attendee current registered modal
    $ionicModal.fromTemplateUrl('templates/attendee-currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.attendeeCurrentlyRegisteredModal = $ionicModal;
    });
    /* Method for opening the attendee profile modal */
    $scope.showAttendeeProfileModal = function () {
        if ($scope.attendeeProfileModal) {
            $scope.attendeeProfileModal.show();
        }
    };
    /* Method for chatting with attendee */
    $scope.chatWithAttendee = function (attendee) {
        $scope.attendeeProfileModal.hide();
        window.location.href = '#/app/messages-auto-suggest/' + $scope.attendeeProfile.handle;
    };
    /* Method for opening the "Currently Registered" modal */
    $scope.showAttendeeCurrentlyRegisteredModal = function () {
        if ($scope.attendeeCurrentlyRegisteredModal) {
            $scope.attendeeCurrentlyRegisteredModal.show();
        }
    };
    // Load attendee profile
    $http.get('data/attendee-profile.json').success(function (data) {
        $scope.attendeeProfile = data;
    });
    // Clean up modal when state change
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.alertModal) {
            $scope.alertModal.remove();
        }
        if ($scope.eventDetailsModal) {
            $scope.eventDetailsModal.remove();
        }
    });
    /* Show details modal method */
    $scope.showEventDetails = function (event) {
        if ($scope.eventDetailsModal) {
            $scope.eventDetailsModal.show();
            $scope.revealHeaderFromModal();
            // Fold 2 expandable panels in the modal
            $scope.eventExpanded = false;
            $scope.competitorsExpanded = false;
            
            // Load details data
            // Mock 2 different data based on odd-even of event's ID
            $http.get('data/agenda-details-' + (parseInt(event.id) % 2 || 0) + ".json").success(function (data) {
                $scope.event = data;
                // NOTE: to make the prototype more realistic the following statements are added.
                // They overwrite the title/beginTime/endTime attributes.
                // May not needed in production environment.
                $scope.event.title = event.title;
                $scope.event.beginTime = event.beginTime;
                $scope.event.endTime = event.endTime;
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
    $http.get('data/alerts.json').success(function (data) {
        $scope.alerts = data;
    });
})

/**
 * Attendees page controller
 */
.controller('AttendeesCtrl', function($scope, $http, $state, $ionicModal, $ionicScrollDelegate) {
    // Attendees list
    $scope.attendees = [];
    // Current active group (current active tab)
    $scope.currentGroup = 'Competitors';
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
        return item.group === $scope.currentGroup;
    };

    /* Search attendee by keyword */
    $scope.filterByKeyword = function (item) {
        var keyword = $scope.searchOptions.keyword;
        return item.handle && item.handle.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
            item.country && item.country.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
            item.track && item.track.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    };

    // Initialize Search Modal
    $ionicModal.fromTemplateUrl('templates/search-attendees-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }, {
        focusFirstInput: false
    }).then(function ($ionicModal) {
        $scope.searchAttendeesModal = $ionicModal;
    });
    // Initialize attendee profile modal
    $ionicModal.fromTemplateUrl('templates/attendee-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.attendeeProfileModal = $ionicModal;
    });
    // Initialize attendee current registered modal
    $ionicModal.fromTemplateUrl('templates/attendee-currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.attendeeCurrentlyRegisteredModal = $ionicModal;
    });
    /* Method for opening the attendee profile modal */
    $scope.showAttendeeProfileModal = function () {
        if ($scope.attendeeProfileModal) {
            $scope.attendeeProfileModal.show();
            $scope.resetModalScroll();
            // Bring the modal to the top, by appending to the last of <body>
            var modal = document.getElementsByClassName('attendee-profile-modal')[0].parentNode.parentNode;
            document.getElementsByTagName('body')[0].appendChild(modal);
        }
    };
    /* Method for chatting with attendee */
    $scope.chatWithAttendee = function (attendee) {
        $scope.searchAttendeesModal.hide();
        $scope.attendeeProfileModal.hide();
        $scope.disblurMainContent();
        window.location.href = '#/app/messages-auto-suggest/' + $scope.attendeeProfile.handle;
    };
    /* Method for opening the "Currently Registered" modal */
    $scope.showAttendeeCurrentlyRegisteredModal = function () {
        if ($scope.attendeeCurrentlyRegisteredModal) {
            $scope.attendeeCurrentlyRegisteredModal.show();
        }
    };

    // Clean up modal when state changes
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

    // Load attendees
    $http.get('data/attendees.json').success(function (data) {
        $scope.attendees = data;
    });
    // Load attendee profile
    $http.get('data/attendee-profile.json').success(function (data) {
        $scope.attendeeProfile = data;
    });
})

/**
 * Multimedia Page Controller
 */
.controller('MultimediaCtrl', function ($scope, $http, $ionicScrollDelegate, $ionicActionSheet, $ionicModal) {
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
.controller('SettingsCtrl', function ($scope, $ionicModal) {
    // Initialize Modals
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

    // Clean up modal when state changes
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
})

/**
 * Favorites page controller
 */
.controller('FavoritesCtrl', function ($scope, $http, $state, $ionicModal, $ionicScrollDelegate, $ionicActionSheet) {

    $scope.currentGroup = 'Attendee';

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

    // Initialize attendee profile modal
    $ionicModal.fromTemplateUrl('templates/attendee-profile-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function($ionicModal) {
        $scope.attendeeProfileModal = $ionicModal;
    });
    // Initialize attendee current registered modal
    $ionicModal.fromTemplateUrl('templates/attendee-currently-registered-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.attendeeCurrentlyRegisteredModal = $ionicModal;
    });
    // Initialize multimedia detail modal
    $ionicModal.fromTemplateUrl("templates/multimedia-details-modal.html", {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.multimediaDetailsModal = $ionicModal;
    });
    /* Method for opening the attendee profile modal */
    $scope.showAttendeeProfileModal = function () {
        if ($scope.attendeeProfileModal) {
            $scope.attendeeProfileModal.show();
            $scope.resetModalScroll();
        }
    };
    /* Method for chatting with attendee */
    $scope.chatWithAttendee = function (attendee) {
        $scope.attendeeProfileModal.hide();
        window.location.href = '#/app/messages-auto-suggest/' + $scope.attendeeProfile.handle;
    };
    /* Method for opening the "Currently Registered" modal */
    $scope.showAttendeeCurrentlyRegisteredModal = function () {
        if ($scope.attendeeCurrentlyRegisteredModal) {
            $scope.attendeeCurrentlyRegisteredModal.show();
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
    // Load attendee profile
    $http.get('data/attendee-profile.json').success(function (data) {
        $scope.attendeeProfile = data;
    });
    // Load JSON data
    $http.get('data/favorites.json').success(function (data) {
        $scope.attendees = data.attendees;
        $scope.events = data.events;
        $scope.multimedias = data.multimedias;
    });
})

/**
 * Sponsors page controller
 */
.controller('SponsorsCtrl', function ($scope, $http, $ionicModal, $ionicScrollDelegate, $sce) {
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
            $scope.sponsor = sponsor;
            $scope.sponsorDetailsModal.show();
            $scope.revealHeaderFromModal();
            $scope.resetModalScroll();
        }
    };
    /* Show apply modal */
    $scope.showApplyModal = function (sponsor) {
        if ($scope.applyModal) {
            $scope.applyModal.show();
            $scope.blurMainContent();
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
    $scope.hideApplyModal = function (sponsor) {
        $scope.applyModal.hide();
        $scope.disblurMainContent();
        var modals = document.getElementsByClassName('sponsor-details-modal');
        for (var i = 0; i < modals.length; ++i) {
            modals[i].parentNode.parentNode.className = modals[i].parentNode.parentNode.originalClassName;
        }
    };
    /* Hide Sponsor Details modal */
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

    // Load sponsor list
    $http.get('data/sponsors.json').success(function (data) {
        $scope.goldSponsors = data.goldSponsors;
        $scope.silverSponsors = data.silverSponsors;
        $scope.bronzeSponsors = data.bronzeSponsors;

        var makeSponsorsDetailsSafe = function (sponsors) {
            for (var i = 0; i < sponsors.length; ++i) {
                sponsors[i].details = $sce.trustAsHtml(sponsors[i].details);
            }
        };
        makeSponsorsDetailsSafe($scope.goldSponsors);
        makeSponsorsDetailsSafe($scope.silverSponsors);
        makeSponsorsDetailsSafe($scope.bronzeSponsors);
    });

    // Initialize sponsors details modal
    $ionicModal.fromTemplateUrl('templates/sponsor-details-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.sponsorDetailsModal = $ionicModal;
    });

    // Initilize applying modal
    $ionicModal.fromTemplateUrl('templates/apply-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.applyModal = $ionicModal;
    });

    // Clean up modal when state changes
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.sponsorDetailsModal) {
            $scope.sponsorDetailsModal.remove();
        }
        if ($scope.applyModal) {
            $scope.applyModal.remove();
        }
    });
})

.controller('MessagesCtrl', function ($scope, $http) {
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
.controller('MessagesAutoSuggestCtrl', function ($scope, $http, $stateParams) {
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
            $scope.users = [];
            $scope.messageTyped = "";
            // Load messages
            $http.get('data/messages-chat.json').success(function (data) {
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
.controller('NewsCtrl', function ($scope, $http, $ionicModal, $ionicScrollDelegate, $sce) {
    /* News list data */
    $scope.newsList = [];

    /* Show news details modal method */
    $scope.showNewsDetailsModal = function (news) {
        $scope.newsDetails = news;
        $scope.newsDetailsModal.show();
        // Score modal to top but leave news-list scroll
        var position = $ionicScrollDelegate.$getByHandle('news-list-scroll').getScrollPosition();
        $ionicScrollDelegate.scrollTop();
        $ionicScrollDelegate.$getByHandle('news-list-scroll').scrollTo(position.left, position.top, false);
        // Style the modal
        $scope.revealHeaderFromModal();
    };

    // Initilize news details modal
    $ionicModal.fromTemplateUrl('templates/news-details-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function ($ionicModal) {
        $scope.newsDetailsModal = $ionicModal;
    });

    // Load news list data
    $http.get('data/news-list.json').success(function (data) {
        $scope.newsList = data;
        // Trust HTML in news objects
        for (var i = 0; i < $scope.newsList.length; ++i) {
            $scope.newsList[i].digest = $sce.trustAsHtml($scope.newsList[i].digest);
            $scope.newsList[i].text = $sce.trustAsHtml($scope.newsList[i].text);
        }
    });

    // Clean up modal when state change
    $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){
        if ($scope.newsDetailsModal) {
            $scope.newsDetailsModal.remove();
        }
    });

})

;

