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

    signup: function(email, password, cb){
      angularFireAuth.createUser(email, password, cb);
    }
  }
}])


.factory('FirebaseService', function($q){
  var idRef = new Firebase('https://parkyy.firebaseio.com/idCount');
  var geoRef = new Firebase('https://parkyy.firebaseio.com/geo'),  
  geo = new geoFire(geoRef);


  return {

    insertWithId: function(pos, id, spot){
      geo.insertByLocWithId([pos.lat(), pos.lng()], id, spot);
    },

    getNextIdAndInc: function(){
      var defer = $q.defer();
      var currentId = 0;
      var updated = false;
     
      var update = function(){
        updated = true;
        idRef.transaction(function(currentVal){
          return currentVal + 1;
        });
      };

      idRef.on('value', function(snapshot){
        currentId = snapshot.val();
        updated || update();
        defer.resolve(currentId);
      });
            
      return defer.promise;
    }
  }
})

.service('Location', function($rootScope, $q){

  var watchId;
  var currentPos = null;

  this.getCurrentLocation = function(){
    return currentPos;
  };

  this.getLocation = function(){
    var defer = $q.defer();

    navigator.geolocation.getCurrentPosition(
      function(position) {
        defer.resolve(position);
      },
      function(error) {
        defer.reject(error);
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0}
    );

    return defer.promise;
  };

  
  this.startTracking = function(){
    var defer = $q.defer();
    watchId = navigator.geolocation.watchPosition(
      function(pos){
        $rootScope.$broadcast("locationChange", {
          coords: pos.coords
        });
        currentPos = pos;
      },
      function(error){
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
          case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  };

  this.stopTracking = function(){
    navigator.geolocation.clearWatch(watchId);
  };

})

.service('Map', function(){

  var _map;
  var userMarker;

  this.setMap = function(map){
    _map = map;
  };

  this.getMap = function(){
    return _map;
  }

  this.setUserLocation = function(lat, lon){
    userMarker = new google.maps.Marker({
      clickable: false,
      position: new google.maps.LatLng(lat, lon), 
      icon: {
        url: 'http://maps.gstatic.com/mapfiles/mobile/mobileimgs1.png',
        size: new google.maps.Size(22, 22),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,11) 
      },
      map: _map,
    });
    this.currentCoords = {latitude: lat, longitude: lon};
  }

  this.updateUserLocation = function(lat, lon){
    if (!_map) return;
    userMarker = new google.maps.Marker({
      clickable: false,
      position: new google.maps.LatLng(lat, lon), 
      icon: {
        url: 'http://maps.gstatic.com/mapfiles/mobile/mobileimgs1.png',
        size: new google.maps.Size(22, 22),
        origin: new google.maps.Point(0,0),
        anchor: new google.maps.Point(0,11) 
      },
      map: _map,
    }); 
    this.currentCoords = {latitude: lat, longitude: lon};
  }

})
