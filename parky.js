/* USE BACKFIRE */

var geoRef = new Firebase('https://parkyy.firebaseio.com/geodata'),
    geo = new geoFire(geoRef);

var center = [43.078825,-89.391957]


function initialize() {
    var mapOptions = {
      center: new google.maps.LatLng(center[0],center[1]),
      zoom: 13,
      disableDefaultUI: true,
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
    }
]
    };
    var map = new google.maps.Map(document.getElementById("map-canvas"),
        mapOptions);

    google.maps.event.addListener(map, 'click', function(data){
        var lat = data.latLng.lat();
        var lng = data.latLng.lng();
        
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lng),
            icon: 'sportscar.png',
            map: map
        });

        geo.insertByLoc([lat, lng], {lat: lat, lon: lng});        
    });

    google.maps.event.addListener(map, 'dragend', function(){
        getMarkers();
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
        getMarkers();
    });

    google.maps.event.addListener(map, 'zoom_changed', function(){
      getMarkers();
    });

    function getMarkers(){
      if (map.getZoom() < 13) return;
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
google.maps.event.addDomListener(window, 'load', initialize);

function clearMarkers(){
  geoRef.remove(function(error){
    if (error) alert('couldn\'t clear markers');
    else
      window.location.reload();
  });
}

