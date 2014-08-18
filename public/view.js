//load template
var template;
 $.get('template/template.mst', function(data){
  console.log("Template loaded successfuly");
  template = data;
})
 .error(function(err){
  console.error("Error requesting template: ", err);
 })


$(function(){

  $("#crawl").on("click", function(e){
    var formData = {
      address: $('#address').val(),
      itterations: $('#itterations').val(),
      internal: $('#internal').val(),
      format: $('#format').val(),
      id: Date.now()
    }

    //VALIDATE  /  REQUIRED
    e.preventDefault();

    createHtmlElement(formData, function(err, $htmlElement){
      if (err) alert(err);
      $("#tree").append($htmlElement);  
    })
    
  })


})



// *** FUNCTIONS :


//Mustache temlate Creation
//cb(err, $htmlElement)
function createHtmlElement(formData, cb){

    getCrawlerData(formData, function(requestErr, dataErr, data){
      if(requestErr) { console.error(requestErr); cb(requestErr); return; }
      if(dataErr) { console.error(dataErr); cb(dataErr); return; }
      console.log(data);
      var renderedTemplate = createRenderedTemplate(data);
      console.log(renderedTemplate);
      var $el = $(renderedTemplate);
      $el.find(".crawlButton").on("click", crawlButtonOnEvent);
      $el.find(".addressTitle").on("click", setToggleLine);
      $el.find("li:last-child").addClass("last");
      $li = $("<li></li>").append($el);
      cb(null, $li);
    })


}


//AJAX data request
var getCrawlerData = function(formData, cb){
  var address = '/crawl?address=' + formData.address + '&hostaddress=' + (formData.hostaddress||'') 
      + '&itterations=' + 1 + '&internal=' + formData.internal + '&format=' + formData.web;

  $.ajax({
    type: "GET",
    url: address
  })
   .done(function(response, statusText, xhr){
      if(response.error) {
        cb(null, response.error);
        return;
      }
      cb(null, null, response);
    })
    .error(function(response){
      cb(response.responseText);
    });
}



function createRenderedTemplate(data){
  Mustache.parse(template);
  var renderedTemplate = Mustache.render(template, data);
  return renderedTemplate;
}

function crawlButtonOnEvent(e){
  var $line = $(e.target).parent().parent();
  var link = $line.data('parsedurl');

  var formData = {
    address: link,
    itterations: 1,
    //internal: $('#internal').val(),
    format: 'json',
    id: Date.now()
  }

  createHtmlElement(formData, function(err, $htmlElement){
    if (err) alert(err);
    $line.replaceWith($htmlElement);  
  })
}

function setToggleLine(e){
  e.stopPropagation();
  var $treeLine = $(e.target).parent().parent();

  $treeLine.children("ul").slideToggle('slow', function(){
    $treeLine.find(".minusPlus>.smallLine").first().toggle();
    $treeLine.find(".minusPlus").first().toggleClass("minus");
    $treeLine.find(".minusPlus").first().toggleClass("plus");
  });
}