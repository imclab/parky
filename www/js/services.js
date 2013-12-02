angular.module('parky.services', ['firebase'])

.factory('Auth', ['$rootScope', '$location', 'angularFireAuth', function($rootScope, $location, angularFireAuth){

  var ref = new Firebase('https://parkyy.firebaseio.com');    
  angularFireAuth.initialize(ref, {
    scope: $rootScope,
    name: 'user',
    path: '/',
    callback: function(err, user){
      if (err) $rootScope.error = err;
      else if (user){
         $location.path('/map');
      }
    }
  });

  return {
    login: function(email, password){
      return angularFireAuth.login('password', {
        email: email,
        password: password
      });
    },

    logout: function(){
      return angularFireAuth.logout();
    },

    signup: function(email, password){
      angularFireAuth.createUser(email, password, function(err, user){
        if (err) $rootScope.error = err;
      });
    }
  }
}])

.factory('getLocation', function($scope){
  return function(){
    var q = $q.defer();

      navigator.geolocation.getCurrentPosition(function(position) {
        q.resolve(position);
      }, function(error) {
        q.reject(error);
      });

      return q.promise;
  }
})
