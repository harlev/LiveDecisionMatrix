'use strict';

/**
 * @ngdoc function
 * @name decisionMatrixApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the decisionMatrixApp
 */
angular.module('decisionMatrixApp')
  .controller('MainCtrl', ['$scope','$location','$route','matrixService', function ($scope, $location, $route, matrixService) {

    $scope.initMatrix = function() {
      matrixService.initMatrix(location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: ''), initCallback);
    };

    function initCallback() {
      $location.path('/matrix');
      $route.reload();
    }
  }]);
