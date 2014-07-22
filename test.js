var request = require('request');
var Event = require('events').EventEmitter;
console.log('-----------------------');

var done = 0;

var e = new Event;

e.on('done', function(){
  console.log('DONE');
})







var Obj = function(address, itterations){
  this.address=address;
  this.itterations=itterations;

  this.links = [];

  var _self = this;
  (function(addr,itt){
    console.log("Itt: ", itt, "   Address: ", addr);

    if (itt>0 && addr[0] === 'h'){
      getAllLinks(addr, function(err, linksList){
    
        for(var i=0;i<linksList.length;i++){
           _self.links.push(new Obj(linksList[i], itt-1));
           //console.log('Self: ',_self);
         }
           console.log(linksList);
      })
    }
    
    //return [];
  }(this.address,this.itterations));
}



// function getAllLinks (address, cb){
//   done++;
//   setTimeout(function(){
//     var llist = [ 'dfgds', 'dgdsgdsf','ffffff'];
//     cb(null, llist);
//     done--;
//     if (done === 0 ) e.emit('done'); //emit 'done'.
//   }, 100);
// }


var o1 = new Obj("http://www.google.com/", 2);
console.log('o1: ',o1);
//console.log('o1.links[1].links: ',o1.links[0].links);

setTimeout(function(){
  console.log('o1: ', o1);
}, 4000);





function _getPage(address,cb){
  var result = null;
  var address = address || this.address;
  request.get(address, function(err, response, body){
    if (err) { cb(err); return err; }
    cb(null, body);
  });
}



function _getElements(err, body, cb){
  if(err) {
    cb(err);
    return err;
  }

  var element = 'a';
  var iterate = true;
  var elemArray = [];

  while (iterate){
    var i = 0, start= -1, fin= -1;

    start = body.search('<'+element+' ');
    fin = body.search('</'+element+'>');
    
    if (start !== -1 && fin !== -1) {
      elemArray.push( body.substr(start, fin-start+element.length+3));
      body = body.slice(fin+element.length+3);
    } else iterate = false;
  }

  cb(null,elemArray);
  return elemArray;
}


function _getLinks(err, elemArray, cb){
  if(err) {
    cb(err);
    return err;
  }

  var len = elemArray.length;
  var l, quotes, string;
  var linkList = [];
  for (var i=0; i<len; i++){
    string = elemArray[i];
    l = string.search('href=');
    if (l !== -1 && string.length > 5) {
       quotes=string[l+5];
       string = string.slice(l+6);
       l = string.search(quotes);
       string = string.slice(0,l);
       linkList.push(string);
    }
  }
  cb(null, linkList);
  return linkList;
}



//getAllLinks(address, function(err,object){} )
function getAllLinks(address,cb){
  done++;
  
  
  var object = {
    address: address,
    links: []
  }

  _getPage(address,function(err,body){
    _getElements(err,body, function(err, elemArray){
      _getLinks(err,elemArray, function(err, linkList){
        console.log('Got a linkList');
        //object.links = linkList;
        cb(null, linkList);

        done--;
        if (done === 0 ) e.emit('done'); //emit 'done'.
      })
    })
  })

}





module.exports = Obj;
