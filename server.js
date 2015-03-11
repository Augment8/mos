#!/usr/bin/env node

var WebSocketServer = require("websocket").server;
var http = require("http");

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
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

wsServer.on("request", function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + " Connection from origin " + request.origin + " rejected.");
      return;
    }
    for (var i in request.requestedProtocols) {
        var protocol = request.requestedProtocols[i];
        var con;
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
          con.on("message", function(message) {
            if (message.type === "utf8") {
                console.log('Received Message: ' + message.utf8Data);
                for (var i=0; i < viewConnections.length; i++) {
                   var view = viewConnections[i];
                   console.log(viewConnections.length);
                   if (view) {
                     view.sendUTF(message.utf8Data);
                   }
                }
              }
             });
          con.on("close", function(reasonCode, description) {
            // console.log((new Date()) + ' Peer ' + viewConnection.remoteAddress + ' disconnected.');
          });
       }
    }
});
