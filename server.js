// init project
var express = require('express');
var app = express();
var sassMiddleware = require('node-sass-middleware');
var postcssMiddleware = require('postcss-middleware');
var autoprefixer = require('autoprefixer');
var path = require('path');
var src = __dirname + '/public';
var dest = '/tmp';

app.use(sassMiddleware({
  src: src,
  dest: dest,
  response: false
}));

app.use(postcssMiddleware({
  plugins: [
    /* Plugins */
    autoprefixer({
      /* Options */
    })
  ],
  src: function(request) {
    return path.join(dest, request.url);
  }
}));


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));
app.use(express.static('/tmp'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.get('/r/:subreddit', function (request, response) {
  response.sendFile(__dirname + '/views/player.html');
});

app.get('/about', function (request, response) {
  response.send('you know what I\'m about dawg');
});


// listen for requests :)
listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});