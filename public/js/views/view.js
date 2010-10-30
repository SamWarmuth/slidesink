var slideWidth = 882;
var arrow = {left: 37, up: 38, right: 39, down: 40 };
var currentSlide = 0;
var lightsOut = false;

$(document).ready(function(){
  $(".slide").css("margin-bottom", 0);
  if (window.location.hash.slice(1).length != 0){
    goToSlide(parseInt((window.location.hash).slice(1)));
  }
  
  $("#showcontainer").click(function(e){
    if (e.target.id == "slide") goToSlide(currentSlide + 1);
  });
  
  $(document).bind('keydown', function(e) {
    if (e.keyCode == 27){
      if (lightsOut) toggleLights();
      return false;
    }
    if (e.keyCode == arrow.left){
      slideLeft();
      return false;
    }
    if (e.keyCode == arrow.right){
      slideRight();
      return false;
    }
  });
  $(".lights").click(function(){
    toggleLights();
  });
  
  if (following == true){
    var server = new Pusher('9f35849b3fdcf6710529', '' + showID);
    server.bind('slideChange', function(data) {
      goToSlide(parseInt(data));
    });
    server.bind('updateSlides', function(data) {
      $("#slideshow").html(data);
      totalSlides = $("#slideshow").children(".slide").size();
      goToSlide(currentSlide);
    });
  }
  
  
  $(window).resize(function(){
    resizeSlides();
  });
  
  
  //fix automatically created jtv stuff
  var holder = $("div").filter(function() {
          return this.id.match(/jtv_embed_.+/);
      });
  var swf = $("object").filter(function() {
          return this.id.match(/live_embed_.+/);
      });
  holder.css("width", "100%").css("height", "100%");
  swf.css("width", "100%").css("height", "100%");
  
  resizeSlides();
});

function goToSlide(slideNumber){
  if (slideNumber >= totalSlides){
    slideNumber = (totalSlides - 1);
    currentSlide = slideNumber;
  }
  if (slideNumber < 0){
    slideNumber = 0;
    currentSlide = 0;
  }
  if (currentSlide == slideNumber) return false;
  currentSlide = slideNumber;
  window.location.hash = slideNumber;
  $(".slide").hide();
  $("#slide"+slideNumber).show();
  if (presenting) pushCurrentLocation();
}

function slideRight(){
  goToSlide(currentSlide + 1);
}

function slideLeft(){
  goToSlide(currentSlide - 1);
}

function pushCurrentLocation(){
  $.get("/show/" + showID + "/present/slide-change?slide="+currentSlide);
}

function resizeSlides(){
  if (lightsOut) {
    $('body').css("height", $(window).height() - 15);
  } else{
    $('body').css("height", $(window).height() - $('#frame').height() - 15);
  }
  
  var width = $("#showcontainer").innerWidth()-20;
  var height = $("#showcontainer").innerHeight()-20;
  if (height*1.777778 < width){
    width = height*1.777778;
  } else {
    height = width * 0.5625
  }
  var slide = $(".slide");
  slide.css("width", width);
  slide.css("height", height);
  slide.css("font-size", ((width*1.185)/570.0)+"em");
  
  jtv = $(".justintv");
  var jwidth = (width/3);
  jtv.css("width", jwidth + "px");
  jtv.css("height", jwidth*0.75 + "px");
  jtv.css("left", (width - jtv.width() + 11)+"px");
  jtv.css("top", (height - jtv.height() + 51)+"px");
  
  var frameHeight = width/60.0;
  if (frameHeight > 10) frameHeight = 10;
  
  $("#frame").css("font-size", (frameHeight + 5) + "px");
  $("#frame").css("height", (frameHeight * 2)+"px")
  $(".awesome").css("font-size", (frameHeight + 4) + "px");
  

}

function toggleLights(){
  if (lightsOut){
    $("#frame").show();
    $("body").animate({'background-color': "#ccc"});
    $('#showcontainer').css("height", "97%");
    lightsOut = false;
  } else {
    $("#frame").hide();
    $("body").animate({'background-color': "#000"});
    $('#showcontainer').css("height", "100%"); 
    lightsOut = true;
  }
  resizeSlides();
  
}
