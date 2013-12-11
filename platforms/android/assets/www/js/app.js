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
      console.log('config');
})


.controller('LoginCtrl', function($scope, Auth){
  $scope.loginForm = {};

  $scope.login = function(data){
    Auth.login(data.email, data.password);
  };

})

.controller('MapCtrl', function($scope, $location, Auth, Map, Location){

    Location.startTracking();

    $scope.logout = function(){
      Auth.logout();
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
      dirService.route(request, function(response, status){
        if (status == google.maps.DirectionsStatus.OK) {
          dirDisplay.setOptions({ preserveViewport: true });
          var marker = new google.maps.Marker({
            clickable: false,
            position: response.routes[0].legs[0].start_location, 
            icon: 'img/sportscar.png',
            map: Map.getMap(),
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
