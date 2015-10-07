var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();

// Configure the server
var server = require('http').Server(app);
// Server listen on 4000
server.listen(4000);

// Event emiter
var events = require("events");
var appEvents = new events.EventEmitter();

// String IO setup and listeners
var io = require('socket.io')(server);
// On new connection
io.on('connection', function(socket) {

  socket.emit('connection', {
    message: 'Connected'
  });

  // Emit the new image
  appEvents.on('handshake.new.picture', function(data) {
    setTimeout(function() {
      socket.emit('handshake.new.picture', data);
    }, 0);
  });

  // Emit the previous files
  var dir = path.join(__dirname, 'public', 'photos');
  var files = fs.readdirSync(dir)
    .map(function(v) {
        return {
          name: v,
          time: fs.statSync(dir +'/' + v).mtime.getTime()
        };
      })
      .sort(function(a, b) { return b.time - a.time; })
      .map(function(v) { return v.name; });
  socket.emit('handshake.previous.pictures', files.slice(0, 10));
});

// App settings
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


app.get('/', function (req, res) {
  res.render('index');
});

var filenames = [];

fs.watch(path.join(__dirname, 'public', 'photos'), function (ev, filename) {
  if (filename && filenames.indexOf(filename) === -1) {
    filenames.push(filename);
    console.info('Change found', ev, filename);
    setTimeout(function() {
      appEvents.emit('handshake.new.picture', {
        images: '/photos/'+filename
      });
    }, 0)
  } else {
    console.warn('already notify for', filename);
  }
});

// Listen to port 3000
app.listen(3000, function() {
  console.log('Server listening on 3000');
});
