'use strict';

var url = 'ws://localhost:8080/';
var connection = new WebSocket(url,['mos-controller']);

connection.onopen = function () {
  console.log('open');
  document.addEventListener('touchmove', function(e){
    var touch = e.changedTouches[0];
    var obj = {
      type: 'touchmove',
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

var session = {};
var func = {
  session_id: function(message) {
    document.cookie = "SESSION_ID=" + message.session_id + ";";
    session.user = prompt("ユーザー名を入力してください", '');
    connection.send(JSON.stringify({type: "session", session: session}));
  },
  session: function(message) {
    var session = message.session;
    session.user = prompt("ユーザー名を入力してください。", session.user);
    connection.send(JSON.stringify({type: "session", session: session}));
  }
};

// Log messages from the server
connection.onmessage = function (e) {
  console.log('Server: ' + e.data);
  var message = JSON.parse(e.data);
  func[message.type](message);
};
