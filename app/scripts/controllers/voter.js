'use strict';

angular.module('decisionMatrixApp')
  .controller('VoterCtrl', ['$scope','$firebase','$timeout','$rootScope','FBURL','currentAuth','matrixService', function ($scope, $firebase, $timeout, $rootScope, FBURL, currentAuth, matrixService) {
    console.log('Already logged in as:', currentAuth.uid);

    var instanceName;
    matrixService.getMatrixIdForUser(currentAuth.uid,function(matrixId) {
      instanceName = matrixId;

      var ref = new Firebase(FBURL).child('instances').child(instanceName);
      $scope.alternatives = $firebase(ref.child('alternatives')).$asArray();
      $scope.criteria = $firebase(ref.child('criteria')).$asArray();
    });




    $scope.saveAlternative = function(alternative) {
      $scope.alternatives.$save(alternative);
    };

    $scope.getUser = function() {
      return currentAuth.uid;
    };

    $scope.logout = function() {
      var myRef = new Firebase(FBURL);
      myRef.unauth();
      //currentAuth.$unauth();
    };

    $scope.layoutDone = function() {
      $('input.slider').slider();
      $('input.slider').on('change', function(slideEvt) {
        var criteriaId = $(slideEvt.currentTarget).attr('criteriaid');
        $('#' + criteriaId).val(slideEvt.value.newValue);
        $('#' + criteriaId).trigger('input');
      });

    };


    $timeout(function() {
      try {
        for (var i = 0; i < $scope.alternatives.length; i++) {
          for (var j = 0; j < $scope.criteria.length; j++) {
            var alternative = $scope.alternatives[i].$id;
            var criterion = $scope.criteria[j].$id;

            var mySlider = $("[criteriaid='" + alternative + criterion + "']").slider('setValue', parseInt($scope.alternatives[i].criteria[criterion].votes[$scope.getUser()]));
          }
        }
      }
      catch(err) {
        console.log('failed to init sliders to server values:' + err.message);
      }
    },1000);
  }]);

angular.module('decisionMatrixApp')
  .directive('repeatDone', function() {
    return function(scope, element, attrs) {
      if (scope.$last) { // all are rendered
        scope.$eval(attrs.repeatDone);
      }
    };
  });
