$(function(){


$('#crawl').on('click', function(e){
  e.preventDefault();

  //http://localhost:8080/crawl?address=http%3A%2F%2Fwww.google.com&itterations=1&internal=on&format=web
  var formData = {
    address: $('#address').val(),
    itterations: $('#itterations').val(),
    internal: $('#internal').val(),
    format: $('#format').val()
  }

  var address = '/crawl?address=' + formData.address + '&itterations=' + formData.itterations + '&internal=' + formData.internal + '&format=' + formData.web;

  $.get(address, function(linkList){
    console.log(linkList);

    $('#tree').append('<div class="treeLine">' + linkList.data.address + '<ul></ul></div>');
    console.log(linkList.data.links.length);

    var el = '';
    for (var i=0; i<linkList.data.links.length; i++){
      console.log(linkList.data.links[i]);
      el += '<div class="treeLine">' + linkList.data.links[i].address + '</div>';
    }

    $('.treeLine>ul').append(el);


    $('.treeLine').on('click', function(e){
      console.log(e);
      e.stopPropagation();
      $(e.target).find('ul').toggle('fast');
      $(e.target).toggleClass('bold');
    })


  })


})















})