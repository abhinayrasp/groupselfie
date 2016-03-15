(function() {
  'use strict';

  var appUrl = 'https://groupselfie.form.io';

  angular
    .module('groupselfie')
    .config(routerConfig);

  /** @ngInject */
  function routerConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'views/main.html',
        controller: ['$scope', '$http', 'Formio', '$rootScope', function($scope, $http, Formio, $rootScope) {
          $scope.groups = {};
          $scope.noGroups = false;

          // Get all of my selfies.
          $http.get(appUrl + '/selfie/submission?owner=' + $rootScope.user._id, {headers: {'x-jwt-token': Formio.getToken()}}).then(function(result) {
            result.data.forEach(function(selfie) {
              if (selfie.data.group && selfie.data.group._id && selfie.data.group.data.title) {
                $scope.groups[selfie.data.group._id] = selfie.data.group;
              }
            });
            $scope.noGroups = (Object.keys($scope.groups).length === 0);
          });

          // Get all of my groups that I created.
          $http.get(appUrl + '/group/submission?owner=' + $rootScope.user._id, {headers: {'x-jwt-token': Formio.getToken()}}).then(function(result) {
            result.data.forEach(function(group) {
              if (group && group._id && group.data.title) {
                $scope.groups[group._id] = group;
              }
            });
            $scope.noGroups = (Object.keys($scope.groups).length === 0);
          });
        }]
      })
      .state('find', {
        url: '/find',
        templateUrl: 'views/group/find.html',
        controller: ['$scope', '$http', 'toastr', 'Formio', '$state', function($scope, $http, toastr, Formio, $state) {
          $scope.groupName = '';
          $scope.loading = false;
          $scope.findGroup = function() {
            $scope.loading = true;
            $http.get(appUrl + '/group/submission?data.name=' + $scope.groupName.toLowerCase(), {
              headers: {'x-jwt-token': Formio.getToken()}
            }).then(function(result) {
              $scope.loading = false;
              if (!result || !result.data || !result.data.length) {
                toastr.info('Group not found');
              }
              else {
                $state.go('group.view', {groupId: result.data[0]._id});
              }
            });
          };
        }]
      });

    $urlRouterProvider.otherwise('/');
  }

})();
