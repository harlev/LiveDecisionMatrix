/*jshint bitwise: false*/
'use strict';

angular.module('decisionMatrixApp')
  .controller('MatrixCtrl', ['$scope','$firebase','FBURL','matrixService','Auth', function ($scope, $firebase, FBURL, matrixService, Auth) {
    var instanceName;
     getMatrixId(function(matrixId, shortUrl) {
       instanceName = matrixId;
       $scope.matrixId = instanceName;
       var ref = new Firebase(FBURL).child('instances').child(instanceName);

       $scope.alternatives = $firebase(ref.child('alternatives')).$asArray();
       $scope.criteria = $firebase(ref.child('criteria')).$asArray();

       $scope.pageAddress = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
       $scope.shortUrl = shortUrl;
     });

    $scope.alternativeTotal = function(alternative) {
      var total = 0;
      if (alternative.criteria === undefined)
      { return 0;}

      for (var criterionId in alternative.criteria) {
        total += $scope.criteriaTotal(alternative, criterionId);
      }
      return total;
    };

    $scope.criteriaTotal = function(alternative, criterionId) {
      var total = 0;
      if (alternative.criteria !== undefined && alternative.criteria[criterionId] !== undefined) {
        for (var vote in alternative.criteria[criterionId].votes) {
          var value = alternative.criteria[criterionId].votes[vote];
          total += isNumber(value) ? parseInt(alternative.criteria[criterionId].votes[vote]) : 0;
        }
      }
      return total;
    };

    $scope.addCriterion = function() {
      matrixService.addCriterion(instanceName);
    };

    $scope.addAlternative = function() {
      matrixService.addAlternative(instanceName);
    };

    $scope.updateAfterAlternativesEdit = function(alternative) {
      $scope.alternatives.$save(alternative);
    };

    $scope.updateAfterCriterionEdit = function(criterion) {
      $scope.criteria.$save(criterion);
    };

    function getMatrixId(callback) {
      var userId = Auth.$getAuth().uid;
      return matrixService.getMatrixIdForUser(userId, function(matrixId, shortUrl) {
        callback(matrixId, shortUrl);
      });
    }

    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

  }]);
