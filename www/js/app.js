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

.controller('MapCtrl', function($scope, $rootScope, $location, $timeout, $compile, Auth, Map, Location, FirebaseService){

    if ($rootScope.modal) $rootScope.modal.hide();

    $scope.spots = {};

    var geoRef = new Firebase('https://parkyy.firebaseio.com/geo/geoFire/dataById');  

    function getTimeDelta(spot){
      var now = new Date().getTime();
      return (now - spot.time);
    }

    $scope.getIcon = function(spot){
      var timeDelta = getTimeDelta(spot);
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
        return null;
      }
    };
      
    $scope.updateSpots = function(){
      for (var i in $scope.spots){
        var spot = $scope.spots[i];
        var marker = spot.marker;
        var icon = $scope.getIcon(spot); 
        if (!icon){
          FirebaseService.remove(spot.id);
        }
        else {
          marker.setIcon(icon);
          spot.age = getTimeDelta(spot);
        }
      }
    };
    
    setInterval(function(){
      $scope.updateSpots(); 
    }, 60000);

    var spotDirDisplay;
    var spotDirService;
    var dirSet = false;

    $scope.getDirections = function(id){
      if (dirSet) spotDirDisplay.setMap(null);
      spotDirDisplay = new google.maps.DirectionsRenderer();
      spotDirService = new google.maps.DirectionsService();
      var pos = Location.getCurrentLocation();
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var spot = $scope.spots[id];
      var spotLatLon = new google.maps.LatLng(spot.lat, spot.lng);
      var userLatLon = new google.maps.LatLng(lat, lon);
      var request = {
        origin: userLatLon,
        destination: spotLatLon, 
        travelMode: google.maps.TravelMode.DRIVING
      };

      spotDirDisplay.setMap(Map.getMap());

      spotDirService.route(request, function(response, status){
        if (status == google.maps.DirectionsStatus.OK) {
          spotDirDisplay.setOptions(
            { 
              preserveViewport: true,
              suppressMarkers: true
            }
          );
          spotDirDisplay.setDirections(response);
          dirSet = true;
        }
      });
 
    };

    $scope.clearDirections = function(){
      if (dirSet) spotDirDisplay.setMap(null);
    }
    

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
      var spot = $scope.spots[id];
      var currentPos = Location.getCurrentLocation();
      var d = getDistance(currentPos.coords.latitude, spot.lat, currentPos.coords.longitude, spot.lng);
      if (d < 0.1){
        FirebaseService.remove(id); 
        return; 
      }
      alert('You aren\'t close enough to take that spot');
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
        var spot = snapshot.val();
        var icon = $scope.getIcon(spot);
        var map = Map.getMap();
        if (icon){
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(spot.lat, spot.lng), 
            icon: icon,
            map: map,
          });
          spot.marker = marker;
          var infoWindowContent = "<div><div>Age: "+ Math.round(((new Date().getTime()) - spot.time) / (60*1000)) + " minutes</div>" +
                                  "<button ng-click=\"takeSpot(" + spot.id + ")\">Take Spot</button><br>" + 
                                  "<button ng-click=\"getDirections(" + spot.id + ")\">Get Directions</button></div>";
          var e = angular.element(infoWindowContent);

          var compiled = $compile(e)($scope);
          var infoWindow = new google.maps.InfoWindow({
            content: compiled[0]
          });
          google.maps.event.addListener(marker, 'click', function(){
            if ($scope.currentInfoWindow) {
              $scope.currentInfoWindow.close();
            }
            infoWindow.open(map, marker);
            $scope.currentInfoWindow = infoWindow;
          });
          $scope.spots[spot.id] = spot;
          $scope.$apply();
        }
        else {
          FirebaseService.remove(spot.id);
        } 
      });

      geoRef.on('child_removed', function(snapshot){
        var spot = snapshot.val();
        $scope.spots[spot.id].marker.setMap(null);
        $scope.spots[spot.id].marker = null;
        delete $scope.spots[spot.id]; 
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
              marker: null,
              age: 0, 
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
      var pos = Location.getCurrentLocation();
      Map.getMap().panTo(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)); 
    }

    //position will be a google maps LatLng object
    $scope.goToSearch = function(position){
      Map.getMap().panTo(position); 
    }

    $scope.$on('locationChange', function(coords){
      Map.updateUserLocation(coords.latitude, coords.longitude);
    });

    var five_min = 60 * 1000 * 5;
    $scope.testSpots = {};




    $scope.loadTestData = function(){
          $scope.testSpots[1000] = {
        time: new Date().getTime(),
        marker: null,
        age: 0, 
        lat: 43.078192101598844,
        lng: -89.39098415896297,
        id: 1000
    }
    $scope.testSpots[1001] = {
        time: new Date().getTime() - (3*five_min),
        marker: null,
        age: 0, 
        lat: 43.07686770509459,
        lng: -89.39428864046931,
        id: 1001
    }
    $scope.testSpots[1002] = {
        time: new Date().getTime(),
        marker: null,
        age: 0, 
        lat: 43.07580973465829,
        lng: -89.39132748171687,
        id: 1002
    }
    $scope.testSpots[1003] = {
        time: new Date().getTime() - five_min,
        marker: null,
        age: 0, 
        lat: 43.07449912396163,
        lng: -89.3816608004272,
        id: 1003
    }
    $scope.testSpots[1004] = {
        time: new Date().getTime() - (2*five_min),
        marker: null,
        age: 0, 
        lat: 43.07208526400504,
        lng: -89.38578067347407,
        id: 1004
    }
    $scope.testSpots[1005] = {
        time: new Date().getTime() - five_min,
        marker: null,
        age: 0, 
        lat: 43.068856185801714,
        lng: -89.39290462061763,
        id: 1005
    }
    $scope.testSpots[1006] = {
        time: new Date().getTime() - 60001,
        marker: null,
        age: 0, 
        lat: 43.07380945938997,
        lng: -89.39213214442134,
        id: 1006
    }
    $scope.testSpots[1007] = {
        time: new Date().getTime() - (2 * five_min),
        marker: null,
        age: 0, 
        lat: 43.07205391454905,
        lng: -89.41393313929439,
        id: 1007
    }
    $scope.testSpots[1008] = {
        time: new Date().getTime() - 60001,
        marker: null,
        age: 0, 
        lat: 43.07556495394268,
        lng: -89.40075812861323,
        id: 1008
    }
    $scope.testSpots[1009] = {
        time: new Date().getTime(),
        marker: null,
        age: 0, 
        lat: 43.07584708230531,
        lng: -89.39801154658198,
        id: 1009
    }
    $scope.testSpots[1010] = {
        time: new Date().getTime() - 60001,
        marker: null,
        age: 0, 
        lat: 43.07239875768307,
        lng: -89.39741073176265,
        id: 1010
    }
    $scope.testSpots[1011] = {
        time: new Date().getTime() - five_min,
        marker: null,
        age: 0, 
        lat: 43.07139557226882,
        lng: -89.39599452540278,
        id: 1011
    }
    $scope.testSpots[1012] = {
        time: new Date().getTime() - (3*five_min),
        marker: null,
        age: 0, 
        lat: 43.07274359887679,
        lng: -89.40067229792476,
        id: 1012
    }
    $scope.testSpots[1013] = {
        time: new Date().getTime() - (3*five_min),
        marker: null,
        age: 0, 
        lat: 43.07656807110861,
        lng: -89.40839705988765,
        id: 1013
    }
    $scope.testSpots[1014] = {
        time: new Date().getTime(),
        marker: null,
        age: 0, 
        lat: 43.0752201286244,
        lng: -89.40689502283931,
        id: 1014
    }
    $scope.testSpots[1015] = {
        time: new Date().getTime() - five_min + 10,
        marker: null,
        age: 0, 
        lat: 43.07280629706716,
        lng: -89.40689502283931,
        id: 1015
    }
    $scope.testSpots[1016] = {
        time: new Date().getTime() - five_min,
        marker: null,
        age: 0, 
        lat: 43.07280629706716,
        lng: -89.40689502283931,
        id: 1016
    }
    $scope.testSpots[1017] = {
        time: new Date().getTime() - (3*five_min),
        marker: null,
        age: 0, 
        lat: 43.07180311832376,
        lng: -89.41161571070552,
        id: 1017
    }
    $scope.testSpots[1018] = {
        time: new Date().getTime() - (five_min - 10),
        marker: null,
        age: 0, 
        lat: 43.071583670784776,
        lng: -89.4074529223144,
        id: 1018
    }
    $scope.testSpots[1019] = {
        time: new Date().getTime() - 60001,
        marker: null,
        age: 0, 
        lat: 43.06800970026609,
        lng: -89.41041408106685,
        id: 1019
    }
    $scope.testSpots[1020] = {
        time: new Date().getTime(),
        marker: null,
        age: 0, 
        lat: 43.06970265964738,
        lng: -89.40689502283931,
        id: 1020
    }
      for (var i in $scope.testSpots){
        var spot = $scope.testSpots[i];
        FirebaseService.insertWithId([spot.lat, spot.lng], spot.id, spot);
      }
    };

    $scope.removeTestData = function(){
      for (var i in $scope.testSpots){
        var id = $scope.testSpots[i].id;
        FirebaseService.remove(id);
        delete $scope.testSpots[i];
      }
    }

})
