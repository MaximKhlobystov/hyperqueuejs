var React = require("react");
var ReactDOM = require("react-dom");

// Material-UI
var FlatButton = require("material-ui/lib/flat-button");
var TextField = require("material-ui/lib/text-field");
var SelectField = require("material-ui/lib/select-field");
var MenuItem = require("material-ui/lib/menus/menu-item");

var hyperqueue = require("../../../hyperqueue.js");

var Tabs = require("material-ui/lib/tabs/tabs");
var Tab = require("material-ui/lib/tabs/tab");

require('./Main.less');

// temporary Material-UI dependency (until React 1.0)
var injectTapEventPlugin = require("react-tap-event-plugin");
injectTapEventPlugin();

var hyperqueue = new hyperqueue("http://localhost", 3000);

var Main = React.createClass({
  getInitialState: function() {
    return {
      title: "N/A",
      text: "N/A",
      typeToPost: "Local",
      typeToGet: "Local",
      localNews: [],
      worldNews: [],
      sportsNews: []
    };
  },

  componentDidMount: function() {
    var _this = this;

    hyperqueue.produce("Local", {
      title: "Something Happened in Montreal",
      text: "It was interesting too..."
    });

    hyperqueue.produce("World", {
      title: "Something Happened in The World",
      text: "It was interesting..."
    });

    hyperqueue.produce("Sports", {
      title: "Super Bowl 50",
      text: "Broncos defeated Panthers 24-10"
    });

    hyperqueue.consume("Local", function(event) {
      var eventObj = JSON.parse(event);
      _this.state.localNews.push(<div><h4>{eventObj.title}</h4><p>{eventObj.text}</p><br/></div>);
      _this.forceUpdate();
    }, function(error) {});

    hyperqueue.consume("World", function(event) {
      var eventObj = JSON.parse(event);
      _this.state.worldNews.push(<div><h4>{eventObj.title}</h4><p>{eventObj.text}</p><br/></div>);
      _this.forceUpdate();
    }, function(error) {});

    hyperqueue.consume("Sports", function(event) {
      var eventObj = JSON.parse(event);
      _this.state.sportsNews.push(<div><h4>{eventObj.title}</h4><p>{eventObj.text}</p><br/></div>);
      _this.forceUpdate();
    }, function(error) {});
  },

  // starts consuming data (events)
  handleGET: function() {
    var onSuccess = function(event) {
      console.log(event);
    };
    var onError = function(error) {};
    hyperqueue.consume(this.state.typeToGet, onSuccess, onError);
  },

  // returns the list of all topic names
  handleGETAll: function() {
    hyperqueue.requestTopics(function(topics) {
      console.log(topics);
    });
  },

  // produces data (pushes new events to a topic)
  handlePOST: function() {
    hyperqueue.produce(this.state.typeToPost, {
      title: this.state.title,
      text: this.state.text
    });
  },

  // fires every time the Title text field is changed
  handleTitleChange: function(event) {
    this.state.title = event.target.value;
  },

  handleTextChange: function(event) {
    this.state.text = event.target.value;
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
        <div className="leftPane">
          <Tabs className="sectionTabs">
            <Tab label="Local" >
              <div>
                <h2 style={{
                  fontSize: 24,
                  paddingTop: 16,
                  marginBottom: 12,
                  fontWeight: 400,
                }}>Local News</h2>
                <br/>
                {this.state.localNews}
              </div>
            </Tab>
            <Tab label="World">
              <div>
                <h2 style={{
                  fontSize: 24,
                  paddingTop: 16,
                  marginBottom: 12,
                  fontWeight: 400,
                }}>World News</h2>
                <br/>
                {this.state.worldNews}
              </div>
            </Tab>
            <Tab label="Sports">
              <div>
                <h2 style={{
                  fontSize: 24,
                  paddingTop: 16,
                  marginBottom: 12,
                  fontWeight: 400,
                }}>Sports News</h2>
                <br/>
                {this.state.sportsNews}
              </div>
            </Tab>
          </Tabs>
        </div>
        <div className="rightPane">
          <h3>Create a News Posting</h3>
          <TextField
            hintText="Title"
            onChange={this.handleTitleChange} />
          <br/>
          <TextField
            hintText="Text"
            onChange={this.handleTextChange} />
          <br/>
          <SelectField value={this.state.typeToPost} onChange={this.handleTypeToPostChange}>
            <MenuItem value="Local" primaryText="Local News"/>
            <MenuItem value="World" primaryText="World News"/>
            <MenuItem value="Sports" primaryText="Sports"/>
          </SelectField>
          <br/>
          <FlatButton
            label="PUBLISH"
            onClick={this.handlePOST} />
        </div>
      </div>
    );
  }
});

ReactDOM.render(<Main />, document.getElementById('container'));
