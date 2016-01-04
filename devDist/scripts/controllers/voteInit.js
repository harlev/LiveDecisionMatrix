'use strict';

angular.module('decisionMatrixApp')
  .controller('VoteInitCtrl', ['$location','$route','$routeParams','matrixService',
    function ($location, $route, $routeParams, matrixService) {

      var matrixId = $routeParams.matrixId;

      matrixService.checkIfLoggedIn(function(userId){
        matrixService.storeMatrixIdForUser(userId, matrixId, 'voter','');

        $location.path('/voter');
        $route.reload();
      });
  }]);
