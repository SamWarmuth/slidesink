function save(){  
  if (currentlyEditing) commitObjectChanges();
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
var currentlyEditing = false;

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
    if (currentlyEditing) commitObjectChanges();
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
    $(".edit-overlay").fadeOut(150);
    if (currentObject != "") $(".image-chooser").find("input.src-field").val(currentObject.data.src);
    $(".image-chooser").fadeIn(300);
    return false;
  });
  
  $(".change-image-source").live("click", function(){
    var obj = $("#active-slide .slide-object.selected");
    obj.children("img").attr("src", $(".image-chooser").find("input.src-field").val());
    $(".image-chooser").fadeOut(100);
  });
  
  $(".cancel-image-change").live("click", function(){
    $(".image-chooser").fadeOut(100);
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
    if (currentPos + 172 >= 0) $('#slide-list').stop().animate({top: "0"}, 300, 'easeInOutQuad');
    else $('#slide-list').stop(false, true).animate({top: "+=172"}, 300, 'easeInOutQuad');
  });
  $("#slide-down").click(function(){
    if (parseInt($('#slide-list').css('top')) <= ((slideCount * -100) + 350)) return false
    $('#slide-list').stop(false, true).animate({top: "-=172"}, 300, 'easeInOutQuad');
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
    if ($(this).is(".selected")) return false;
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
    updateObject(obj);
  });
  
  
  $("#active-slide").click(function(e){
    if (e.target.id == "active-slide"){
      if (currentlyEditing) commitObjectChanges();
      $(".edit-overlay").fadeOut(100);
    }
  });
  
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
    
    
    var objData = currentObject.data;
    overlay.text("");
    if (currentObject.o_class == "SOText"){
      overlay.append("<span style='font-size: 1.2em'>Text</span>");
      overlay.append("<div style='float: right; margin-left: 15px; position: relative; top: -2px;' class='awesome medium red delete-current-object'>Delete</div><br/>");
      overlay.append("<div style='clear: both; margin-top: 10px;'></div>");
      overlay.append("<span style='font-size: 0.5em;'>A</span>");
      overlay.append("<input type='radio' name='font-size' value='0.5em'/>")
      overlay.append("<input type='radio' name='font-size' value='1em'/>")
      overlay.append("<input type='radio' name='font-size' value='1.5em'/>")
      overlay.append("<input type='radio' name='font-size' value='2em'/>")
      overlay.append("<input type='radio' name='font-size' value='2.5em'/>")
      overlay.append("<span style='font-size: 1em;'>A</span>");      
      overlay.find("input:radio[name=font-size]").each(function(){
        if ($(this).val() == objData.font_size) $(this).attr('checked', 'checked');
      });
      overlay.append("<br/>");
    } else if (currentObject.o_class == "SOImage"){
      overlay.append("<span style='font-size: 1.2em'>Image</span>");
      overlay.append("<div style='float: right;' class='awesome medium red delete-current-object'>Delete</div><br/>");
      overlay.append("<div style='clear: both; margin-top: 15px;'></div>");
      overlay.append("<div class='awesome medium green edit-image-src'>Change Image Source</div><br/>");
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
    
    
    overlay.css('left', position.left+"px");
    overlay.css('top', (position.top+$(uiObject).height() + 60)+"px");    
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
    tinyObject.css("font-size", objData.font_size);

  } else if (currentObject.o_class == "SOImage"){
    tinyObject.children("img").attr("src", objData.src);

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
