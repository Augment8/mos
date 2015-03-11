'use strict';

var url = 'ws://localhost:8080/';
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

// Log messages from the server
connection.onmessage = function (e) {
  console.log('event message');
  document.body.insertAdjacentHTML("beforeend",e.data + "<br>");
};
