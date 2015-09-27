$(document).ready(function() {
  var socket = io.connect('http://localhost:4000')

  var $sliderTop = $('.handshake-top-slider');
  var $sliderBottom = $('.handshake-bottom-slider');

  /*
   * Socket.io connection and listeners
   */
  socket.on('connection', function (data) {
    console.info(data);
  });

  socket.on('handshake.new.picture', function (data) {
    $('body').trigger('handshake.new.picture.added', data);
  });

  socket.on('handshake.previous.pictures', function (data) {
    $('body').trigger('handshake.previous.pictures.added', {
      images: data
    });
  });

  /*
   * Handshake object
   */
  var Handshake = {
    init: function() {
    },
    checkImageLimit: function() {
      console.info('Handshake.checkImageLimit');
      if ($sliderBottom.find('img').length > 15) {
        // Remove the first image
        $sliderBottom.slick('slickRemove', 0);
        console.info('Handshake.checkImageLimit', 'Removing first image');
      }
    },
    addNewSlide: function(src) {
      $sliderTop.slick('slickAdd', '<div><img data-lazy="'+src+'" /></div>');
      $sliderTop.slick('slickNext');
      $sliderBottom.slick('slickAdd', '<div><img data-lazy="'+src+'" /></div>');
      $('body').trigger('handshake.new.picture.done');
      console.info('Handshake.addNewSlide', 'path', src);
    },
    loadPrevious: function(images) {
      var length = images.length;
      console.info('Handshake.loadPrevious', length);
      $.when(
        $.each(images, function(index, image) {
          $sliderBottom.slick('slickAdd', '<div><img data-lazy="/photos/'+image+'" /></div>');
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

  // Initialize
  $sliderTop.slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    lazyLoad: 'ondemand'
  });

  $sliderBottom.slick({
    slidesToShow: 15,
    slidesToScroll: 1,
    dots: false,
    lazyLoad: 'ondemand',
  });
});
