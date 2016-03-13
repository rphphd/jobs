'use strict';

angular.module('mean1App')
  .directive('listPagination', function () {
    return {
      templateUrl: 'components/listPagination/listPagination.html',
      restrict: 'E',
      transclude : true,
      link: function (scope) {

        var maxPage;
        scope.$watch('firstItem',function(){
          maxPage = Math.ceil(scope.totalItems / scope.numPerPage);
          //console.log('listPagination',scope);
          scope.lastItem = Math.min(scope.firstItem + scope.numPerPage - 1, scope.totalItems);
          scope.curPage = Math.round(scope.firstItem / scope.numPerPage)+1;
          scope.lowestPage = Math.max(1,
            Math.min(scope.curPage-Math.trunc(scope.numPagesToShow/2),
              maxPage-scope.numPagesToShow+1
            )
          );
          scope.lastPage = Math.min( scope.lowestPage + scope.numPagesToShow -1, maxPage );
          scope.firstPage = maxPage === scope.lastPage ?
              Math.max(1, scope.lastPage - scope.numPagesToShow + 1)
              : scope.firstPage;
          console.log('maxPage',maxPage,'curPage',scope.curPage,
              'lowestPage',scope.lowestPage,'lastPage',scope.lastPage);
          scope.pages = _.range(scope.lowestPage,(scope.lastPage+1));
          //console.log(scope.pages);
          scope.maxPage = maxPage;
          scope.$apply;
        });

        scope.gotoPage = function(evt,pno) {
          evt.preventDefault();
          scope.firstItem = (pno-1) * scope.numPerPage + 1 ;
        };

        scope.propsFirstLink = function (evt) {
          evt.preventDefault();
          scope.firstItem = 1 ;
        };

        scope.propsLastLink = function (evt) {
          evt.preventDefault();
          scope.firstItem = (maxPage-1) * scope.numPerPage + 1;
        };

        scope.propsPrevLink = function (evt) {
          evt.preventDefault();
          scope.firstItem = Math.max(0,scope.curPage-2) * scope.numPerPage + 1 ;
        };

        scope.propsNextLink = function (evt) {
          evt.preventDefault();
          scope.firstItem = Math.min(maxPage-1,scope.curPage ) * scope.numPerPage + 1 ;
        };
      }
    };
  });
