function save(){  
  var basics = {};
  $.each($('#basics').serializeArray(), function(index,value) {
    basics[value.name] = value.value;
  });
  
  $.post("/save-show", {'info':basics, 'slides':showData}, function(data){
    if (data != "") window.location = data;
    else humanMsg.displayMsg('<strong>Show Saved</strong>');
  });
}
var currentSlide = "";
var currentSlideIndex = 0;
var currentObject = "";
var currentField = "";

$(document).ready(function(){  
  $("#active-slide .slide-object").liveResizeAndDrag({ handles: 'e, s, se', containment: "#active-slide"}, {containment: "#active-slide"});
  
  $("#active-slide .slide-object").live("dragstart", function(event, ui) {
    $(".edit-overlay").fadeOut(100);
    $(".slide-object").removeClass("selected");
    $(this).addClass("selected");
  });
  $("#active-slide .slide-object").live("dragstop", function(event, ui) {
    //update tiny-slide
    updateObject(this);
    showEditOverlay(this);
  });
  $("#active-slide .slide-object").live("resizestart", function(event, ui) {
    $(".edit-overlay").fadeOut(100);
    $(".slide-object").removeClass("selected");
    $(this).addClass("selected");
  });
  $("#active-slide .slide-object").live("resizestop", function(event, ui) {
    //update tiny-slide
    updateObject(this);
    showEditOverlay(this);
  });
  
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
  $("#active-slide .slide-object").mouseover();
  
  
  $("#add-slide").click(function(){
    addSlide();
    return false;
  });
  
  $(".add-text-object").click(function(){
    var defaultHTML = $("<div class='slide-object' style='display: block; position: absolute; left: 10%; top: 10%; opacity: 1.0; width: 25%; color: black; font-size: 1em;'><div class='content'>Text Here</div></div>").attr("id", ((new Date).getTime()%100000000 + ""));
    $(".tiny-slide.selected").append(defaultHTML);
    $("#active-slide").html($(".tiny-slide.selected").html());
    updateObject(defaultHTML, "SOText");
    return false;
  });
  
  $(".add-image-object").click(function(){
    var defaultHTML = $("<div class='slide-object' style='display: block; position: absolute; left: 10%; top: 10%; opacity: 1.0; width: 25%;'><img src='/images/about-sam.jpg' style='width: 100%;' /></div>").attr("id", ((new Date).getTime()%100000000 + ""));
    $(".tiny-slide.selected").append(defaultHTML);
    $("#active-slide").html($(".tiny-slide.selected").html());
    updateObject(defaultHTML, "SOImage");
    return false;
  });
  
  $(".edit-image-src").live("click", function(){
    alert("Not ready yet.");
    return false;
  });
  
  $(".delete-current-object").live("click", function(){
    var obj = $("#active-slide .slide-object.selected");
    obj.removeClass("selected");
    obj.fadeOut(150).html("");
    delete showData[currentSlideIndex][obj.attr('id')];
    currentObject = "";
    var tinyObject = currentSlide.children(".slide-object#"+obj.attr('id'));
    tinyObject.fadeOut(100);
    $(".edit-overlay").fadeOut(150);
    return false;
  });
  
  $(".tiny-slide").live('click', function(){
    $(".tiny-slide").removeClass("selected");
    $(this).addClass("selected");
    currentSlide = $(this);
    currentSlideIndex = $(".tiny-slide.selected").parent().index();
    $(".edit-overlay").fadeOut(150);
    $("#active-slide").html($(this).html());
    $("#active-slide .slide-object").mouseover();
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
    var index = $(this).parent().index();
    if (index != -1) showData.splice(index, 1);
    if ($(this).parent().is(".selected")) $(".tiny-slide").first.click();
    $(this).parent().remove();
  });

  $(".show-templates").click(function(){
    chooser = $(".template-chooser");
    if (chooser.is(":visible")) $(".template-chooser").fadeOut(200);
    else $(".template-chooser").fadeIn(200);

    return false;
  });
  
  $(".template-chooser").find("input:checked").parent().addClass("selected");
  $(".tiny-slide-demo").click(function(){
    $(this).children("input:radio").attr('checked', true);
    $(".tiny-slide-demo").removeClass("selected");
    $(this).addClass("selected");
    return false;
  });
  
  
  $("#active-slide .slide-object").live("click", function(){
    $(".slide-object").removeClass("selected");
    $(this).addClass("selected");
    showEditOverlay(this);
    return false;
  });
  
  $(".edit-overlay .contents").live("keyup", function(){
    var obj = $("#active-slide .slide-object.selected");
    obj.children(".content").text($(this).val());
    updateObject(obj);
  });
  
  
  $("#active-slide").click(function(e){
    if (e.target.id == "active-slide") $(".edit-overlay").fadeOut(100);
  });
  
});

