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



function save(){  
  if (currentlyEditing) commitObjectChanges();
  var basics = {};
  $.each($('#basics').serializeArray(), function(index,value) {
    basics[value.name] = value.value;
  });

  reorderShowSlides();
  $.post("/save-show", {'info':basics, 'slides':showData}, function(data){
    if (data != "") window.location = data;
    else humanMsg.displayMsg('<strong>Show Saved</strong>');
  });
}

function reorderShowSlides(){
  var order = [];
  $("#slide-list").find("li .tiny-slide").each(function(){
    order.push($(this).attr("id"));
  });
  showData.sort(function(a, b){
    return ($.inArray(a.slide_id+"", order)) - ($.inArray(b.slide_id+"", order))
  });
}

var currentSlide = "";
var currentSlideIndex = 0;
var currentObject = "";
var currentField = "";
var currentlyEditing = false;

$("#active-slide .slide-object").liveResizeAndDrag({ handles: 'n, e, s, w, se, sw, ne, nw', containment: "#active-slide"}, {containment: "#active-slide"});

$("#active-slide .slide-object").live("dragstart", function(event, ui) {
  $(".edit-overlay").fadeOut(100);
  $(".colorpicker").fadeOut(100);
  
  $(".slide-object").removeClass("selected");
  $(this).addClass("selected");
});
$("#active-slide .slide-object").live("dragstop", function(event, ui) {
  //update tiny-slide
  updateObject(this);
  showEditOverlay(this);
});
$("#active-slide .slide-object").live("resizestart", function(event, ui) {
  if (currentlyEditing) commitObjectChanges();
  $(".edit-overlay").fadeOut(100);
  $(".colorpicker").fadeOut(100);
  
  $(".slide-object").removeClass("selected");
  $(this).addClass("selected");
});
$("#active-slide .slide-object").live("resizestop", function(event, ui) {
  //update tiny-slide
  updateObject(this);
  showEditOverlay(this);
});

$(".ico-fontcolor").live("click", function(){
  if ($('.colorpicker').is(":visible")){
    $('.colorpicker').fadeOut(200);
    return false;
  }
  var overlay = $(".edit-overlay");
  $.farbtastic('.colorpicker', function(color){
    if (currentlyEditing) commitObjectChanges();
    var obj = $("#active-slide .slide-object.selected");
    currentObject = showData[currentSlideIndex][obj.attr('id')];
    if (currentObject === undefined) return false;
    if (currentObject.o_class != "SOText") return false;
    obj.children(".content").css("color", color);
    updateObject(obj);
  }).setColor(rgbToHex(currentObject.data.color));
  
  overlayPosition = overlay.position();
  $(".colorpicker").css("left", overlayPosition.left + overlay.width() + 25);
  $(".colorpicker").css("top", overlayPosition.top);
  $(".colorpicker").fadeIn(200);
  
});

$(".edit-image-src").live("click", function(){
  $(".edit-overlay").fadeOut(150);
  if (currentObject != "") $(".image-chooser").find("input.src-field").val(currentObject.data.src);
  $(".image-chooser").fadeIn(300);
  return false;
});

$(".image-frame").live("click", function(){
  var obj = $("#active-slide .slide-object.selected");
  obj.children("img").attr("src", $(this).children("img").attr("src"));
  updateObject(obj);
  $(".image-chooser").fadeOut(100);
});

$(".change-image-source").live("click", function(){
  var obj = $("#active-slide .slide-object.selected");
  obj.children("img").attr("src", $(".image-chooser").find("input.src-field").val());
  updateObject(obj);
  $(".image-chooser").fadeOut(100);
});

$(".cancel-image-change").live("click", function(){
  $(".image-chooser").fadeOut(100);
});

$(".ico-text.arrange.back").live("click", function(){
  var obj = $("#active-slide .slide-object.selected");
  var zIndex = parseInt(obj.css("z-index"));
  if (parseInt(obj.css("z-index")) == 1) return false; //already at back
  $("#active-slide .slide-object").each(function(index, element){
    element = $(element);
    if (parseInt(element.css("z-index")) < zIndex){
      element.css("z-index", (parseInt(element.css("z-index")) + 1));
      updateObject(element);
    } 
  });
  obj.css("z-index", 1);
});

