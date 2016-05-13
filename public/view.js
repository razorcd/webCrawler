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
    if ($('#format').val() === 'json') {
      return;
    }

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
      if (err) {
        //$('#address').addClass('redbg');
        $('#address').addClass('redbg');
        return;
      }
      $("#tree").append($htmlElement);
    })

    //on address focus: clear the error
    $('#address').on('focus', function(e){
      $('#address').removeClass('redbg');
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
      //console.log(data);
      var renderedTemplate = createRenderedTemplate(data);
      //console.log(renderedTemplate);
      var $el = $(renderedTemplate);
      $el.find(".crawlButton").on("click", crawlButtonOnEvent);
      $el.find(".detailsButton").on("click", detailsButtonOnEvent);
      $el.find(".addressTitle").on("click", setToggleLine);
      $el.find("li:last-child").addClass("last");
      cb(null, $el);
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
    if (err) {
      //alert(err);
      $(e.target).attr({'disabled':'true'});
      $line.find('.url').first().addClass('red');
      var $error = $line.find('.error').first();
      $error[0].innerHTML += err;
      $error.show();
      return;
    }
    $li = $("<li></li>").append($htmlElement);
    $line.replaceWith($li);
  })
}


function detailsButtonOnEvent(e){
  var $linkDetails = $(e.target).parent().parent().children('.linkDetails');
  $linkDetails.slideToggle('fast');
}


function setToggleLine(e){
  e.stopPropagation();

  var $treeLine = $(e.target).parent().parent();
  if($treeLine.children("ul").css('display') === 'none') {
    $treeLine.find(".minusPlus>.smallLine").first().toggle();
    $treeLine.find(".minusPlus").first().toggleClass("minus");
    $treeLine.find(".minusPlus").first().toggleClass("plus");
    $treeLine.children("ul").slideToggle('fast');
  } else {
    $treeLine.children("ul").slideToggle('fast', function(){
      $treeLine.find(".minusPlus>.smallLine").first().toggle();
      $treeLine.find(".minusPlus").first().toggleClass("minus");
      $treeLine.find(".minusPlus").first().toggleClass("plus");
    });
  }
}
