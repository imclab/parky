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

.factory('getLocation', function($q){
  return function(){
    var defer = $q.defer();

      navigator.geolocation.getCurrentPosition(
        function(position) {
          defer.resolve(position);
        },
        function(error) {
          defer.reject(error);
        },
        { enableHighAccuracy: true }
      );

      return defer.promise;
  }
})

.factory('Map', function(){

  var latitude, longitude, map;

  this.setMap = function(map){
    this.map = map;
  };

  this.getMap = function(){
    return map;
  }

  
})