$(".ico-text.arrange.backwards").live("click", function(){
  var obj = $("#active-slide .slide-object.selected");
  if (parseInt(obj.css("z-index")) == 1) return false; //already at back
  var zIndex = parseInt(obj.css("z-index"));
  $("#active-slide .slide-object").each(function(index, element){
    element = $(element);
    if (parseInt(element.css("z-index")) == zIndex - 1){
      element.css("z-index", (parseInt(element.css("z-index"))+1));
      updateObject(element);
    } 
  });
  obj.css("z-index", (zIndex - 1));
  
});

$(".ico-text.arrange.forwards").live("click", function(){
  var obj = $("#active-slide .slide-object.selected");
  if (parseInt(obj.css("z-index")) >= Object.keys(showData[currentSlideIndex]).length) return false; //already at front
  var zIndex = parseInt(obj.css("z-index"));
  $("#active-slide .slide-object").each(function(index, element){
    element = $(element);
    if (parseInt(element.css("z-index")) == zIndex + 1){
      element.css("z-index", (parseInt(element.css("z-index")) - 1));
      updateObject(element);
    } 
  });
  obj.css("z-index", (zIndex + 1));
});

$(".ico-text.arrange.front").live("click", function(){
  var obj = $("#active-slide .slide-object.selected");
  var zIndex = parseInt(obj.css("z-index"));
  var totalZ = Object.keys(showData[currentSlideIndex]).length;
  if (parseInt(obj.css("z-index")) >= totalZ) return false; //already at front
  $("#active-slide .slide-object").each(function(index, element){
    element = $(element);
    if (parseInt(element.css("z-index")) > zIndex){
      element.css("z-index", (parseInt(element.css("z-index")) - 1));
      updateObject(element);
    } 
  });
  obj.css("z-index", totalZ);
});

$(".delete-current-object").live("click", function(){
  deleteCurrentObject();
  return false;
});

function deleteCurrentObject(){
  var obj = $("#active-slide .slide-object.selected");
  obj.removeClass("selected");
  obj.fadeOut(150).html("");
  delete showData[currentSlideIndex][obj.attr('id')];
  currentObject = "";
  var tinyObject = currentSlide.children(".slide-object#"+obj.attr('id'));
  tinyObject.fadeOut(100);
  $(".edit-overlay").fadeOut(150);
  return false;
}

$(".tiny-slide").live('click', function(){
  $(".tiny-slide").removeClass("selected");
  $(this).addClass("selected");
  currentSlide = $(this);
  currentSlideIndex = $(".tiny-slide.selected").parent().index();
  $(".edit-overlay").fadeOut(150);
  $(".colorpicker").fadeOut(150);
  
  $("#active-slide").html($(this).html());
  $("#active-slide .slide-object").mouseover();
 });
 
 $("#active-slide .slide-object").live("click", function(){
   $(".colorpicker").fadeOut(100);
   if ($(this).is(".selected")){
     $(".edit-overlay").fadeIn(100);
     return false;
   }
   if (currentlyEditing) commitObjectChanges();
   
   $(".slide-object").removeClass("selected");
   $(this).addClass("selected");
   showEditOverlay(this);
   return false;
 });
 
 $("#active-slide .slide-object").live("dblclick", function(){
   if (currentlyEditing) return false;
   currentObject = showData[currentSlideIndex][$(this).attr('id')];
   if (currentObject.o_class == "SOText"){
     currentlyEditing = true;
     var content = $(this).children(".content");
     content.hide();
     $(this).css("border-color","red");
   
     $(this).append($("<textarea class='text-edit' style='width: 100%; position: relative; top: -3px; left: -3px;'></input>").text(currentObject.data.contents).css('height', $(this).height()).css("font-size", content.css('font-size')));
     $(this).find(".text-edit").focus();
     return false;
   }
 });
 
 $(".edit-overlay input[type=radio]").live("change", function(){
   var obj = $("#active-slide .slide-object.selected");
   obj.css("font-size", $(this).val());
   if (currentlyEditing) commitObjectChanges();
   updateObject(obj);
   repositionOverlay(obj);
 });
