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

var Main = React.createClass({
  getInitialState: function() {
    return {
      title: "",
      type: "Issue"
    };
  },

  // starts consuming data (events)
  handleGET: function() {
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if(req.readyState == 4 && req.status == 200) {
        var sid = req.getResponseHeader("Session-Id");
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if(xhr.readyState == 4 && xhr.status == 200) {
            console.log("event");
          }
        }
        xhr.open("GET", "http://localhost:3000/topic1?session=" + sid, true);
        xhr.send();
      }
    };
    req.open("GET", "http://localhost:3000/topic1", true);
    req.send();
  },

  // produces data (pushes new events to a topic)
  handlePOST: function() {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if(xhr.readyState == 4 && xhr.status == 200) {
        console.log(xhr.responseText);
      }
    };
    xhr.open("POST", "http://localhost:3000/" + this.state.type, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
      title: this.state.title
    }));
  },

  // fires every time the Title text field is changed
  handleTitleChange: function(event) {
    this.state.title = event.target.value;
  },

  // fires every time the Type text field is changed
  handleTypeChange: function(event, index, value) {
    this.state.type = value;
    this.forceUpdate();
  },

  render: function() {
    return (
      <div className="mainContainer">
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
        <SelectField value={this.state.type} onChange={this.handleTypeChange}>
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
