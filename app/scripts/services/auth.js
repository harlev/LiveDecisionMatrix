angular.module('decisionMatrixApp')
  .factory('Auth', ['$firebaseAuth','FBURL', function($firebaseAuth, FBURL) {
    var ref = new Firebase(FBURL);
    return $firebaseAuth(ref);
  }]);
