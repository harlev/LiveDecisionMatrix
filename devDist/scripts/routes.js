'use strict';

angular.module('decisionMatrixApp')
  .run(['$rootScope','$location','$route','Auth','editableOptions', function($rootScope, $location, $route, Auth, editableOptions) {

    editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'

    $rootScope.$on('$routeChangeError', function(event, next, previous, error) {
      if (error === 'AUTH_REQUIRED') {
        $location.path('/home');
      }

    });

    kivo.enableAnnotations();
}]);

angular.module('decisionMatrixApp')

  // configure views; the authRequired parameter is used for specifying pages
  // which should only be available while logged in
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })

      .when('/chat', {
        templateUrl: 'views/chat.html',
        controller: 'ChatCtrl'
      })

      .when('/matrix', {
        templateUrl: 'views/matrix.html',
        controller: 'MatrixCtrl'
      })

      .when('/voter', {
        templateUrl: 'views/voter.html',
        controller: 'VoterCtrl',
        resolve: {
          currentAuth: ['Auth', function(Auth) {
            return Auth.$requireAuth();
          }]
        }
      })

      .when('/vote/:matrixId', {
        templateUrl: 'views/voteinit.html',
        controller: 'VoteInitCtrl'
      })

      .otherwise({redirectTo: '/'});
  }]);
