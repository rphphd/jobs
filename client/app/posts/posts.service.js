'use strict';

angular.module('mean1App')
  .factory('postsSrvc', function ($resource) {
    // Service logic
    // ...

    var url = '/api/jobs/cl';
    var jobs = $resource(url);

    return {
      posts: function(keywords, telecommuting, contract) {
        var kwdsString = keywords.replace(' ','+');
        return jobs.query({
          query           : kwdsString,
          isTelecommuting : telecommuting ? '1' : '0',
          employmentType  : contract ? '3':''
        }).$promise;
      }
    };

  });
