var slide_width = 882;
var arrow = {left: 37, up: 38, right: 39, down: 40 };
var current_slide = 0;
var lights_out = false;

$(document).ready(function(){
  resizeSlides();
  total_slides = $("#slideshow").children(".slide").size();
  if (window.location.hash.slice(1).length != 0){
    current_slide = parseInt((window.location.hash).slice(1));
    goToSlide(current_slide);
  }
  if (following == true){
    var server = new Pusher('9f35849b3fdcf6710529', ''+show_id);
    server.bind('slideChange', function(data) {
      current_slide = parseInt(data);
      goToSlide(current_slide);
    });
    server.bind('updateSlides', function(data) {
      $("#slideshow").html(data);
      total_slides = $("#slideshow").children(".slide").size();
      if (current_slide >= total_slides){
        current_slide = total_slides - 1;
        goToSlide(current_slide);
      }
      resizeSlides();
    });
  }
  $(".slide").live("click", function(){
    slideRight();
  });
  $(".leftarrow").click(function(){
    slideLeft();
  });
  $(".rightarrow").click(function(){
    slideRight();
  });
  
  $(".lights").click(function(){
    toggleLights();
    return false;
  });
  
  $("body").click(function(e){
    if (($(e.target).hasClass("body") || $(e.target).hasClass("page"))  && lights_out){
      toggleLights();
    }
  });

  $(document).bind('keydown', function(e) {
    if (e.keyCode == arrow.left){
      slideLeft();
      return false;
    }
    if (e.keyCode == arrow.right){
      slideRight();
      return false;
    }
  });
  
  $(window).resize(function(){
    resizeSlides();
  });
});

function toggleLights(){
  if (lights_out){
    lights_out = false;
    $('body').animate({'background-color': '#DDD'});
    $("#frame").show();
  } else {
    lights_out = true;
    $('body').animate({'background-color': '#222'});
    $("#frame").hide();
  }
  resizeSlides();
}

function resizeSlides(){
  var width = $(window).width();
  if ($("#frame").is(":visible")){
    if ($(window).height() < width*0.5625) width = ($(window).height())*1.77;
  } else{
    if ($(window).height() < width*0.5625*0.952) width = ($(window).height())*1.77*1.05;
  }
  width = width - 100;
  $(".page").css("width", (width+80));
  slide_width = (width+80)+1.5;
  slide = $(".slide")
  slide.css("font-size", ((width*1.185)/720.0)+"em");
  slide.css("width", (width)+'px');
  slide.css("height", (width*0.5625)+'px');

  //update slide location
  position = slide_width * current_slide * -1;
  $('#slideshow').css('left', position+"px");
  return true;
}
function pushCurrentLocation(){
  $.get("/show/" + show_id + "/present/slide-change?slide="+current_slide);
}

function goToSlide(slideNumber){
  if (slideNumber >= total_slides){
    slideNumber = (total_slides - 1);
    current_slide = slideNumber;
  }
  position = slide_width * slideNumber * -1;
  positionDifference = Math.abs(position - parseInt($('#slideshow').css('left').slice(0,-2)));
  if (positionDifference ==  0) return false;
  time_difference = (positionDifference / ($(window).width())*400);
  $('#slideshow').stop().animate({left: position+"px"}, time_difference+50, 'easeInOutQuad');
  window.location.hash = slideNumber;
  if (presenting == true) pushCurrentLocation();
}

function slideLeft(){
  if (current_slide <= 0) return false;
  current_slide -= 1;
  goToSlide(current_slide);    
}
function slideRight(){
  if (current_slide >= (total_slides-1)) return false;
  current_slide += 1;
  goToSlide(current_slide);
}
