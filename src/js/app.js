'use strict';

var url = location.toString().replace("http","ws").replace("8888","3000");
var connection = new WebSocket(url,['mos-controller']);

connection.onopen = function () {
  console.log('open');
  document.addEventListener('touchstart', function(e){
    var touch = e.changedTouches[0];
    var obj = {
      type: 'touchstart',
      x: touch.clientX,
      y: touch.clientY
    };
    connection.send(JSON.stringify(obj));
  });
  document.addEventListener('touchmove', function(e){
    var touch = e.changedTouches[0];
    var obj = {
      type: 'touchmove',
      x: touch.clientX,
      y: touch.clientY
    };
    connection.send(JSON.stringify(obj));
  });
  document.addEventListener('touchend', function(e){
    var touch = e.changedTouches[0];
    var obj = {
      type: 'touchend',
      x: touch.clientX,
      y: touch.clientY
    };
    connection.send(JSON.stringify(obj));
  });
  window.addEventListener("devicemotion", mutator(200)(function(e){
    var obj = {
      type: 'gravity',
      x: e.accelerationIncludingGravity.x,
      y: e.accelerationIncludingGravity.y,
      z: e.accelerationIncludingGravity.z
    };
    connection.send(JSON.stringify(obj));
  }), true);
};

// Log errors
connection.onerror = function (error) {
  console.log('WebSocket Error ' + error);
};

var mutator = function (n) {
  var time = Date.now();
  return function(f) {
    return function(e) {
      var tmp = Date.now();
      if (time + n < tmp) {
        time = tmp;
        return f(e);
      }
      return null;
    };
  };
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
