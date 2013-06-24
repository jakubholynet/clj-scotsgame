//====================================================== FancyWebSocket
/* Ismael Celis 2010
 Source: https://gist.github.com/ismasan/299789
Simplified WebSocket events dispatcher (no channels, no users)

var socket = new FancyWebSocket();

// bind to server events
socket.bind('some_event', function(data){
  alert(data.name + ' says: ' + data.message)
});

// broadcast events to all connected users
socket.send( 'some_event', {name: 'ismael', message : 'Hello world'} );
*/

var FancyWebSocket = function(url){
    var conn = new WebSocket('ws://me:5000/ws');

    var callbacks = {};

    this.bind = function(event_name, callback){
        callbacks[event_name] = callbacks[event_name] || [];
        callbacks[event_name].push(callback);
        return this;// chainable
    };

    this.send = function(event_name, event_data){
        var payload = JSON.stringify({event:event_name, data: event_data});
        conn.send( payload); // <= send JSON data to socket server
        return this;
    };

    // dispatch to the right handlers
    conn.onmessage = function(evt){
        var json = JSON.parse(evt.data);
        dispatch(json.event, json.data);
    };

    conn.onerror = function(e) {console.log("WS error", e);};

    conn.onclose = function(){dispatch('close',null);};
    conn.onopen = function(){dispatch('open',null);};

    var dispatch = function(event_name, message){
        var chain = callbacks[event_name];
        if(typeof chain == 'undefined') return; // no callbacks for this event
        for(var i = 0; i < chain.length; i++){
            chain[i]( message );
        }
    };
};
//=======================
var socket = new FancyWebSocket('ws://' + document.location.host + '/ws');

// bind to server events
socket.bind('pong', function(data){
  console.log('Server responded: ' + data);
});

// broadcast events to all connected users
socket.bind('open', function(){
    socket.send( 'ping', 'Msg from ping');
});