var Client = (function(brokerHost, brokerPort) {

  var host = brokerHost;
  var port = brokerPort;

  var consumers = [];

  var pullEvent = function(topic, sid, consumerId, onSuccess, onError) {
    if(consumers[consumerId] == false) return;
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4) {
        if(xhr.status == 200) {
          onSuccess(xhr.responseText);
          pullEvent(topic, sid, consumerId, onSuccess, onError);
        } else {
          if(xhr.status == 204) { // code 204 (no content)
            console.log("No event left");
            pullEvent(topic, sid, consumerId, onSuccess, onError);
          } else if(xhr.status == 404) { // code 404 (not found)
            console.log("Session not found");
            onError(xhr.responseText);
          }
        }
      }
    }
    xhr.open("GET", host + ":" + port + "/" + topic + "?session=" + sid, true);
    xhr.send();
  };

  return {
    produce: function(topic, event) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if(xhr.readyState == 4) {
          if(xhr.status == 201) { // 201 - successfully created
            console.log(xhr.responseText);
          }
        }
      };
      xhr.open("POST", host + ":" + port + "/" + topic, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(JSON.stringify(event));
    },
    consume: function(topic, onSuccess, onError) {
      var consumerId = consumers.length;
      consumers.push(true);
      var req = new XMLHttpRequest();
      req.onreadystatechange = function() {
        if(req.readyState == 4) {
          if(req.status == 200) {
            var sid = req.getResponseHeader("Session-Id");
            var resp = pullEvent(topic, sid, consumerId, onSuccess, onError);
          }
        }
      };
      req.open("GET", host + ":" + port + "/" + topic, true);
      req.send();
      return consumerId;
    }
  };
});

module.exports = Client;
