'use strict';

var url = 'ws://localhost:8080/';
var connection = new WebSocket(url,['mos-controller']);

connection.onopen = function () {
  console.log('open');
  document.addEventListener('touchmove', function(e){
    var touch = e.changedTouches[0];
    var obj = {
      x: touch.clientX,
      y: touch.clientY
    };
    connection.send(JSON.stringify(obj));
  });
};

// Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
  console.log('Server: ' + e.data);
};
