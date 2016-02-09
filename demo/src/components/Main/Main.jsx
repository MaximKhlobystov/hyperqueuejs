var React = require("react");
var ReactDOM = require("react-dom");

// Material-UI
var FlatButton = require("material-ui/lib/flat-button");
var TextField = require("material-ui/lib/text-field");
var SelectField = require("material-ui/lib/select-field");
var MenuItem = require("material-ui/lib/menus/menu-item");

// temporary Material-UI dependency (until React 1.0)
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

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

var client = new Client("http://localhost", 3000);

var Main = React.createClass({
  getInitialState: function() {
    return {
      title: "",
      typeToPost: "Issue",
      typeToGet: "Issue"
    };
  },

  // starts consuming data (events)
  handleGET: function() {
    var onSuccess = function(event) {
      console.log(event);
    };
    var onError = function(error) {};
    client.consume(this.state.typeToGet, onSuccess, onError);
  },

  // produces data (pushes new events to a topic)
  handlePOST: function() {
    client.produce(this.state.typeToPost, { title: this.state.title });
  },

  // fires every time the Title text field is changed
  handleTitleChange: function(event) {
    this.state.title = event.target.value;
  },

  // fires every time the Type text field is changed
  handleTypeToPostChange: function(event, index, value) {
    this.state.typeToPost = value;
    this.forceUpdate();
  },

  handleTypeToGetChange: function(event, index, value) {
    this.state.typeToGet = value;
    this.forceUpdate();
  },

  render: function() {
    return (
      <div className="mainContainer">
        <h3>Get Items (Consumer)</h3>
        <SelectField value={this.state.typeToGet} onChange={this.handleTypeToGetChange}>
          <MenuItem value="Issue" primaryText="Issue"/>
          <MenuItem value="Request" primaryText="Request"/>
        </SelectField>
        <FlatButton
          label="GET"
          onClick={this.handleGET} />
        <br/>
        <br/>
        <br/>
        <h3>Create New Item (Producer)</h3>
        <TextField
          hintText="Title"
          onChange={this.handleTitleChange} />
        <br/>
        <SelectField value={this.state.typeToPost} onChange={this.handleTypeToPostChange}>
          <MenuItem value="Issue" primaryText="Issue"/>
          <MenuItem value="Request" primaryText="Request"/>
        </SelectField>
        <br/>
        <FlatButton
          label="POST"
          onClick={this.handlePOST} />
      </div>
    );
  }
});

ReactDOM.render(<Main />, document.getElementById('container'));
