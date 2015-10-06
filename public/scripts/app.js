$(document).ready(function() {
  var socket = io.connect('http://localhost:4000')

  var $sliderTop = $('.handshake-top-slider');
  var $sliderBottom = $('.handshake-bottom-slider');
  var HANDSHAKE_IMAGES_TO_SHOW = 10;

  // Calculate previous images width
  var imageWidth = ($('body').width() - 40) / 10;
  /*
   * Socket.io connection and listeners
   */
  socket.on('connection', function (data) {
    console.info(data);
  });

  socket.on('handshake.new.picture', function (data) {
    setTimeout(function() {
      $('body').trigger('handshake.new.picture.added', data);
    }, 0);
  });

  socket.on('handshake.previous.pictures', function (data) {
    setTimeout(function() {
      $('body').trigger('handshake.previous.pictures.added', {
        images: data
      });
    }, 0);
  });

  /*
   * Handshake object
   */
  var Handshake = {
    init: function() {
    },
    checkImageLimit: function() {
      console.info('Handshake.checkImageLimit');
      if ($sliderBottom.find('img').length > HANDSHAKE_IMAGES_TO_SHOW) {
        // Remove the first image
        $sliderBottom.find('ul > li').last().fadeOut().remove();
        console.info('Handshake.checkImageLimit', 'Removing first image');
      }
    },
    addNewSlide: function(src) {
      console.log('adding', src);
      $('<img />')
        .on('load', function() {
          $sliderTop.find('img').attr('src', src);
          $sliderTop.find('img').fadeIn();
          $sliderBottom.find('ul').prepend('<li><img width="'+imageWidth+'px" src="'+src+'" /></li>');
          $sliderBottom.find('ul').last().addClass('magictime puffIn');
          $('body').trigger('handshake.new.picture.done');
          console.info('Handshake.addNewSlide', 'path', src);
        })
        .attr('src', src);
    },
    loadPrevious: function(images) {
      var length = images.length;
      console.info('Handshake.loadPrevious', length);
      $.when(
        $.each(images, function(index, image) {
          $sliderBottom.find('ul').append('<li class><img width="'+imageWidth+'px" src="/photos/'+image+'" /></li>');
          if (index == length - 1) {
            $('body').trigger('handshake.new.picture.added', {
              images: '/photos/'+ image
            });
          }
        })
      ).done(function() {
        $('body').trigger('handshake.previous.pictures.done');
        console.info('Handshake.loadPrevious', 'all loaded');
      });
    }
  };

  // New picture loaded
  $('body').on('handshake.new.picture.added', function(ev, data) {
    Handshake.addNewSlide(data.images);
  });
  // New picture added
  $('body').on('handshake.new.picture.done', function(ev, data) {
    Handshake.checkImageLimit();
  });

  // Load previous images
  $('body').on('handshake.previous.pictures.added', function(ev, data) {
    Handshake.loadPrevious(data.images);
  });

  // Check image limit
  $('body').on('handshake.previous.pictures.done', function(ev, data) {
    Handshake.checkImageLimit();
  });
});
