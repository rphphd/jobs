'use strict';

angular.module('mean1App')
  .factory('cities', function ($resource) {
    // Service logic
    // ...

    var url = '/api/jobs/cities';
    var jobs = $resource(url);

    return {
      cities: function() {
        return jobs.query({}).$promise;
      }
    };
  });
