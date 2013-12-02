angular.module('parky.directives', [])

.directive("googleMap", function() {

  function initialize(pos, element) {
    var mapOptions = {
      center: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
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
    var map = new google.maps.Map(element[0], mapOptions);

    google.maps.event.addListener(map, 'dragend', function(){
        //getMarkers();
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
       // getMarkers();
    });

  /*  google.maps.event.addDomListener(map, 'mousedown', function(e) {
           e.preventDefault();
           return false;
         });
*/
    function getMarkers(){
      geo.getPointsNearLoc(center, 5, function(points) {
        for (var i = 0; i < points.length; i++){
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(points[i].lat, points[i].lon),
            icon: 'sportscar.png',
            map: map
          });
        }
      });
    }
}
  
  return {
    restrict: 'A',
    link: function(scope, element, attrs){

      element.bind('mousedown', function(e){
        e.preventDefault();
      });

      navigator.geolocation.getCurrentPosition(
        function(pos){
          initialize(pos, element);
        },
        function(error){
          alert('Could not determine your location: ' + error.message);
        },
        { enableHighAccuracy: true }
      );

      
    }
  }
})