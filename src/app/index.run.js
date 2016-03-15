(function() {
  'use strict';

  angular
    .module('groupselfie')
    .run(runBlock);

  /** @ngInject */
  function runBlock(FormioAuth) {
    FormioAuth.init();
  }
})();
