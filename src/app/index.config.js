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

    var appUrl = 'https://groupselfie.form.io';
    FormioResourceProvider.register('group', appUrl + '/group', {
      templates: {
        view: 'views/group/view.html'
      },
      controllers: {
        create: [
          '$scope',
          'FormioUtils',
          function($scope, FormioUtils) {
            // Default the status to 'open'.
            $scope.submission.data.status = 'open';

            // Create a code for them.
            $scope.submission.data.code = chance.string({
              length: 5,
              pool: 'abcdefghijklmnopqrstuvwxyz0123456789'
            });

            // Hide the code.
            $scope.hideComponents = ['code']
          }
        ],
        view: [
          '$scope',
          'FormioStorageS3',
          '$stateParams',
          'Formio',
          '$http',
          function($scope, FormioStorageS3, $stateParams, Formio, $http) {
            $scope.selfies = [];
            $http.get(appUrl + '/selfie/submission?data.group._id=' + $stateParams.groupId, {
              headers: {
                'x-jwt-token': Formio.getToken()
              }
            }).then(function(result) {
              $scope.selfies = result.data;
            });

            $scope.getSelfie = function(selife, index) {
              FormioStorageS3.getFile(appUrl + '/selfie', selife.data.picture[0]).then(function(file) {
                angular.element('#selfie-image-' + index).attr({
                  src: file.url
                });
              });
            };
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
