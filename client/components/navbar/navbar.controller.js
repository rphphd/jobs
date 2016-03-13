'use strict';

class NavbarController {
  //start-non-standard
  menu = [
    {
    'title': 'Jobs',
    'link': '/jobs'
    },
    {
    'title': 'AFS',
    'link': '/main'
  }
  ];

  isCollapsed = true;
  //end-non-standard

  constructor($location) {
    this.$location = $location;
    }

  isActive(route) {
    return route === this.$location.path();
  }
}

angular.module('mean1App')
  .controller('NavbarController', NavbarController);
