#!/usr/bin/env node

var WebSocketServer = require("websocket").server;
var http = require("http");
var express = require('express');
var app = express();

// respond with "hello world" when a GET request is made to the homepage
app.use(express.static('public', {hidden: true}));

var server = app.listen(process.env.PORT || 3000, function () {
  console.log((new Date()) + ' Server is listening on port 3000');
});

var wsServer = new WebSocketServer({
  httpServer: server,
  // You should not use autoAcceptConnections for production
  // applications, as it defeats all standard cross-origin protection
  // facilities built into the protocol and the browser.  You should
  // *always* verify the connection's origin and decide whether or not
  // to accept it.
  autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

var viewConnections = [];
var sessions = {};

function createSessionID(){
  var randam = Math.floor(Math.random()*1000);
  var date = new Date();
  var time = date.getTime();
  return randam + time.toString();
}

wsServer.on("request", function(request) {
  if (!originIsAllowed(request.origin)) {
    // Make sure we only accept requests from an allowed origin
    request.reject();
    console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
    return;
  }
  var con;
  var send = function(message) {
    con.sendUTF(JSON.stringify(message));
  };
  var createSession = function(id) {
    send({type: "session_id", session_id: id});
  };
  var sendSession = function(session) {
    send({type: "session", session: session});
  };

  for (var i in request.requestedProtocols) {
    var protocol = request.requestedProtocols[i];
    if (protocol == "mos-view") {
      console.log('view');
      con = request.accept("mos-view", request.origin);
      viewConnections.push(con);

      con.sendUTF("hello");

      con.on("message", function(message) {
        console.log('veiw: message');
        if (message.type === "utf8") {
          console.log('veiw: ' + message);
        }
      });
      con.on("close", function(reasonCode, description) {
        console.log('closing');
      });
    } else if (protocol == "mos-controller") {
      con = request.accept("mos-controller", request.origin);
      console.log('controller');

      var session_id;
      for (var i in request.cookies) {
        var cookie = request.cookies[i];
        if ("SESSION_ID" === cookie.name) {
          session_id = cookie.value;
        }
      }
      console.log(sessions);
      if (session_id in sessions) {
        sendSession(sessions[session_id]);
      } else {
        session_id = createSessionID();
        createSession(session_id);
        sessions[session_id] = {user: ""};
      }

      console.log(sessions[session_id]);
      con.on("message", function(message) {
        if (message.type === "utf8") {
          console.log('Received Message: ' + message.utf8Data);
          var obj = JSON.parse(message.utf8Data);
          if (obj.type == "touchmove") {
            obj.name = sessions[session_id].user;
            obj.id = session_id;
            for (var i=0; i < viewConnections.length; i++) {
              var view = viewConnections[i];
              if (view) {
                view.sendUTF(JSON.stringify(obj));
              }
            }
          } else if (obj.type == "session") {
            sessions[session_id] = obj.session;
          }
        }
      });
      con.on("close", function(reasonCode, description) {
        // console.log((new Date()) + ' Peer ' + viewConnection.remoteAddress + ' disconnected.');
      });
    }
  }
});
