$(function(){
var formData = {};

$('#crawl').on('click', function(e){
  e.preventDefault();

  //http://localhost:8080/crawl?address=http%3A%2F%2Fwww.google.com&itterations=1&internal=on&format=web
  formData = {
    address: $('#address').val(),
    itterations: $('#itterations').val(),
    internal: $('#internal').val(),
    format: $('#format').val()
  }


  getCrawlerData(formData, function(err, linkList){
    //if (err) {console.log(err.error); return; }
    var el = createCrawlerElement(linkList);
    $('#tree').prepend(el);
  })




})



// var formData = {
//   address: $('#address').val(),
//   itterations: $('#itterations').val(),
//   internal: $('#internal').val(),
//   format: $('#format').val()
// }
var getCrawlerData = function(formData, cb){
  var address = '/crawl?address=' + formData.address + '&itterations=' + formData.itterations + '&internal=' + formData.internal + '&format=' + formData.web;

  $.get(address, function(response){
    cb(null, response.data);
  })
    .error(function(response){
      cb(response.responseJSON);  
    });
}


var createCrawlerElement = function(linkList){
  var crawlButton = '<button class="crawlButton">Crawl</button>';
  var $el = $('<div class="crawlerElement"></div>');
  var $address = $('<div class="addressTitle">' + linkList.address + '</div>');

  $address.on('click', function(e){
    $(e.target).parent().find('ul').toggle('fast');
    $(e.target).toggleClass('bold');
  })

  $el.append($address);

  var $ul = $('<ul></ul>');
  for(var i=0; i<linkList.links.length; i++) {
    $ul.append('<li>' + '<span class="linkElement">' + linkList.links[i].address + '</span>' +  crawlButton + '<span class="errorMessage"></span>' + '</li>');
  }

  


  $ul.find('.crawlButton').on('click', function(e){
   
    formData = {
      address: $(e.target).parent().text(),
      itterations: 1,
      internal: $('#internal').val(),
      format: 'json'
    }

    getCrawlerData(formData, function(err, linkList){
      console.log(err);
      console.log(linkList);
      if (err) { 
        $(e.target).parent().find('.errorMessage').append(err.error); 
        $(e.target).prop('disabled', true); 
        return; 
      }
      if (linkList.links.length === 0) { 
        $(e.target).parent().find('.errorMessage').append('Nothing returned'); 
        $(e.target).prop('disabled', true);
        return; 
      }
      var el = createCrawlerElement(linkList);
      $(e.target).parent().replaceWith(el);
    })

  });






  $el.append($ul);
  return $el;
}







})