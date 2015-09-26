var express = require('express');
var app = express();

// Configure the server
var server = require('http').Server(app);
// Server listen on 4000
server.listen(4000);

// Watch directory
var watch = require('watch');

// String IO setup and listeners
var io = require('socket.io')(server);
// On new connectin
io.on('connection', function(socket) {
  socket.emit('connection', {
    message: 'Connected'
  });
});

// App settings
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/watch'));


app.get('/', function (req, res) {
  res.send('Hello World')
});

watch.createMonitor('./watch', function(monitor) {
  console.log('initializing watch');
});

// Listen to port 3000
app.listen(3000, function() {
  console.log('Server listening on 3000');
});
