var request = require('request');
var Event = require('events').EventEmitter;
var http = require('http');
var url = require('url');
var httpGet = require('./httpGet.js');
console.log('-----------------------');


Obj = function(address,oldhost, itterations, ev){
  //console.log("-------------Event: ",ev);
  this.host = oldhost;
  this.address=address;
  this.itterations=itterations;
  this.links = [];

  var _self = this;
  (function(addr,host,itt,ev){
    console.log("Itt: ", itt, "   Address: ", addr);

    if (itt>0){
      getAllLinks(addr,host,ev,function(err, linksList){
        linksList = linksList || [];
        for(var i=0;i<linksList.length;i++){
          var tempHost = _getHost(addr) || host;
           _self.links.push(new Obj(linksList[i], tempHost,itt-1,ev));
           //console.log('Self: ',_self);
         }
           //console.log(linksList);
      })
    } 
  }(this.address,this.host,this.itterations,ev));
}


exports.BigObj = BigObj = function(address, itterations){
  this.ev = new Event;
  this.ev.done = 0;
  this.mainAddress = address;
  this.data = new Obj(address, _getHost(address),itterations, this.ev);
}


function _parseAddress(address, host){
  if (address[0] === '/') address = host+address;
  if (address.slice(0,4) === 'www.') address = 'http://'+address;
  return address;
}

function _getHost(address){
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  var newHost = reg.exec(address);
  if (newHost && newHost instanceof Array && newHost[0]!=='/') return newHost[0];
  else return '';
}


//gets the body from web address
function _getPage(address,cb){
  var result = null;
  var address = address || this.address;
  // request.get(address, function(err, response, body){
  //   if (err) { console.error("######## Error request on address: ", address); cb(err); return err; }
  //   cb(null, body);
  // });

  httpGet(address, function(err, data, redirect){
    if (err) { console.error("######## Error request on address: ", address); cb(err); return err; }
    cb(null, data);
  });
  



 
}


//gets an array od <a href=''> elements from the body
function _getElements(err, body, cb){
  if(err) {
    cb(err);
    return err;
  }
  if (typeof body !=='string') {
    cb({error: 'body is not a string type'});
    return;
  }

  var element = 'a';
  var startEmelent = '<'+element+' ';
  var iterate = true;
  var elemArray = [];

  while (iterate){
    var i = 0, start= -1, fin= -1, quotes1=false;quotes2=false;

    start = body.search(startEmelent);
    if (start !== -1) {
      body = body.slice(start + startEmelent.length);
      
      //fin = body.search('>');    //seach step by step
      for (i=0;i<body.length;i++){
        if( body[i] === '"' && !quotes2) quotes1 = !quotes1;
        if( body[i] === "'" && !quotes1) quotes2 = !quotes2;
        if (body[i] === '>' && !quotes1 && !quotes2) break;
      }
      fin =i;

      if (fin !== -1) {
        elemArray.push( startEmelent + body.slice(0, fin+1) );
        body = body.slice(fin+1);
      }
    } else iterate = false;

  }

  cb(null,elemArray);
  //return elemArray;
}


function _getLinks(err, elemArray, cb){
  if(err) {
    cb(err);
    return err;
  }
  if (!(elemArray instanceof Array)) {
    cb('input is not an array');
    return;
  }

  var len = elemArray.length;
  var l, quotes, string;
  var linkList = [];
  for (var i=0; i<len; i++){
    string = elemArray[i];
    l = string.search('href=');
    if (l !== -1 && string.length > 11) {    //'<a href="">'.length = 11
       quotes=string[l+5];
       string = string.slice(l+6);
       try {
        l = string.search(quotes);
       } catch(e) {
        console.log("Quotes: ", quotes);
        console.log("String: ", string);
        console.log("ERRORRR:" ,e);
       }
       string = string.slice(0,l);
       if (string !== '') linkList.push(string);
    }
  }
  cb(null, linkList);
  return linkList;
}

function _validateUrl(address){
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  return reg.test(address);
}

//getAllLinks(address, function(err,object){} )
function getAllLinks(address,host,ev,cb){
  if (!address || typeof address !== 'string') {
    cb('Error: addres is not a string',[]);
    return;
  }

  //validate
  // if (!_validateUrl(address)) {
  //     cb('Error: addres is not valid');
  //     return;
  // }

  address = _parseAddress(address, host);

  if (!ev.done) ev.done=0;
  ev.done++;

  _getPage(address,function(err,body){
    _getElements(err,body, function(err, elemArray){
      _getLinks(err,elemArray, function(err, linkList){
        if (err) {
          cb(err);
          return;
        }
        //console.log('Got a linkList');
        cb(null, linkList);

        ev.done--;
        if (ev.done === 0 ) ev.emit('done'); //emit 'done'.
      })
    })
  })
}








//export functions for testing
if (process.ENV === 'test') {
	exports.getAllLinks = getAllLinks;
  exports._getPage = _getPage;
  exports._getElements = _getElements;
	exports._getLinks = _getLinks;
  exports.getAllLinks = getAllLinks;
  exports._parseAddress = _parseAddress;
  exports._getHost = _getHost;
  exports.Obj = Obj;
}