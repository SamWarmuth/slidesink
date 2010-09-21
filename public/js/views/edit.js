
function save(){  
  output = $("#basics").serialize() + "&" + $.map($(".markdown"), function(m){return ($(m).attr('name') + "=" + $(m).text().replace(/&/g, "aMpEr"))}).join("&");
  $.post("/save-show", showData, function(data){
    if (data != "") window.location = data;
    else humanMsg.displayMsg('<strong>Show Saved</strong>');
  });
}
var currentSlide = "";

$(document).ready(function(){
  
  $("#title").focus();
  
  $("#title").keyup(function(){
    if (customUrl == false){
      $("#url").val($(this).val().replace(/ /g,""));
      $("#show-link").attr("href", ("http://www.slidesink.com/show/" + $('#url').val()));
    }
  });
  $("#url").keyup(function(){
    customUrl = true;
    $("#url-preview").text($(this).val());
  });
  
  currentSlide = $(".tiny-slide").first();
  currentSlide.addClass("selected");
  $("#active-slide").html(currentSlide.html());
  
  
  
  $("#add-slide").click(function(){
    
    $("#slide-list").append("<div class='slide-group' style='display: inline-block'><div class='tiny-slide tmplt-'" + showTemplate + "'></div></div>");    
    $(".tiny-slide").last().click();
    
    slideCount++;
    
    return false;
  });
  
  $(".tiny-slide").live('click', function(){
    $(".tiny-slide").removeClass("selected");
    $(this).addClass("selected");
    currentSlide = $(this);
    $("#active-slide").html($(this).html());
   });
  
  
  $("#post-save").click(function(){
    save();
    return false;
  });
  
  $("#slide-up").click(function(){
    var currentPos = parseInt($("#slide-list").css("top"))
    if (currentPos >= 0) return false;
    if (currentPos + 507 >= 0) $('#slide-list').stop().animate({top: "0"}, 300, 'easeInOutQuad');
    else $('#slide-list').stop(false, true).animate({top: "+=345"}, 300, 'easeInOutQuad');
  });
  $("#slide-down").click(function(){
    if (parseInt($('#slide-list').css('top')) <= ((slideCount * -169) + 800)) return false
    $('#slide-list').stop(false, true).animate({top: "-=345"}, 300, 'easeInOutQuad');
  });
  
  $(".tabarea").keydown(function(e){
    if (e.keyCode == 9){
      return false;
    }
  });
  
  $(".slide-group").hover(function(){
    $(this).children(".close-box").fadeIn(50);
  }, function(){
    $(this).children(".close-box").fadeOut(50);
  });

  $(".close-box").click(function(){
    $(this).parent().remove();
  });

  $(".show-templates").click(function(){
    chooser = $(".template-chooser");
    if (chooser.is(":visible")) $(".template-chooser").fadeOut(200);
    else $(".template-chooser").fadeIn(200);

    return false;
  });
  
  $(".template-chooser").find("input:checked").parent().addClass("selected");
  $(".template-chooser").click(function(){
    $(this).children("input:radio").attr('checked', true);
    $(".template-chooser").removeClass("selected");
    $(this).addClass("selected");
    return false;
  });
  
  
  $(".slide-object").live("click", function(){
    if ($(this).parent().hasClass("tiny-slide")) return true;
    $(".slide-object").removeClass("selected");
    $(this).addClass("selected");
    var overlay = $(".edit-overlay")
    overlay.fadeOut(200);
    overlay.animate({left: "+=20"}, 0, 'easeInOutQuad')
    overlay.animate({top: "+=20"}, 0, 'easeInOutQuad')
    
    overlay.text(JSON.stringify(showData[currentSlide.attr('id')][$(this).attr('id')]));
    //move overlay location
    overlay.fadeIn(200);
    
    
  });
  
  
});




$(function(){
  $.extend($.fn.disableTextSelect = function() {
    return this.each(function(){
      if($.browser.mozilla){//Firefox
        $(this).css('MozUserSelect','none');
      }else if($.browser.msie){//IE
        $(this).bind('selectstart',function(){return false;});
      }else{//Opera, etc.
        $(this).mousedown(function(){return false;});
      }
    });
  });
  $('.no-select').disableTextSelect();//No text selection on elements with a class of 'noSelect'
});