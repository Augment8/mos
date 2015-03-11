'use strict';

var url = 'ws://localhost:8080/';
var connection = new WebSocket(url,['mos-controller']);

connection.onopen = function () {
  console.log('open');
  connection.send('Ping'); // Send the message 'Ping' to the server
};

// Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ' + error);
};

// Log messages from the server
connection.onmessage = function (e) {
  console.log('Server: ' + e.data);
};