var jresponse = "";
$(document).ready(function(){  
  //preload images
  $("<img src='/images/icons/text_align_left.png'/>");
  $("<img src='/images/icons/text_align_right.png'/>");
  $("<img src='/images/icons/text_align_center.png'/>");
  $("<img src='/images/icons/move_back.png'/>");
  $("<img src='/images/icons/move_backwards.png'/>");
  $("<img src='/images/icons/move_forwards.png'/>");
  $("<img src='/images/icons/move_front.png'/>");
  $("<img src='/images/icons/text_bold.png'/>");
  $("<img src='/images/icons/text_italic.png'/>");
  $("<img src='/images/icons/text_underline.png'/>");
  $("<img src='/images/icons/color_wheel.png'/>");
  
  var uploader = new qq.FileUploader({
      element: document.getElementById('upload-image'),
      action: '/edit/uploadimage',
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif'],    
      sizeLimit: 2000000 // max size (2MB)  
  });

  
  $(document).bind('keydown', function(e) {
    if (e.which == 8 && !currentlyEditing){
      deleteCurrentObject();
      return false;
    }
    if (e.which == 83 && !currentlyEditing){
      save();
      return false;
    }
  });
  
  $("#slide-list").sortable();
  

  
  $("#title").keyup(function(){
    if (customUrl == false){
      $("#url").val($(this).val().replace(/ /g,""));
      $("#show-link").attr("href", ("http://www.SlideMirror.com/show/" + $('#url').val()));
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
  
  $(".add-object.text").click(function(){
    var zIndex = Object.keys(showData[currentSlideIndex]).length;
    var defaultHTML = $("<div class='slide-object' style='display: block; position: absolute; left: 10%; top: 10%; opacity: 1.0; width: 30%; height: 15%; color: black; font-size: 1.5em; z-index: " + zIndex + ";'><div class='content'>Text Here</div></div>").attr("id", ((new Date).getTime()%100000000 + ""));
    $(".tiny-slide.selected").append(defaultHTML);
    $("#active-slide").html($(".tiny-slide.selected").html());
    updateObject(defaultHTML, "SOText");
    return false;
  });
  
  $(".add-object.image").click(function(){
    var zIndex = Object.keys(showData[currentSlideIndex]).length;
    var defaultHTML = $("<div class='slide-object' style='display: block; position: absolute; left: 10%; top: 10%; opacity: 1.0; width: 25%; z-index: " + zIndex + ";'><img src='/images/about-sam.jpg' style='width: 100%;' /></div>").attr("id", ((new Date).getTime()%100000000 + ""));
    $(".tiny-slide.selected").append(defaultHTML);
    $("#active-slide").html($(".tiny-slide.selected").html());
    updateObject(defaultHTML, "SOImage");
    return false;
  });
  
  
  $("#post-save").click(function(){
    save();
    return false;
  });
  
  $("#slide-up").click(function(){
    var currentPos = parseInt($("#slide-list").css("top"))
    if (currentPos >= 0) return false;
    if (currentPos + 172 >= 0) $('#slide-list').stop().animate({top: "0"}, 300, 'easeInOutQuad');
    else $('#slide-list').stop(false, true).animate({top: "+=172"}, 300, 'easeInOutQuad');
  });
  
  $("#slide-down").click(function(){
    if (parseInt($('#slide-list').css('top')) <= ((slideCount * -100) + 350)) return false
    $('#slide-list').stop(false, true).animate({top: "-=172"}, 300, 'easeInOutQuad');
  });
  
  
  
  $(".slide-group").live("mouseenter", function(){
    $(this).children(".close-box").fadeIn(50);
  });
  
  $(".slide-group").live("mouseleave", function(){
    $(this).children(".close-box").fadeOut(50);
  });
  $(".close-box").live("click", function(){
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
  
  $("#active-slide").click(function(e){
    if (e.target.id == "active-slide"){
      if (currentlyEditing) commitObjectChanges();
      $("#active-slide .slide-object.selected").removeClass("selected");
      $(".edit-overlay").fadeOut(100);
      $(".colorpicker").fadeOut(100);
    }
  });
  
});

$(".ico-text.align").live("click", function(){
  if (currentlyEditing) commitObjectChanges();
  
  var obj = $("#active-slide .slide-object.selected");
  var alignment = "left";
  if ($(this).hasClass("center")) alignment = "center";
  if ($(this).hasClass("right")) alignment = "right";
  $(".ico-text.align").removeClass("selected");
  $(this).addClass("selected");
  
  
  obj.css("text-align", alignment);
  updateObject(obj);
  repositionOverlay(obj);
});

$(".ico-text.bold").live("click", function(){
  if (currentlyEditing) commitObjectChanges();
  var obj = $("#active-slide .slide-object.selected");
  var text = obj.children(".content");
  
  if ($(this).hasClass("selected")){
    $(this).removeClass("selected");
    text.css("font-weight", "normal");
  }else{
    $(this).addClass("selected");
    text.css("font-weight", "bold");
  }
  updateObject(obj);
  repositionOverlay(obj);
});

$(".ico-text.italic").live("click", function(){
  if (currentlyEditing) commitObjectChanges();
  var obj = $("#active-slide .slide-object.selected");
  var text = obj.children(".content");
  
  if ($(this).hasClass("selected")){
    $(this).removeClass("selected");
    text.css("font-style", "normal");
  }else{
    $(this).addClass("selected");
    text.css("font-style", "italic");
  }
  updateObject(obj);
  repositionOverlay(obj);
});

$(".ico-text.underline").live("click", function(){
  if (currentlyEditing) commitObjectChanges();
  var obj = $("#active-slide .slide-object.selected");
  var text = obj.children(".content");
  
  if ($(this).hasClass("selected")){
    $(this).removeClass("selected");
    text.css("text-decoration", "none");
  }else{
    $(this).addClass("selected");
    text.css("text-decoration", "underline");
  }
  updateObject(obj);
  repositionOverlay(obj);
});

function commitObjectChanges(){
  var obj = $("#active-slide .slide-object.selected");
  currentObject = showData[currentSlideIndex][$(obj).attr('id')];
  currentlyEditing = false;
  if (currentObject.o_class == "SOText"){
    obj.css("border-color", "#E5E5E5")
    var content = obj.children(".content");
    var editField = obj.children(".text-edit");
    content.html(editField.val());
    updateObject(obj);
    editField.remove();
    content.show();
  }
  
}

function showEditOverlay(uiObject){
    var position = $(uiObject).position();
    var overlay = $(".edit-overlay");
    currentObject = showData[currentSlideIndex][$(uiObject).attr('id')];
    
    if (currentObject === undefined) return false;
    
    var objFormat = "<hr/>" +
                    "<div class='ico-text arrange back'></div>" +
                    "<div class='ico-text arrange backwards'></div>" +
                    "<div class='ico-text arrange forwards'></div>" +
                    "<div class='ico-text arrange front'></div>" +
                    "<br/><br/>" +
                    "Stroke" +
                    "<br/>" +
                    "Fill " +
                    "<div class='ico-fillcolor' style='margin: 0; position: relative; top: 5px;'></div>" +
                    "<br/>";
    
    var objData = currentObject.data;
    overlay.text("");
    if (currentObject.o_class == "SOText"){
      overlay.append("<div class='ico-text bold'></div>");
      overlay.append("<div class='ico-text italic'></div>");
      overlay.append("<div class='ico-text underline'></div>");
      
      overlay.append("<div class='ico-text align left' style='margin-left: 10px'></div>");
      overlay.append("<div class='ico-text align center'></div>");
      overlay.append("<div class='ico-text align right'></div>");

      
      

      overlay.append("<div style='clear: both; margin-top: 5px;'></div>");
      overlay.append("<span style='font-size: 0.5em;'>A</span>");
      overlay.append("<input type='radio' name='font-size' value='1em'/>");
      overlay.append("<input type='radio' name='font-size' value='1.5em'/>");
      overlay.append("<input type='radio' name='font-size' value='2em'/>");
      overlay.append("<input type='radio' name='font-size' value='3em'/>");
      overlay.append("<input type='radio' name='font-size' value='4.5em'/>");
      overlay.append("<span style='font-size: 1em;'>A</span>");
      overlay.append("<div class='ico-fontcolor' style='margin-left: 29px; position: relative; top: 5px;'></div>");
      overlay.append(objFormat);

      
           
      overlay.find("input:radio[name=font-size]").each(function(){
        if ($(this).val() == objData.font_size) $(this).attr('checked', 'checked');
      });
      overlay.find(".ico-text.align").each(function(){
        if ($(this).hasClass(objData.text_align)) $(this).addClass("selected");
      });
      if (objData.font_weight == "bold") $(".ico-text.bold").addClass("selected");
      if (objData.font_style == "italic") $(".ico-text.italic").addClass("selected");
      if (objData.text_decoration == "underline") $(".ico-text.underline").addClass("selected");
      
      overlay.append("<br/>");
    } else if (currentObject.o_class == "SOImage"){
      overlay.append("<div class='awesome medium green edit-image-src'>Change Image Source</div><br/>");
      overlay.append(objFormat);
      
    } else{
      overlay.append("Unsupported object type\n");
    }
    /* Basic info for debugging.
    overlay.append("Height: "+ objData.height + "<br/>");
    overlay.append("Width: "+ objData.width + "<br/>");
    overlay.append("x position: "+ objData.left + "<br/>");
    overlay.append("y position:" + objData.top + "<br/>");
    overlay.append("centered: " + objData.center + "<br/>");
    */
    
    
    repositionOverlay(uiObject);
    if (overlay.not(":visible")) overlay.fadeIn(200);
}

function repositionOverlay(uiObject){
  var position = $(uiObject).position();
  var overlay = $(".edit-overlay");
  overlay.css('left', (position.left+ 38)+"px");
  overlay.css('top', (position.top + $(uiObject).height() + 60)+"px");
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
  objData.z_index = uiObject.css("z-index");
  
  objData.left = (100.0*uiObject.position().left/slideWidth)+"%";
  objData.top = (100.0*uiObject.position().top/slideHeight)+"%";
  
  if (currentObject.o_class == "SOText"){
    var content = uiObject.children(".content");
    objData.contents = content.text();
    objData.font_size = uiObject.css("font-size");
    objData.text_align = uiObject.css("text-align");
    objData.color = content.css("color");
    objData.font_weight = content.css("font-weight");
    objData.font_style = content.css("font-style");
    objData.text_decoration = content.css("text-decoration");
    
    

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
  tinyObject.css("z-index", objData.z_index);
  
  if (currentObject.o_class == "SOText"){
    var content = tinyObject.children(".content");
    
    content.text($(uiObject).children(".content").text());
    tinyObject.css("font-size", objData.font_size);
    tinyObject.css("text-align", objData.text_align);
    content.css("color", objData.color);
    content.css("font-weight", objData.font_weight);
    content.css("font-style", objData.font_style);
    content.css("text-decoration", objData.text_decoration);
    
  } else if (currentObject.o_class == "SOImage"){
    tinyObject.children("img").attr("src", objData.src);

  }
  
}

function addSlide(){
  var slideID = ((new Date).getTime()%100000000);
  $("#slide-list").append("<li class='slide-group' style='display: inline-block; position: relative; margin: 0;'><div class='close-box'></div><div class='tiny-slide tmplt-" + showTemplate + "' id='" + slideID + "'></div></div>");
  showData.push({'slide_id':slideID});
  $(".tiny-slide").last().click();
  
  slideCount++;
}


function rgbToHex(rgbString){

  var parts = rgbString
          .match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  ;
  // parts now should be ["rgb(0, 70, 255", "0", "70", "255"]

  delete (parts[0]);
  for (var i = 1; i <= 3; ++i) {
      parts[i] = parseInt(parts[i]).toString(16);
      if (parts[i].length == 1) parts[i] = '0' + parts[i];
  }
  var hexString = parts.join(''); // "0070ff"
  return "#" + hexString
}




