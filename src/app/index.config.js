(function() {
  'use strict';

  angular
    .module('groupselfie')
    .config(config);

  /** @ngInject */
  function config($logProvider, toastrConfig, FormioProvider, FormioAuthProvider, FormioResourceProvider) {

    // Enable log
    $logProvider.debugEnabled(true);
    FormioProvider.setBaseUrl('https://api.form.io');
    FormioAuthProvider.setStates('auth.login', 'home');
    FormioAuthProvider.setStates('auth.register', 'home');
    FormioAuthProvider.setForceAuth(true);
    FormioAuthProvider.register('login', 'user', 'user/login');
    FormioAuthProvider.register('register', 'user', 'user/register');

    // This will be your groups Form.io API url.
    var appUrl = 'https://groupselfie.form.io';
    FormioResourceProvider.register('group', appUrl + '/group', {
      templates: {
        view: 'views/group/view.html'
      },
      controllers: {
        create: [
          '$scope',
          function($scope) {
            $scope.submission.data.status = 'open';
          }
        ],
        view: [
          '$scope',
          '$stateParams',
          'Formio',
          '$http',
          function($scope, $stateParams, Formio, $http) {
            $scope.selfies = [];
            $http.get(appUrl + '/selfie/submission?limit=100&data.group._id=' + $stateParams.groupId, {
              headers: {
                'x-jwt-token': Formio.getToken()
              }
            }).then(function(result) {
              $scope.selfies = result.data;
            });
          }
        ]
      }
    });

    FormioResourceProvider.register('selfie', appUrl + '/selfie', {
      parent: 'group',
      controllers: {
        create: ['$scope', '$state', '$stateParams', function($scope, $state, $stateParams) {
          $scope.$on('formSubmission', function() {
            $state.go('group.view', {groupId: $stateParams.groupId});
          });
          return {handle: true};
        }]
      }
    })

    // Set options third-party lib
    toastrConfig.allowHtml = true;
    toastrConfig.timeOut = 3000;
    toastrConfig.positionClass = 'toast-top-right';
    toastrConfig.preventDuplicates = true;
    toastrConfig.progressBar = true;
  }
})();
