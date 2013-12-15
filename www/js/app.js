angular.module('parky', ['ionic', 'firebase', 'ngRoute', 'parky.directives', 'parky.services'])

.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl : 'login.html',
				controller  : 'LoginCtrl'
			})
			.when('/map', {
				templateUrl : 'map.html',
				controller  : 'MapCtrl',
        authRequired: true
			});

    Number.prototype.toRad = function() { return this * (Math.PI / 180); };
})


.controller('LoginCtrl', function($scope, $rootScope, $location, Auth, Modal){
  $scope.loginForm = {};
  $scope.registerForm ={};

  $scope.login = function(data){
    Auth.login(data.email, data.password);
  };

  $scope.register = function(data){
    Auth.signup(data.email, data.password,
      function(error, user){
        if (error) $scope.registerForm.error = error;
        else if (user){
         // $scope.closeModal();
//           $location.path('/map');
        }
      }
    );
  };
  // Load the modal from the given template URL
  Modal.fromTemplateUrl('registermodal.html', function(modal) {
    $rootScope.modal = modal;
  }, {
    // Use our scope for the scope of the modal to keep it simple
    scope: $scope,
    // The animation we want to use for the modal entrance
    animation: 'slide-in-up'
  });

  $scope.openModal = function() {
    $rootScope.modal.show();
  };
  $scope.closeModal = function() {
    $rootScope.modal.hide();
  };

})

.controller('MapCtrl', function($scope, $rootScope, $location, $timeout, Auth, Map, Location, FirebaseService){

    if ($rootScope.modal) $rootScope.modal.hide();

    $scope.spots = [];
    $scope.markers = [];

    var geoRef = new Firebase('https://parkyy.firebaseio.com/geo/geoFire/dataById');  

    $scope.getIcon = function(spot){
      var now = new Date().getTime();
      var timeDelta = (now - spot.time);
      var minute = 60 * 1000;
      if (timeDelta < minute){
        return "img/car-red.png";
      }
      else if (timeDelta < 5 * minute){
        return "img/car-orange.png";
      }
      else if (timeDelta < 10 * minute){
        return "img/car-yellow.png";
      }
      else if (timeDelta < 15 * minute){
        return "img/car-green.png";
      }
      else if (timeDelta < 20 * minute){
        return "img/car-blue.png";
      }
      else {
        FirebaseService.remove(spot.id); 
      }

    };
      
    $scope.updateSpots = function(){
      for (var i = 0; i < markers.length; i++){
        var spot = $scope.spots[i];
        var marker = $scope.markers[i];
      }
    };

    $scope.getDirections = function(id){
      var dirDisplay = new google.maps.DirectionsRenderer();
      var dirService = new google.maps.DirectionsService();
      var pos = Location.getCurrentLocation();
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      for(var i=0; i < $scope.spots.length; i++){
        if ($scope.spots[i].id === id){
          var spot = $scope.spots[i];
        }
      }
      var spotLatLon = new google.maps.LatLng(spot.lat, spot.lng);
      var userLatLon = new google.maps.LatLng(lat, lon);
      var request = {
        origin: userLatLon,
        destination: spotLatLon, 
        travelMode: google.maps.TravelMode.DRIVING
      };

      dirDisplay.setMap(Map.getMap());

      dirService.route(request, function(response, status){
        if (status == google.maps.DirectionsStatus.OK) {
          dirDisplay.setOptions({ preserveViewport: true });
          dirDisplay.setDirections(response);
        }
      });
 
    };

    function getDistance(lat1, lat2, lon1, lon2){
      var R = 6371; // km
      var lat1R = lat1.toRad();
      var lon1R = lon1.toRad();
      var lat2R = lat2.toRad();
      var lon2R = lon2.toRad();
      var d = Math.acos(Math.sin(lat1R)*Math.sin(lat2R) + 
                  Math.cos(lat1R)*Math.cos(lat2R) *
                  Math.cos(lon2R-lon1R)) * R;
      return d;
    };

    $scope.takeSpot = function(id){
      for (var i=0; i < $scope.spots.length; i++){
        if ($scope.spots[i].id === id){
          var spot = $scope.spots[i];
          var currentPos = Location.getCurrentLocation();
          var d = getDistance(currentPos.coords.latitude, spot.lat, currentPos.coords.longitude, spot.lng);
          if (d < 0.1){
            FirebaseService.remove(id); 
            return; 
          }
          alert('You aren\'t close enough to take that spot');
        }
      }
    } 
  
   // setInterval( function(){
    //  alert("one minute"); 
    //}, (60 * 1000));
    
    //no idea why this is necessary, but firebase apparently breaks geolocation
    $scope.$on('mapLoad', function(){

      /*geoRef.once("value", function(snapshot){
        snapshot.forEach(function(spot){
          $scope.spots.push(spot.val());
        });
      }
      */
      geoRef.on('child_added', function(snapshot){
        $scope.spots.push(snapshot.val());
        $scope.$apply();
      });
      geoRef.on('child_removed', function(snapshot){
        var spot = snapshot.val();
        for (var i=0; i<$scope.spots.length; i++){
          if (angular.equals($scope.spots[i], spot)){
            $scope.spots.splice(i, 1); 
            $scope.markers[spot.id].setMap(null);
            $scope.markers[spot.id] = null;
          }
        }
        $scope.$apply();
      });
    });  

    $scope.logout = function(){
      Auth.logout();
      Location.stopTracking();
      $location.path('/');
    };

    $scope.toggleMenu = function() {
      $scope.sideMenuController.toggleLeft();
    };

    $scope.shareSpot = function() {
      var dirDisplay = new google.maps.DirectionsRenderer();
      var dirService = new google.maps.DirectionsService();
      var pos = Location.getCurrentLocation();
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var latLon = new google.maps.LatLng(lat, lon);
      var request = {
        origin: latLon,
        destination: latLon, 
        travelMode: google.maps.TravelMode.DRIVING
      };

      dirDisplay.setMap(Map.getMap());

      // Get directions from a point to itself to get nearest street point
      dirService.route(request, function(response, status){
        if (status == google.maps.DirectionsStatus.OK) {
          dirDisplay.setOptions({ preserveViewport: true });
          pos = response.routes[0].legs[0].start_location;
          FirebaseService.getNextIdAndInc().then(function(id){
            spot = {
              time: new Date().getTime(),
              lat: pos.lat(),
              lng: pos.lng(),
              id: id
            };
            FirebaseService.insertWithId(pos, id, spot); 
          }); 

        }
      });
      $scope.snapToLocation();
       
    };
    
    $scope.snapToLocation = function(){
      Map.getMap().panTo(new google.maps.LatLng(Map.currentCoords.latitude, Map.currentCoords.longitude)); 
    }

    $scope.$on('locationChange', function(coords){
      Map.updateUserLocation(coords.latitude, coords.longitude);
    });

})
