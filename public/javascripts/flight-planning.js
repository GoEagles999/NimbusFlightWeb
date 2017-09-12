// google maps object
var map
//string for tracking when button was last clicked
var lastButtonClickedString = ''
//initiate google maps function
function initMap() {
  var polygon
  var markerPosition
  var polygonPoints = new Array()
  var markersArray = new Array()
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 51.509, lng: -.118},
    zoom: 15,
    mapTypeId: 'satellite',
    disableDefaultUI: true
  })
  //pushing google places autocomplete to UI
  var input = document.getElementById('pac-input')
  var types = document.getElementById('type-selector')
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(types)
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(input)
  
  var autocomplete = new google.maps.places.Autocomplete(input)
  autocomplete.bindTo('bounds', map)
  autocomplete.addListener('place_changed', function() {
    var place = autocomplete.getPlace()
    if (!place.geometry) {
      // User entered the name of a Place that was not suggested and
      // pressed the Enter key, or the Place Details request failed.
      //window.alert("No details available for input: '" + place.name + "'")
      //check if person is trying to search gps coordinates before failing
      var latlngValues = document.getElementById('pac-input').value
      var placeLatLng = latlngValues.split(',')
      if (checkGPSValidity(Number(placeLatLng[0]), Number(placeLatLng[1]))){
        //if gps is valid, zoom to coordinates 
        map.setCenter({lat: Number(placeLatLng[0]), lng: Number(placeLatLng[1])});
      }      
      return
    }
    // If the place has a geometry, then present it on a map.
    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport)
    } else {
      map.setCenter(place.geometry.location)
      map.setZoom(17);  // Why 17? Because it looks good.
    }
    var address = ''
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name || ''),
        (place.address_components[1] && place.address_components[1].short_name || ''),
        (place.address_components[2] && place.address_components[2].short_name || '')
      ].join(' ')
    }
  })
  map.addListener('click', function(event) {
    //add points to array
    polygonPoints.push(event.latLng)
    //Clear Markers and Polygons
    clearMarkers()
    if (polygonPoints.length>2) {
      clearPolygon()
    }
    addMarkers()
    addPolygon()
  })
  //function for adding markers
  function addMarkers() {
    for (var i=0; i < polygonPoints.length; i++){
      var marker = new google.maps.Marker({
        position: polygonPoints[i],
        map: map
      })
    marker.setDraggable(true)
    //turn on listeners
    markerClickAndDragListener(marker)
    markersArray.push(marker)
    }
  }
  function addPolygon() {
    polygon = new google.maps.Polygon({
      paths: polygonPoints,
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35
    })
    polygon.setMap(map)
  }
  function markerClickAndDragListener(markerobject){
    google.maps.event.addListener(markerobject, 'dragstart', function(evt) {
      console.log("marker started to be dragged");
      //update array positions
      for (var x=0;x<polygonPoints.length;x++){
        if (polygonPoints[x] == markerobject.getPosition()){
          markerPosition = x
        }
      }
    })
    google.maps.event.addListener(markerobject, 'drag', function(evt) {
      polygonPoints[markerPosition] = markerobject.getPosition()
      //on drag delete polygons 
      clearPolygon()
      //add polygons
      addPolygon()
    })
    google.maps.event.addListener(markerobject, 'dragend', function(evt) {
      console.log("marker ended to be dragged");
      //on drag delete polygon 
      clearPolygon()
      //add new polygon
      addPolygon()
    })
    google.maps.event.addListener(markerobject, 'click', function(evt) {
      //remove marker and lat/lng position from array
      for (var j=0; j<polygonPoints.length; j++){
        if (polygonPoints[j]==markerobject.getPosition()){
          polygonPoints.splice(j, 1)
          markersArray.splice(j, 1)
        }
      }
      //on click delete marker, this temporarily clears all markers off 
      clearMarkers()
      clearPolygon()
      //add new markers and polygons
      addMarkers()
      addPolygon() 
    })
  }
  function displayMarkersOn(map) {
    //step through each marker and call setMap()
    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(map)
    }
  }
  function clearMarkers() {
    displayMarkersOn(null)
  }
  function clearPolygon(){
    polygon.setMap(null)
  }
  //overlaying .tif image on map
  var overlay;
  var imageBounds = {
    north: 51.52,
    south: 51.49,
    east: 10,
    west: -.119
  }
  overlay = new google.maps.GroundOverlay(map.tif, imageBounds)
  overlay.setMap(map)
  var imageLatLng = {
    lat: 51.505,
    lng: 4.9405
  }
  //map.setCenter(imageLatLng)
  setCenterOfMapToUserLocation()
  // initmap function ends
}
$('#pac-input').focus(function(){
  $(this).data('placeholder',$(this).attr('placeholder')).attr('placeholder','');
}).blur(function(){
  $(this).attr('placeholder',$(this).data('placeholder'));
});
function coordinatesSearchClicked() {
  if (document.getElementById('coordinatesSearch').checked) {
    document.getElementById('coordinatesSearch').checked = true
    document.getElementById('placesSearch').checked = false
    document.getElementById('pac-input').addEventListener('keypress', function (e) { 
      if (e.keyCode === 13) {
        var latlngValues = document.getElementById('pac-input').value
        var latlngValuesSplit = latlngValues.split(',')
        var position = {
          lat: Number(latlngValuesSplit[0]),
          lng: Number(latlngValuesSplit[1])
        }
        map.setCenter(position)
      }
    })
  }
}
function placesSearchClicked() {
  if (document.getElementById('placesSearch').checked) {
    document.getElementById('coordinatesSearch').checked = false
    document.getElementById('placesSearch').checked = true
  }
}
function setCenterOfMapToUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
    map.setCenter(pos)
    })
  }
}
//functions for menu clicked
function showMenu(clicked) {
  $('.boxes').each(function(index) {
    if (($(this).attr("id") == clicked)&&($(this).attr("id") != lastButtonClickedString)) {
      $(this).show(400)
      lastButtonClickedString = clicked
      }
    else if ($(this).attr("id") == lastButtonClickedString) {
        $(this).hide(400)
        //set to null      
        lastButtonClickedString = ''   
    }     
    else {
      $(this).hide(200)
    }
  }
)}
//Check if numbers are valid GPS coordinates
function checkGPSValidity(num1, num2){
  var checkGPSValidity = false;
  if ((num1<=90)&&(num1>=-90)&&(num2<=90)&&(num2>=-90)){
    checkGPSValidity = true;
  }
  return checkGPSValidity
}
