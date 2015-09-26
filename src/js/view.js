'use strict';

var map;
function initMap() {
  // Create a map object and specify the DOM element for display.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    scrollwheel: false,
    zoom: 8
  });
}

var url = location.toString().replace("http","ws").replace("8888","3000");
var connection = new WebSocket(url,['mos-view']);

connection.onopen = function () {
  console.log('event open');
  connection.send('Ping'); // Send the message 'Ping' to the server
};

// Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ');
  console.log(error);
};


var last = {x:0, y:0};
// Log messages from the server
connection.onmessage = function (e) {
  console.log(e.data);
  if (typeof  e.data === 'string') {
    var n = JSON.parse(e.data);
    if (n.type == 'touchstart') {
      last.x = n.x;
      last.y = n.y;
    }
    if (n.type == 'touchmove') {
      map.panBy(last.x - n.x, last.y - n.y);
      last.x = n.x;
      last.y = n.y;
      document.getElementById("name").innerHTML = n.name;
    }
    if (n.type == 'touchend') {
      map.panBy(last.x - n.x, last.y - n.y);
      last.x = n.x;
      last.y = n.y;
      document.getElementById("name").innerHTML = "";
    }
//    document.body.insertAdjacentHTML("afterbegin",e.data + "<br>");
  } else {
    var str = "x: " + e.data.x + ", y: " + e.data.y;
//    document.body.insertAdjacentHTML("afterbegin",str + "<br>");
  }
};
