var map;
var allRestaurants;

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

  $("button#settings").on('click', function(){
    $("div#settings-show").slideToggle();
  });


  // get location of user
  getLocation();
}

// get position via navigator
function getLocation() {
  if (navigator.geolocation)
    {
        navigator.geolocation.getCurrentPosition(activateSlot)
    }
    else
    {
      console.log('navigator.geolocation is false')
    }
}

function activateSlot(position) {
  var googleMapsLatLng = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
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
    $("#go-button").attr("disabled", false);
    $("#go-button").on("click", function () { go(); });
    // hide loading
    $(".loading-show").removeClass("loading-show");
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

//Check if the browser supports CSS3
  if ( supports('textShadow') ) {

    $("div#slot-machine").slideToggle(400, function () {
    // show list
    $(".slot").show();
    // init slot machine
    initSlotMachine();
    // trigger click on start-button to start slot machine
    $("#start-button" ).trigger( "click" );
  });
  }
  else {
    $("div#noSupport").show(); 
  }
  
}

function initSlotMachine() {
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
    },      
    onWin : $.noop,      // Function: run on winning number. It is passed (winCount:Number, winners:Array, finalNumbers:Array)
    easing : 'easeOutCirc',    // String: easing type for final spin. I recommend the easing plugin and easeOutSine, or an easeOut of your choice.
    time : 7000,         // Number: total time of spin animation
    loops : 6            // Number: times it will spin during the animation
  });
}

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

  // pan to marker
  map.panTo(restaurant.geometry.location);

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
