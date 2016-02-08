var express = require("express");
var app = express();
var path = require("path");

app.use(express.static("./src"));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(8080, function () {
  console.log("server is up");
});
