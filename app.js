var express = require('express');
var app = express();

app.post('/:topic', function (req, res) {
  if(req.url === '/favicon.ico') { // blocking favicon requests
    res.writeHead(200, {'Content-Type': 'image/x-icon'} );
    res.end();
  } else {

  }
});

app.get('/:topic', function (req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  
});

app.listen(process.env.PORT || 3000, function () {
  console.log("server is up");
});
