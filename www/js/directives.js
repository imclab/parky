angular.module('parky.directives', ['parky.services'])

.directive("googleMap", function($rootScope, $compile, Map, Location, FirebaseService) {

  return {
    restrict: 'A',
    link: function(scope, element, attrs, ctrl){
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

      Location.getLocation().then(
        function(pos){
          var lat = pos.coords.latitude;
          var lon = pos.coords.longitude;
          mapOptions.center = new google.maps.LatLng(lat, lon);
          map = new google.maps.Map(element[0], mapOptions);
          Map.setMap(map);
          Map.setUserLocation(lat, lon);
          var searchBox = new google.maps.places.SearchBox(document.getElementById('searchbox'));
          google.maps.event.addListener(searchBox, 'places_changed', function() {
            var place = searchBox.getPlaces();
            scope.goToSearch(place[0].geometry.location);
          });
          $rootScope.$broadcast('mapLoad');
          //Location.startTracking();
          //google.maps.event.addListenerOnce(Map.getMap(), 'idle', function(){});
        },
        function(error){
          alert(error.code + ": "+ error.message);
        }
      );

      element.bind('mousedown', function(e){
        e.preventDefault();
      });

      

    }
  }
})


