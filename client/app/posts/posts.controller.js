'use strict';

angular.module('mean1App')
  .controller('PostsCtrl', [
      '$scope','$routeParams', 'postsSrvc', 'cities',
  function ($scope, $routeParams, postsSrvc, citiesSrvc,  $uibModal ) {

      var debug = true;

      $scope.headings = ['source','city','jobid','when','description','location'];

      $scope.telecommuting = true;
      $scope.contract = true;
      $scope.keywords = '';
      $scope.waiting = false;

      $scope.numPerPage = 10;
      $scope.numPagesToShow = 7;
      $scope.totalItems = 0;
      $scope.lastItem = 0;
      $scope.firstItem = 0;
      $scope.jobCities = [];
      $scope.citiesSelected = {};
      $scope.allCitiesSelected = false;
      $scope.jobWords = [];
      $scope.wordsSelected = {};
      $scope.wordsShown = false;

      var saveInformation = function () {
        localStorage.setItem('jobs',JSON.stringify($scope.posts));
        localStorage.setItem('cities',JSON.stringify($scope.cityList));
        localStorage.setItem('words',JSON.stringify($scope.wordsSelected));
      }

      var updateCities = function () {
        if (debug && localStorage.hasOwnProperty('cities')) {
          $scope.cityList = JSON.parse(localStorage.getItem('cities'));
        } else if (!$scope.hasOwnProperty('cityList')) {
          var cityList = citiesSrvc.cities();
          cityList.then(function(response) {
            $scope.cityList = response;
            saveInformation();
            console.log('updateCities response', response);
          });
        }
      };

      var setScopeJobVars = function (data) {
        $scope.totalItems = data.length;
        if ($scope.totalItems>0) {
          $scope.posts = _.sortBy(data, 'when').reverse();
          _.forEach($scope.posts,function(p){ p.show = true; });
          $scope.jobsPage = $scope.posts.slice(0,$scope.numPerPage);
          console.log('page jobs',$scope.jobsPage);
          $scope.firstItem = 1;
          $scope.jobCities = _.unique(_.pluck($scope.posts,'city')).sort();
          $scope.citiesSelected = {};
          _.forEach($scope.jobCities,function(jc){ $scope.citiesSelected[jc] = true; });
          var theWords = [];
          _.forEach(_.pluck($scope.posts,'description'), function(d){
            var wdsArray = d.toLowerCase().replace('(','').replace(')','').split(' ');
            var wds = _.filter(wdsArray,function(w){
              return /[a-z]..*/.test(w);
            });
            theWords = theWords.concat(wds);
          });
          $scope.jobWords = _.unique(theWords).sort();
          _.forEach($scope.jobWords,function(jw){ $scope.wordsSelected[jw] = true; });
          if (localStorage.hasOwnProperty('words')) {
            _.extend($scope.wordsSelected,JSON.parse(localStorage.getItem('words')));
          }
          localStorage.setItem('words',JSON.stringify($scope.wordsSelected));
          console.log('job cities',$scope.jobCities,'job words',$scope.jobWords);
        } else {
          $scope.posts = [];
          $scope.jobsPage = [];
          $scope.firstItem = 0;
          $scope.jobCities = [];
          $scope.jobWords = [];
          $scope.citiesSelected = {};
        }
      };

      var updatePostsShowing = function () {
        $scope.firstItem = 0;
        console.log('wordsSelected',$scope.wordsSelected);

        _.forEach($scope.posts,function(p,i){
          if (i<10) console.log("post description",p.description);
          p.show = $scope.citiesSelected[p.city];
          if (p.show) {
            for (var key in $scope.wordsSelected) {
              if (!$scope.wordsSelected[key]) {
                if (p.description.toLowerCase().indexOf(key.toString())>=0) {
                  console.log('post',p.description,key.toString());
                  p.show = false;
                  break;
                }
              }
            }
          }
        });
        var jobsShowing = _.filter($scope.posts,{ show : true });
        $scope.jobsPage = jobsShowing.slice(0,$scope.numPerPage);
        $scope.totalItems = jobsShowing.length;
        $scope.firstItem = 1;
      }

      var updateListings = function () {
        if (debug && localStorage.hasOwnProperty('jobs')) {
          setScopeJobVars(JSON.parse(localStorage.getItem('jobs')));
        } else {
          $scope.waiting = true;
          $scope.firstItem = 0;
          var posts = postsSrvc.posts($scope.keywords,$scope.telecommuting,$scope.contract);
          console.log('route params',$routeParams, 'scope',$scope, 'posts', postsSrvc);
          posts.then(function(response){
            setScopeJobVars(response);
            updatePostsShowing();
            console.log('num items returned',$scope.totalItems, response);
            updateCities();
            $scope.waiting = false;
          });
        }
      };

      updateListings();

      $scope.$watch('firstItem',function(newV,oldV){
        console.log('first item watch in posts controller', newV, oldV);
        if (newV>0) {
          var jobsShowing = _.filter($scope.posts,{ show : true });
          $scope.jobsPage = jobsShowing.slice(newV-1,newV+$scope.numPerPage-1);
          console.log('page jobs',$scope.jobsPage);
        } else { $scope.jobsPage = []; }
      });

      /*
      $scope.$watch('telecommuting',function(newValue,oldValue){
        if (newValue!==oldValue) { updateListings(); }
      });
      $scope.$watch('contract',function(newValue,oldValue){
        if (newValue!==oldValue) { updateListings(); }
      });

      $scope.$watch('keywords',function(newValue){
        console.log('keywords watch "' + newValue + '"');
        //if (newValue!==oldValue) { console.log('watch keywords',newValue,oldValue); updateListings(); }
      });

      $scope.keyEntered = function (evt) {
        if (evt.which === 13) {
          updateListings();
        }
      };

      $scope.handleBlur = function () {
        updateListings();
      };
      */

      $scope.refreshJobs = function (evt) {
        evt.preventDefault();
        console.log('refreshJobs',evt, debug);
        var saveDebug = debug;
        debug = false;
        updateListings();
        updatePostsShowing();
        console.log('put debug back', saveDebug, debug);
        debug = saveDebug;
      };

      $scope.showCities = function (evt) {
          evt.preventDefault();
          console.log('got to showCities');
          modalService.showModal({
              templateUrl: 'app/posts/modal.html',
              controller: 'ModalController'
          }).then(function(modal) {
             console.log('modal then', modal);
              modal.element.modal();
              modal.close.then(function(result) {
                  $scope.message = 'You said ' + result;
              });
          });
      };

      $scope.citySelected = function (c) {
        console.log('citySelected',c,$scope.citiesSelected);
        updatePostsShowing();
      };

      $scope.allCities = function () {
        console.log('allCitiesSelected', $scope.allCitiesSelected);
        _.forEach($scope.jobCities,function(jc) {
          $scope.citiesSelected[jc] = $scope.allCitiesSelected;
        });
        updatePostsShowing();
        console.log('citiesSelected', $scope.citiesSelected);
      };

      $scope.wordSelected = function (w) {
        console.log('wordSelected', w, $scope.wordsSelected);
        localStorage.setItem('words',JSON.stringify($scope.wordsSelected));
        updatePostsShowing();
      };

  }

  ]
);

angular.module('mean1App').controller('ModalController', function($scope, close) {

 $scope.close = function(result) {
 	close(result, 500); // close, but give 500ms for bootstrap to animate
 };

});
