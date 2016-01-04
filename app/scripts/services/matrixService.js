/*jshint bitwise: false*/
/*jshint unused: vars */
'use strict';

angular.module('decisionMatrixApp')
  .factory('matrixService', ['$firebase','$http','Auth','FBURL','GoogleApiKey', function($firebase, $http, Auth, FBURL, GoogleApiKey) {

    function initMatrix(appUrl, callback) {
      checkIfLoggedIn(function(userId) {
        generateUID(function(matrixId){
          shortenUrl(appUrl + '/#/vote/' + matrixId,function(shortUrl) {
            storeMatrixIdForUser(userId, matrixId, 'owner', shortUrl);
            addInitialItemsToMatrix(matrixId);
            callback(matrixId);
          });
        });
      });
    }

    function addInitialItemsToMatrix(matrixId) {
      addCriterion(matrixId);
      addCriterion(matrixId);
      addAlternative(matrixId);
      addAlternative(matrixId);
    }

    function storeMatrixIdForUser(userId, matrixId, role, shortUrl){
      var userRef = new Firebase(FBURL).child('users').child(userId);
      var userSync = $firebase(userRef);
      if (shortUrl === undefined || shortUrl === '') {
        userSync.$update({currentMatrix: matrixId, 'role': role});
      }
      else {
        userSync.$update({currentMatrix: matrixId, 'role': role, 'shortUrl': shortUrl});
      }
    }

    function getMatrixIdForUser(userId, callback){
      var userRef = new Firebase(FBURL).child('users').child(userId);
      var userObj = $firebase(userRef).$asObject();
      userObj.$loaded().then(function (data) {
        callback(data.currentMatrix, data.shortUrl);
      });
    }


    function checkIfLoggedIn(callback) {
      var authData = Auth.$getAuth();
      if (authData === null) {
        Auth.$authAnonymously().then(function (authData) {
          console.log('Logged in as:', authData.uid);
          // create user entry
          var userRef = new Firebase(FBURL).child('users').child(authData.uid);
          var userSync = $firebase(userRef);
          userSync.$set('created',Firebase.ServerValue.TIMESTAMP);

          callback(authData.uid);
        }).catch(function (error) {
          console.error('Authentication failed:', error);
        });
      } else {
        callback(authData.uid);
      }
    }

    function generateUID(callback) {
      var uid = ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);//.toUpperCase();

      checkIfUIDexists(uid, callback);
    }

    function checkIfUIDexists(uid, callback) {
      var matrixRef = new Firebase(FBURL).child('instances').child(uid);
      matrixRef.once('value', function(snapshot) {
        var exists = (snapshot.val() !== null);
        uidExistsCallback(uid, exists, callback);
      });
    }

    function shortenUrl(origUrl, callback){
      $http.post('https://www.googleapis.com/urlshortener/v1/url?key=' + GoogleApiKey, {'longUrl': origUrl}).
        success(function(data, status, headers, config) {
          callback(data.id);
        }).
        error(function(data, status, headers, config) {
          // called asynchronously if an error occurs
          // or server returns response with an error status.
        });
    }

    function uidExistsCallback(uid, exists, callback) {
      if (exists) {
        generateUID(callback);
      } else {
        callback(uid);
      }
    }

    function addCriterion(instanceName) {
      var ref = new Firebase(FBURL).child('instances').child(instanceName).child('criteria');
      var criteriaArr = $firebase(ref).$asArray();
      getNewObjectCount(instanceName, 'criteria', function(newCount) {
        criteriaArr.$add({name:'criteria ' + newCount});
      });
    }

    function addAlternative(instanceName) {
      var ref = new Firebase(FBURL).child('instances').child(instanceName).child('alternatives');
      var alternativeArr = $firebase(ref).$asArray();
      getNewObjectCount(instanceName, 'alternatives', function(newCount) {
        alternativeArr.$add({name:'alternative ' + newCount});
      });
    }

    function getNewObjectCount(instanceName, objectName, callback) {
      var ref = new Firebase(FBURL).child('instances').child(instanceName).child(objectName + 'Count');
      var criteria = $firebase(ref);
      criteria.$transaction(function(currentCount) {
        if (!currentCount) {return 1;}   // Initial value for counter.
        if (currentCount < 0) {return;}  // Return undefined to abort transaction.
        return currentCount + 1;       // Increment the count by 1.
      }).then(function(snapshot) {
        if (snapshot === null) {
          // Handle aborted transaction.
        } else {
          callback(snapshot.val());
        }
      }, function(error) {
        console.log('Error:', error);
      });
    }

    return {
      initMatrix: initMatrix,
      generateUID: generateUID,
      addCriterion: addCriterion,
      addAlternative: addAlternative,
      getMatrixIdForUser: getMatrixIdForUser,
      storeMatrixIdForUser: storeMatrixIdForUser,
      checkIfLoggedIn: checkIfLoggedIn,
      shortenUrl: shortenUrl
    };
  }]);
