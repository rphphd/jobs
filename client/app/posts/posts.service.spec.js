'use strict';

describe('Service: postsSrvc', function () {

  // load the service's module
  beforeEach(module('mean1App'));

  // instantiate service
  var posts;

  beforeEach(inject(function (_postsSrvc_) {
    posts = _postsSrvc_;
  }));

  it('should do something', function () {
    expect(posts.posts).toBeDefined();
  });

});
