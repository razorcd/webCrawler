$(function(){
var formData = {};

//CRAWL Button Event
$('#crawl').on('click', function(e){

  //http://localhost:8080/crawl?address=http%3A%2F%2Fwww.google.com&itterations=1&internal=on&format=web
  formData = {
    address: $('#address').val(),
    itterations: $('#itterations').val(),
    internal: $('#internal').val(),
    format: $('#format').val(),
    id: Date.now()
  }
  console.log(formData.format);
  //vadiation:
  if (formData.itterations>3) { e.preventDefault(); return; }
  if (formData.format === 'json') return;
  
  toggleCrawlBut(e.target); //disable crawl button
  e.preventDefault();
  
  getCrawlerData(formData, function(err, linkList){
    //if (err) {console.log(err.error); return; }
    var el = createCrawlerElement(linkList, formData.id);
    $('#tree').prepend(el);

    if (formData.itterations<=1) {
      toggleCrawlBut(e.target); // enable Crawl button
      return;  
    }
    //if itteration is bigger then 1 keep crawling:
    
      
      console.log(formData.id);
      //itterate(el);

      //itterate clicking Crawl button
      (function itterate(el){
        if (formData.itterations<=1) {
          //itterations ended
          toggleCrawlBut(e.target);
          return;  
        }
        formData.itterations--;
        console.log(el.find('.crawlButton'));
        var buttons = el.find('.crawlButton');

        (function executeButtonsSync(buttons,i){
          if (i>buttons.length-1) {
            itterate(el);
            return;
          } 
          $(buttons[i]).trigger('click', function(){ executeButtonsSync(buttons, ++i) } );
          //buttons.shift();
          //if (executeButtonsSync(buttons);
        })(buttons,0)


      })(el);

  })

})

//perform AJAX request. Returns a html element that contains the address title, list of winks with click events.
/* var formData = {
*    address: $('#address').val(),
*    itterations: $('#itterations').val(),
*    internal: $('#internal').val(),
*    format: $('#format').val()
*/ 
var getCrawlerData = function(formData, cb){
  var address = '/crawl?address=' + formData.address + '&hostaddress=' + (formData.hostaddress||'') 
      + '&itterations=' + 1 + '&internal=' + formData.internal + '&format=' + formData.web;

  $.get(address, function(response){
    cb(null, response.data);
  })
    .error(function(response){
      cb(response.responseJSON);  
    });
}

//creates the html list of links
var createCrawlerElement = function(linkList, id){
  var crawlButton = '<button class="crawlButton">Crawl</button>';               //Crawl button for links in lists
  var $el = $('<div class="crawlerElement"></div>');                            //div for titleAdress and list of links
  if (id) $el.attr({'id':id});                                                  //adding an id to main element
  var $address = $('<div class="addressTitle"> <span class="sign minus"></span>' + linkList.address + '</div>'); //title address from top of each list
  $address.attr('data-host', linkList.host);

  //showing/hiding list:
  $address.on('click', function(e){
    e.stopPropagation();
    $(e.target).find('.sign').toggleClass('minus');
    $(e.target).find('.sign').toggleClass('plus');
    var hideEl =  $(e.target).parent().find('ul');  //if clicked on the text get the list element
    hideEl.slideToggle('slow');  // hide/show list
  })

  $el.append($address);     //add the title address to main div


  var $ul = $('<ul></ul>');
  //adding each link into the list:
  for(var i=0; i<linkList.links.length; i++) {
    $ul.append('<li>' + '<span class="linkElement">' + linkList.links[i].address + '</span>' 
      +  crawlButton + '<span class="errorMessage"></span>' + '<div style="clear:both"></div>' + '</li>');
  }

  

  //crawl button for each link click event. Executs a crawl for the current link:
  $ul.find('.crawlButton').on('click', function(e,cb2){
    console.log( $(e.target).parent().parent().parent().find('.addressTitle').data('host'));
    $(e.target).text('Crawling...');
    formData = {
      address: $(e.target).parent().find('.linkElement').text(),
      hostaddress: $(e.target).parent().parent().parent().find('.addressTitle').data('host'),
      itterations: 1,
      internal: $('#internal').val(),
      format: 'json'
    }



    //executes ajax request:
    getCrawlerData(formData, function(err, linkList){

      if (err) { 
        $(e.target).parent().find('.errorMessage').append(err.error); 
        $(e.target).parent().find('.errorMessage').css({'display': 'block'});
        $(e.target).remove();
        if (cb2) cb2();
        return; 
      }
      if (linkList.links.length === 0) { 
        $(e.target).parent().find('.errorMessage').append('Nothing returned ... delete this line'); 
        $(e.target).parent().find('.errorMessage').css({'display': 'block'});
        $(e.target).remove();
        if (cb2) cb2();
        return; 
      }

      //if no error create new element with address and link list
      var el = createCrawlerElement(linkList);
      //$(el).css({'display':'none'});
      el.find('ul').css({'display':'none'});

      //replace old link with new list of links
      $(e.target).parent().replaceWith(el);
      if (cb2) cb2();
    })

  });






  $el.append($ul);
  return $el;
}







})



function toggleCrawlBut(but){
  if (!$(but).attr('disabled')){
    $(but).val('Crawling...');
    $(but).attr({'disabled':'true'});
  } else {
    $(but).val('Crawl');
    $(but).removeAttr('disabled');
  }
}