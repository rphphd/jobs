'use strict';

describe('Controller: PostsCtrl', function () {

  // load the controller's module
  beforeEach(module('mean1App'));

  var PostsCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PostsCtrl = $controller('PostsCtrl', {
      $scope: scope,
      $routeParams : { id : 0},
      postsSrvc : { posts : function() { return { then : function () { return [{
        title: 'testTitle', data : scope
      }]; } } } }
    });
  }));

  it('should ...', function () {
    expect(scope.posts.then()[0].title).toMatch('testTitle');
  });
});
