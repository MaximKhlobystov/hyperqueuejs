var express = require("express");
var crypto = require("crypto");
var bodyParser = require("body-parser");
var httpStatus = require("http-status-codes");

var app = express();

// Cross-Origin Resource Sharing:
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.use(bodyParser.json());       // to support JSON-encoded bodies

var store = (function(host, port) {

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

    getAllTopicNames: function() {
      var names = [];
      topics.forEach(function(topic) {
        names.push(topic.name);
      });
      return names;
    },

    // getter for the sessions array
    getAllSessions: function() {
      return sessions;
    },

    // pushes a new event to the array of events on the topic specified by index
    pushEventByTopicIndex: function(topicIndex, event) {
      topics[topicIndex].events.push(event);
      return event;
    },

    // generates a new session and stores it
    registerSession: function(topic) {
      var sid = generateSessionId();
      while(!isSessionUnique()) {
        sid = generateSessionId();
      }
      sessions.push({
        "sid": sid,
        "topic": topic,
        "offset": 0
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
    },

    incrementSessionOffset: function(sid) {
      for(var i = 0; i < sessions.length; i++) {
        if(sessions[i].sid == sid) {
          sessions[i].offset++;
          return true;
        }
      }
      return false;
    },

    pullNextEvent: function(sid) {
      for(var i = 0; i < sessions.length; i++) {
        if(sessions[i].sid == sid) {
          var topic = this.getTopicByName(sessions[i].topic);
          var offset = sessions[i].offset;
          if(offset < topic.events.length) {
            this.incrementSessionOffset(sid);
            return topic.events[offset];
          } else {
            return 0;
          }
        }
      }
      return -1;
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
    res.status(httpStatus.CREATED); // code 201 (successfully created)
    res.json(addedEvent);
  }
});

// handling GET requests (from consumers)
app.get('/:topic', function (req, res) {
  res.setHeader("Access-Control-Expose-Headers", "Session-Id");
  if(req.query.session == undefined) { // for the first time
    var sid = store.registerSession(req.params.topic);
    res.setHeader("Session-Id", sid);
    res.status(httpStatus.OK); // code 200 (operation successful)
    res.send();
  } else {
    var event = store.pullNextEvent(req.query.session);
    if(event == -1) {
      res.status(httpStatus.NOT_FOUND); // code 404 (not found)
      res.send("Session not found");
    } else if(event == 0) {
      setTimeout(function() { // holds on for a while (to wait for new events)
        event = store.pullNextEvent(req.query.session);
        if(event == 0) { // still nothing
          res.status(httpStatus.NO_CONTENT); // code 204 (no content)
          res.send("No event left");
        } else if(event == -1) {
          res.status(httpStatus.NOT_FOUND); // code 404 (not found)
          res.send("Session not found");
        } else { // new event(s) arrived
          res.status(httpStatus.OK); // code 200 (operation successful)
          res.json(event);
        }
      }, 3000);
    } else {
      res.status(httpStatus.OK); // code 200 (operation successful)
      res.json(event);
    }
  }
});

app.get("/", function (req, res) {
  res.status(httpStatus.OK); // code 200 (operation successful)
  res.json({
    topics: store.getAllTopicNames()
  });
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server is up");
});
