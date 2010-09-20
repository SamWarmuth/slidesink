
function save(){  
  output = $("#basics").serialize() + "&" + $.map($(".markdown"), function(m){return ($(m).attr('name') + "=" + $(m).text().replace(/&/g, "aMpEr"))}).join("&");
  $.post("/save-show", output, function(data){
    alert(data);
    if (data != "") window.location = data;
    else humanMsg.displayMsg('<strong>Show Saved</strong>');
  });
}

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
  
  var firstSlide = $(".tiny-slide").first();
  firstSlide.addClass("selected");
  $("#active-slide").html(firstSlide.html());
  $("#edit-field").val($("#active-mark").html());      
  
  
  $("#add-slide").click(function(){
    
    $("#slide-list").append("<div class='slide-group' style='display: inline-block'><div class='tiny-slide tmplt-'" + showTemplate + "'></div></div>");    
    $(".tiny-slide").last().click();
    
    slideCount++;
    
    return false;
  });
  
  $(".tiny-slide").live('click', function(){
    $("#edit-field").focus();
    $(".tiny-slide").removeClass("selected");
    $(this).addClass("selected");
    $("#active-slide").html($(this).html());
    $("#active-mark").html($('.tiny-slide.selected').siblings(".markdown").html());
    $("#edit-field").val($("#active-mark").html());
   });
  
  $("#edit-field").keyup(function(){
    $("#active-slide").html(new_html);
    $(".tiny-slide.selected").html(new_html);
    
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
    if ($(this).parent().hasClass("tiny-slide")) return true ;
    alert(showData[$(this).attr('id')].o_class);
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