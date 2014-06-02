# Review
Just deploy this folder to a web server, and access index.html using your mobile phone browser.


# Integrate this UI prototype to an ionic app
To integrate this prototype into an ionic app, create a new ionic project using the ionic node.js 
utility, copy and paste this prototype into the "www" folder

Folder lib/ contains ionic JS files. It is created by ionic
(see http://ionicframework.com/docs/overview/#starter).


# HTML Validation Errors
Some ionic and angularjs tags/directives are causing HTML validation errors, please accept them

Here's the ionic tags that causes validation errors. You can find the documentation for
them [here](http://ionicframework.com/docs/api/directive/ionSideMenus/)

+ ion-nav-view
+ ion-content
+ ion-header-bar
+ ion-footer-bar
+ ion-scroll
+ ion-view
+ ion-side-menus
+ ion-side-menu-content
+ ion-side-menu


# CSS Validation Errors
There are some errors against -webkit-min-device-pixel-ratio, this is the standard way to select retina display,
please accept these errors


# Guide to verify some requirements

## 13) Agenda Alert
- alert number indicator should be editable and can be easily removed in the code without 
  affecting the style of other part of the screen
- "alert" icon (bell image on the upper right) will have a number indicator, the number 
  should be editable

Please edit "data/alert.json", the number of objects in the array will be the number in that 
indicator. Change it to empty array will remove the indicator.

## 02-D-Edit-Profile-Inactive.png

To show this screen, please manually access #/app/my-profile/inactive add then click the "edit" icon.


Thanks!
