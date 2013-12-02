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
			})
})


.controller('LoginCtrl', function($scope, Auth){
  $scope.loginForm = {};

  $scope.login = function(data){
    Auth.login(data.email, data.password);
  };

})

.controller('MapCtrl', function($scope, $location, Auth, Map){

    $scope.logout = function(){
      Auth.logout();
      $location.path('/');
    };

    $scope.toggleMenu = function() {
      $scope.sideMenuController.toggleLeft();
    };

    $scope.blah = function() {
      alert(Map.getMap());
    };
    
    $scope.$on('locationChange', function(coords){
      Map.updateUserLocation(coords.latitude, coords.longitude);
    });

})
