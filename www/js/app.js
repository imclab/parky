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

.controller('MapCtrl', function($scope, $rootScope, $location, Auth, Map, Location, FirebaseService){

    $rootScope.modal.hide();
    var geoRef = new Firebase('https://parkyy.firebaseio.com/geo'),
    
    geo = new geoFire(geoRef);

    Location.startTracking();

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
      var lat = Map.currentCoords.latitude;
      var lon = Map.currentCoords.longitude;
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
          var marker = new google.maps.Marker({
            clickable: false,
            position: pos, 
            icon: 'img/sportscar.png',
            map: Map.getMap(),
          });
          FirebaseService.getNextIdAndInc().then(function(id){
            spot = {
              time: new Date().getTime()
            };
            geo.insertByLocWithId([pos.lat(), pos.lng()], id, spot);
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
