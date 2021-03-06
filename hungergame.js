var map;
var allRestaurants;
var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var orgn;
var dest;

var supports = (function() {  
   var div = document.createElement('div'),  
      vendors = 'Khtml Ms O Moz Webkit'.split(' '),  
      len = vendors.length;  
  
   return function(prop) {  
      if ( prop in div.style ) return true;  
  
      prop = prop.replace(/^[a-z]/, function(val) {  
         return val.toUpperCase();  
      });  
  
      while(len--) {  
         if ( vendors[len] + prop in div.style ) {  
            // browser supports box-shadow. Do what you need.  
            // Or use a bang (!) to test if the browser doesn't.  
            return true;  
         }   
      }  
      return false;  
   }; 
})();

// initialize after window load
google.maps.event.addDomListener(window, 'load', initialize);

function initialize() {

  // init map
  var mapOptions = {
    zoom: 2,
    center: new google.maps.LatLng(40, 10)
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  directionsDisplay = new google.maps.DirectionsRenderer({suppressMarkers: true});
  directionsDisplay.setMap(map);
  $("button#settings").on('click', function(){
    $("div#settings-show").slideToggle();
  });

document.getElementById('address').addEventListener("keyup", function(){

if(this.value.length != 0)
{
  $('#go-button').attr("disabled", false);
}
else
  {
    $('#go-button').attr("disabled", true);
  }

}, false);

  // get location of user
  getLocation();
}


function calcRoute() {
  var selectedMode = 'WALKING';
  var request = {
      origin: orgn,
      destination: dest,
      // Note that Javascript allows us to access the constant
      // using square brackets and a string value as its
      // "property."
      travelMode: google.maps.TravelMode[selectedMode]
  };
  directionsService.route(request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setDirections(response);
    } else {
      console.log(status);
    }
  });
};
//Get Long and Lat from user input without using GPS
function getLongLatFromAdress(address)
{

  var geocoder = new google.maps.Geocoder();
        geocoder.geocode( {'address':address}, function(results, status) {
        if(status == google.maps.GeocoderStatus.OK) {
          console.log("location : " + results[0].geometry.location.lat() + " " +results[0].geometry.location.lng())
        }
        else {
          console.log('Failed to search by adress. Status: ' + status);
        }
    });



}

// get position via navigator
function getLocation() {

      // ActivateSlot and geolocError is a callback.
      navigator.geolocation.getCurrentPosition(activateSlot, geolocError) 
}

function geolocError(err){
  console.log("ErrorCode: " + err);
}

function activateSlot(position) {
  var googleMapsLatLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
  console.log("origin: " + googleMapsLatLng);

  orgn = googleMapsLatLng;
  panMap(googleMapsLatLng);
  nearbySearch(googleMapsLatLng);
}

// pan map to position and zoom
function panMap(latLng) {
  map.panTo(latLng);
  // zoom after 500ms
  setTimeout(function () {
    map.setZoom(13);
    // enable go button when location is ready and panned to
    $('#address').attr("disabled", true);
    $("#go-button").attr("disabled", false);
    $("#go-button").on("click", function () { go(); });
  }, 500);
}


function nearbySearch(latLng) {
  var request = {
    location: latLng,
    radius: '500',
    types: ['food'],
    sensor: false,
    key: 'AIzaSyAA3T68i2zmg60ZGH7RjFOjLnuV3BNEvuw'
  };

  var service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, populateSlot);
}


function populateSlot(results, status) {
  allRestaurants = results;
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for(var i = 0; i < allRestaurants.length; i++) {
      $('.slot').append('<li>' + allRestaurants[i].name + '</li>');
    }
  }
}

function go() {
  var winner = allRestaurants[Math.floor(Math.random() * allRestaurants.length)];
  console.log(supports('textShadow'));
  //Check if the browser supports CSS3
  if (supports('textShadow')) {

    $("div#slot-machine").slideToggle(400, function () {
      // show list
      $(".slot").show();

      // run animation
      runSlotMachine(winner, 4, 500, function () {
        showRestaurantOnMap(winner);
      });
    });
  }
  else {
    $('div#slot-machine').show();
    $("p#noSupportResult").text(winner.name);
    $("p#noSupportResult").sho();

    $("#go-button").attr("disabled", true);
    $("div#settingAndGo").slideToggle();

    showRestaurantOnMap(winner);
  }  
}

