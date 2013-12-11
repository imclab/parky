angular.module('parky.directives', ['parky.services'])

.directive("googleMap", function() {

  /*
    var watchId = navigator.geolocation.watchPosition(
      function(pos){
        position = pos;
        if (scope.centerOnUser) map.setCenter(pos);
      },
      function(error){
        alert(error);
      }
    );

    var geoRef = new Firebase('https://parkyy.firebaseio.com/geodata'),
    geo = new geoFire(geoRef);

    google.maps.event.addListener(map, 'dragend', function(){
        //getMarkers();
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
       getMarkers();
    });

    function getMarkers(){
      geo.getPointsNearLoc([position.coords.latitude, position.coords.latitude], 5, function(points) {
        for (var i = 0; i < points.length; i++){
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(points[i].lat, points[i].lon),
            icon: 'img/sportscar.png',
            map: map
          });
        }
      });
    } */
  
  return {
    restrict: 'A',
    controller: function($scope, $rootScope, Map, Location){
      this.getLocation = Location.getLocation;
      this.Map = Map;
    },
    link: function(scope, element, attrs, ctrl){

      console.log('in map directive');
      var map;
      var mapOptions = {
        zoom: 15,
        disableDefaultUI: true,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
              "featureType": "water",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "color": "#acbcc9"
                  }
              ]
          },
          {
              "featureType": "landscape",
              "stylers": [
                  {
                      "color": "#f2e5d4"
                  }
              ]
          },
          {
              "featureType": "road.highway",
              "elementType": "geometry",
              "stylers": [
                  {
                      "color": "#c5c6c6"
                  }
              ]
          },
          {
              "featureType": "road.arterial",
              "elementType": "geometry",
              "stylers": [
                  {
                      "color": "#e4d7c6"
                  }
              ]
          },
          {
              "featureType": "road.local",
              "elementType": "geometry",
              "stylers": [
                  {
                      "color": "#fbfaf7"
                  }
              ]
          },
          {
              "featureType": "poi.park",
              "elementType": "geometry",
              "stylers": [
                  {
                      "color": "#c5dac6"
                  }
              ]
          },
          {
              "featureType": "administrative",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "lightness": 33
                  }
              ]
          },
          {
              "featureType": "road"
          },
          {
              "featureType": "poi.park",
              "elementType": "labels",
              "stylers": [
                  {
                      "visibility": "on"
                  },
                  {
                      "lightness": 20
                  }
              ]
          },
          {},
          {
              "featureType": "road",
              "stylers": [
                  {
                      "lightness": 20
                  }
              ]
          },
          {
              "featureType": "poi",
              "elementType": "labels",
              "stylers": [
                  {
                      "visibility": "off"
                  }
              ]
          }
        ]
      };

      ctrl.getLocation().then(
        function(pos){
          var lat = pos.coords.latitude;
          var lon = pos.coords.longitude;
          mapOptions.center = new google.maps.LatLng(lat, lon);
          map = new google.maps.Map(element[0], mapOptions);
          ctrl.Map.setMap(map);
          ctrl.Map.setUserLocation(lat, lon);
          google.maps.event.addListenerOnce(ctrl.Map.getMap(), 'idle', function(){
        alert("map loaded");
      });
        },
        function(error){
          alert(error);
        }
      );

      element.bind('mousedown', function(e){
        e.preventDefault();
      });


    }
  }
})


