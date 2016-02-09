var React = require("react");
var ReactDOM = require("react-dom");

// Material-UI
var FlatButton = require("material-ui/lib/flat-button");
var TextField = require("material-ui/lib/text-field");
var SelectField = require("material-ui/lib/select-field");
var MenuItem = require("material-ui/lib/menus/menu-item");

var hyperqueue = require("../../../hyperqueue.js");

// temporary Material-UI dependency (until React 1.0)
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var hyperqueue = new hyperqueue("http://localhost", 3000);

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
    hyperqueue.consume(this.state.typeToGet, onSuccess, onError);
  },

  // produces data (pushes new events to a topic)
  handlePOST: function() {
    hyperqueue.produce(this.state.typeToPost, { title: this.state.title });
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