function runSlotMachine(winner, laps, laptime, callback) {    
  animateList(winner, 1, laps, laptime, callback);
}

// OBS! Denna laggar tyvärr...
function animateList(winner, lap, laps, laptime, callback) {
  // randomize order of list
  $('.slot').randomize();
  var easing = "linear";
  if (lap == laps) {
    laptime = 2500;
    easing = "easeOutSine";
  }
  if (lap <= laps) {
    // place slot above field
    $('.slot').css("margin-top", 5 - $('.slot').height()+"px");
  }
  // animate
  $(".slot").animate({marginTop:"40px"}, laptime, easing, function(){
      lap++;
      if (lap < laps) {
        animateList(winner, lap, laps, laptime, callback);
      }
      else if (lap == laps) {
        // different easing and laptime here
        animateList(winner, lap, laps, laptime, callback);
      }
      else if (lap > laps) {
        $('#winningRestaurant').text(winner.name);
        $('#winningRestaurant').css("margin-top", "-30px");
        $('#winningRestaurant').show();
        $("#winningRestaurant").animate({marginTop:"0px"}, 1000, "easeOutCirc", function () {
          callback();
        });
      }
  });
}

$.fn.randomize = function(selector){
    var $elems = selector ? $(this).find(selector) : $(this).children(),
        $parents = $elems.parent();

    $parents.each(function(){
        $(this).children(selector).sort(function(){
            return Math.round(Math.random()) - 0.5;
        }).remove().appendTo(this);
    });

    return this;
};

/*function initSlotMachine() {
  $('.slot').jSlots({
    number : 1,          // Number: number of slots
    winnerNumber : 1,    // Number or Array: list item number(s) upon which to trigger a win, 1-based index, NOT ZERO-BASED
    spinner : '#start-button',        // CSS Selector: element to bind the start event to
    spinEvent : 'click', // String: event to start slots on this event
    onStart : function () {
      // add blurred effect on list items
      $('.slot li').removeClass("sharpened-text").addClass("blurred-text");
      setTimeout(function () {
        // remove blurred effect after 5 seconds
        $('.slot li').removeClass("blurred-text").addClass("sharpened-text");
      }, 3000);
      // disable go-button
      $("#go-button").attr("disabled", true);
      // hide buttons field
      $("div#settingAndGo").slideToggle();
    },    // Function: runs on spin start,
    onEnd : function(finalNumbers) { // Function: run on spin end. It is passed (finalNumbers:Array). finalNumbers gives the index of the li each slot stopped on in order.
      // show restaurant on map
      
      showRestaurantOnMap(allRestaurants[finalNumbers[0]-1]);
      calcRoute();
      
    },      
    onWin : $.noop,      // Function: run on winning number. It is passed (winCount:Number, winners:Array, finalNumbers:Array)
    easing : 'easeOutCirc',    // String: easing type for final spin. I recommend the easing plugin and easeOutSine, or an easeOut of your choice.
    time : 7000,         // Number: total time of spin animation
    loops : 6            // Number: times it will spin during the animation
  });
}*/

function showRestaurantOnMap(restaurant) {
  var photo = null;
  // get photo
  if (restaurant.photos != null) {
    // take first photo
    // UNCOMMENT THIS IF WE WANT PHOTO
    //photo = results[i].photos[0].getUrl({'maxWidth': 250, 'maxHeight': 250});
  }
  
  // create and show marker
  var marker = new google.maps.Marker({
    map: map,
    position: restaurant.geometry.location,
    title: restaurant.name
    //icon: photo
  });

  // sets the destination of the route
  dest = new google.maps.LatLng(restaurant.geometry.location.pb,restaurant.geometry.location.qb);
  
  // pan to marker
  map.panTo(restaurant.geometry.location);

  // tvungen att lägga infowindow-content i en variabel
  // för att size ska funka bra
  //var $content = $("<div>"+restaurant.name+"</div>");

  // create infowindow
  var infowindow = new google.maps.InfoWindow({
        content: restaurant.name
  });

  // show info window
  infowindow.open(map,marker);

  // add onclick on marker to be able to toggle infowindow
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
}
