'use strict';

angular.module('mean1App')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/jobs/:id?', {
        templateUrl: 'app/posts/posts.html',
        controller: 'PostsCtrl'
      })
      .when('/',{
        redirectTo : '/jobs/'
      });
});
