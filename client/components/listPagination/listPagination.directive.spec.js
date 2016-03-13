'use strict';

describe('Directive: listPagination', function () {

  // load the directive's module and view
  beforeEach(module('mean1App'));
  beforeEach(module('components/listPagination/listPagination.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
    scope.numPerPage = 10;
    scope.numPagesToShow = 7;
    scope.totalItems = 100;
    scope.firstItem = 1;
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<list-pagination></list-pagination>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text().indexOf('1 to 10 of 100')).toBeGreaterThan(0);
  }));
});