function showEditOverlay(uiObject){
    var offset = $(uiObject).offset();
    var overlay = $(".edit-overlay");
    currentObject = showData[currentSlideIndex][$(uiObject).attr('id')];
    
    if (currentObject === undefined) return false;
    
    
    var objData = currentObject.data;
    overlay.text("");
    if (currentObject.o_class == "SOText"){
      overlay.append("<span style='font-size: 1.2em'>Text</span>");
      overlay.append("<div style='float: right;' class='awesome medium red delete-current-object'>Delete</div><br/>");
      overlay.append("<div style='clear: both;'></div> text = ");
      overlay.append($("<input type='text' class='contents'/>").attr("value", objData.contents));
      overlay.append("<br/>");
      overlay.append("font size = ");
      overlay.append($("<input type='text' class='font-size' style='width: 50px'/>").attr("value", objData.font_size));
      overlay.append("<br/>");
      overlay.find(".contents").focus();
    } else if (currentObject.o_class == "SOImage"){
      overlay.append("<span style='font-size: 1.2em'>Image</span>");
      overlay.append("<div style='float: right;' class='awesome medium red delete-current-object'>Delete</div><br/>");
      overlay.append("<div style='clear: both;'><br/></div>");
      overlay.append("<div class='awesome medium green edit-image-src'>Change Image Source</div><br/>");
      overlay.append("<br/>");
    } else{
      overlay.append("Unsupported object type\n");
    }
    /* Basic info for debugging.
    overlay.append("Height: "+ objData.height + "<br/>");
    overlay.append("Width: "+ objData.width + "<br/>");
    overlay.append("x position: "+ objData.left + "<br/>");
    overlay.append("y position:" + objData.top + "<br/>");
    */
    
    overlay.append("centered: " + objData.center + "<br/>");
    
    overlay.css('left', offset.left+"px");
    overlay.css('top', (offset.top+$(uiObject).height() + 5)+"px");    
    if (overlay.not(":visible")) overlay.fadeIn(200);
}

function updateObject(uiObject, classIfNew){
  uiObject = $(uiObject);
  if (classIfNew != undefined) showData[currentSlideIndex][uiObject.attr('id')] = {'data':{}, 'o_class':classIfNew};
  currentObject = showData[currentSlideIndex][$(uiObject).attr('id')];
  if (currentObject === undefined) return false;
  var objData = currentObject.data;
  
  slide = $("#active-slide");
  slideWidth = slide.width();
  slideHeight = slide.height();
  objData.width = (100.0*uiObject.width()/slideWidth)+"%";
  objData.height = (100.0*uiObject.height()/slideHeight)+"%";
  
  objData.left = (100.0*uiObject.position().left/slideWidth)+"%";
  objData.top = (100.0*uiObject.position().top/slideHeight)+"%";
  
  if (currentObject.o_class == "SOText"){
    objData.contents = uiObject.children(".content").text();
    objData.font_size = uiObject.css("font-size");

  } else if (currentObject.o_class == "SOImage"){
    objData.src = uiObject.children("img").attr("src");

  } else{
    overlay.append("Unsupported object type\n");
  }
  
  updateTinySlide(uiObject);
}

function updateTinySlide(uiObject){
  currentObject = showData[currentSlideIndex][$(uiObject).attr('id')];
  if (currentObject === undefined) return false;
  var objData = currentObject.data;
  
  var tinyObject = currentSlide.children(".slide-object#"+$(uiObject).attr('id'));
  
  tinyObject.width(objData.width);
  tinyObject.height(objData.height);
  tinyObject.css("left", objData.left);
  tinyObject.css("top", objData.top);
  
  if (currentObject.o_class == "SOText"){
    tinyObject.children(".content").text($(uiObject).children(".content").text());

  } else if (currentObject.o_class == "SOImage"){
    //objData.src = $(uiObject).text();

  }
  
}

function addSlide(){
  var slideID = ((new Date).getTime()%100000000);
  $("#slide-list").append("<div class='slide-group' style='display: inline-block; position: relative'><div class='tiny-slide tmplt-" + showTemplate + "' id='" + slideID + "'></div></div>");
  showData.push({'slide_id':slideID});
  $(".tiny-slide").last().click();
  
  slideCount++;
}




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

(function ($) {
   jQuery.fn.liveResizeAndDrag = function (resizeOpts, dragOpts) {
      this.live("mouseover", function() {
         if (!$(this).data("init")) {
            $(this).data("init", true).resizable(resizeOpts).draggable(dragOpts);
         }
      });
   };
})(jQuery);
