var slideWidth = 882;
var arrow = {left: 37, up: 38, right: 39, down: 40 };
var currentSlide = 0;
var lightsOut = false;

$(document).ready(function(){
  resizeSlides();
  if (window.location.hash.slice(1).length != 0){
    goToSlide(parseInt((window.location.hash).slice(1)));
  }
  
  $("#showcontainer").click(function(){
    goToSlide(currentSlide + 1);
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
  
  $(window).resize(function(){
    resizeSlides();
  });
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
  $(".slide").fadeOut(100);
  $("#slide"+slideNumber).fadeIn(100);
}

function slideRight(){
  goToSlide(currentSlide + 1);
}

function slideLeft(){
  goToSlide(currentSlide - 1);
}

function resizeSlides(){
  var width = $("#showcontainer").innerWidth()-20;
  var height = $("#showcontainer").innerHeight()-20;
  $(".hw").text(width + ":" + height);
  if (height*1.777778 < width){
    width = height*1.777778;
  }
  var slide = $(".slide");
  slide.css("width", width);
  slide.css("height", width*0.5625+"px");
  
  slide.css("font-size", ((width*1.185)/570.0)+"em");
  
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
  
}
