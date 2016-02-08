var express = require('express');
var crypto = require('crypto');
var bodyParser = require('body-parser');

var app = express();

// Cross-Origin Resource Sharing:
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies

var store = (function() {

  // private variables:
  var topics = [];
  var sessions = [];

  // private methods:
  var generateSessionId = function() { // generates a random string
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    return sha.digest('hex');
  };
  var isSessionUnique = function(sid) { // checks if the generated string is unique
    for(var i = 0; i < sessions.length; i++) {
      if(sessions[i] == sid) return false;
    }
    return true;
  };

  // public methods:
  return {

    // adds a new topic
    addTopic: function(name) {
      topics.push({
        "index": topics.length, // position in the topics array
        "name": name,
        "events": []
      });
    },

    // finds a topic by name and returns it (-1 otherwise)
    getTopicByName: function(name) {
      for(var i = 0; i < topics.length; i++) {
        if(topics[i].name == name) {
          return topics[i];
        }
      }
      return -1;
    },

    // getter for the topics array
    getAllTopics: function() {
      return topics;
    },

    // pushes a new event to the array of events on the topic specified by index
    pushEventByTopicIndex: function(topicIndex, event) {
      topics[topicIndex].events.push(event);
      return event;
    },

    // generates a new session and stores it
    registerSession: function() {
      var sid = generateSessionId();
      while(!isSessionUnique()) {
        sid = generateSessionId();
      }
      sessions.push({
        "sid": sid
      });
      return sid;
    },

    // update method for the sessions array
    updateSession: function(sid, topic, offset) {
      for(var i = 0; i < sessions.length; i++) {
        if(sessions[i].sid == sid) {
          sessions[i].topic = topic;
          sessions[i].offset = offset;
          return true;
        }
      }
      return false;
    }
  };
})();

// handling POST requests (from producers)
app.post('/:topic', function (req, res) {
  if(req.url === '/favicon.ico') { // blocking favicon requests
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
  } else {
    if(store.getTopicByName(req.params.topic) == -1) {
      store.addTopic(req.params.topic);
    }
    var addedEvent = store.pushEventByTopicIndex(store.getTopicByName(req.params.topic).index, req.body);
    res.json(addedEvent);
  }
});

// handling GET requests (from consumers)
app.get('/:topic', function (req, res) {
  res.setHeader("Access-Control-Expose-Headers", "Session-Id");
  if(req.query.session == undefined) { // for the first time
    var sid = store.registerSession();
    res.setHeader("Session-Id", sid);
    res.send();
  } else {
    console.log(req.query.session);
    //console.log(store.updateSession(req.query.session, "topic1", 0));
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server is up");
});
