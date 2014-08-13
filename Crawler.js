var request = require('request');
var Event = require('events').EventEmitter;
var http = require('http');
var url = require('url');
var httpGet = require('./httpGet.js');
console.log('-----------------------');




//creating the master crawler object
exports.Master = Master = function(address, itterations, internal){
  var _self = this;

  this.ev = new Event;        //event that will emit done when Slave crawler finished all itterations or 'error' on error

  //delete the ev from this object when done craling
  //on finished check result first
  this.ev.on('finished', function(){
    if (_self.data.links.length !==0) _self.ev.emit('done')
    else _self.ev.emit('error', 'Cannot crawl address');
    delete _self.ev;
  })

  //validating address first
  if ( (address===undefined) || (typeof address !== 'string') || !(_validateUrl(address)) ) {
    process.nextTick(function(){
      _self.ev.emit('error', 'Address not valid');
    })
    return;
  }

  this.ev.done = 0;           //will hold the number of http requests currently in process once crawling stats
  this.mainAddress = address; //main addres. TODO: validate first
  this.itterations = itterations;
  this.internal = (internal ? true : false);

  //..next tick
  this.data = new Slave(address, _getHost(address),itterations, this.internal,this.ev);   //starting the crawler itterations
}






//creating the slave crawler object that will hold all the links in a tree
Slave = function(address,host, itterations, internal, ev){
  //TODO: validate address and host here
  //console.log("-------------Event: ",ev);
  var _self = this;
  this.host = host;
  this.address=address;
  this.validAddress = _validateUrl(_parseAddress(address, host));
  this.httpGetNotResponsive = false;     
  this.itterations=itterations;
  
  this.isInternal = (function(){     //if link is on same host as host
    if (!_self.validAddress) return false;
    if (_self.address[0] === '/') return true;
    var add = _getHost(_self.address);
    add = (add.split('://')[0] === 'http' || add.split('://')[0] === 'https') ? add.split('://')[1] : add;
    var hos = (_self.host.split('://')[0] === 'http' || _self.host.split('://')[0] === 'https') ? _self.host.split('://')[1] : _self.host;
    return add === hos;
  })();


  this.links = [];
  //redirect = false;

  
  //start crawling function
  if (!(internal && !_self.isInternal)) {   //start crawling only if NOT (internal is checked and the address is not internal)
    (function(addr,host,itt,internal,ev){
      console.log("Itt: ", itt, "   Address: ", addr, "    Host: ", host);
      if (itt>0){
        if (!ev.done) ev.done=0;                          //(re)initiliasing curent itterations under execution  counter
        ev.done++;                                        //itterations in process counter +1
        getAllLinks(addr,host,function(err, linksList){        
          if(err) {   //getAllLinks returned err
            console.log('object error');
            _self.httpGetNotResponsive = true;
          } else {    //getAllLinks returned a list with links
            for(var i=0;i<linksList.length;i++){  //doing another itteration for each link in the list
              var tempHost = _getHost(addr) || host;
               _self.links.push(new Slave(linksList[i], tempHost, itt-1, internal, ev));
            }
          }
          ev.done--;
          //if finished:
          if (ev.done === 0 ) process.nextTick(function(){ ev.emit('finished') }); //emit 'done'.    //TOGO(ad 5 lines below:  if (ev.done === 0 ) setTimeout( function(){ if (ev.done === 0 ) ev.emit('done');}, 500); //to check if no more requests are waiting / delaying
        })
      } //else process.nextTick(function(){ ev.emit('done'); });
    }(this.address,this.host,this.itterations, internal, ev));
  } //else process.nextTick(function(){ ev.emit('done'); });

}









function _parseAddress(address, host){
  if (address[0] === '/') address = host+address;
  if (address.slice(0,4) === 'www.') address = 'http://'+address;   //TODO: if (address.slice(0,t) !== 'http://') address = 'http://'+address;
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
  var address = address;
  // request.get(address, function(err, response, body){
  //   if (err) { console.error("######## Error request on address: ", address); cb(err); return err; }
  //   cb(null, body);
  // });

  httpGet(address, function(err, data, redirect){
    if (err) { console.error("######## Error request on address: ", address); cb(err); return err; }
    //console.log("!!!!!!!!!!")
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
  // TODO: still needs work
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  return reg.test(address);
}

//getAllLinks(address, function(err,Slaveect){} )
function getAllLinks(address,host,cb1){
  if (!address || typeof address !== 'string') {
    cb1('Error: addres is not a string');
    return;
  }

  //validate
/*  if (!_validateUrl(address)) {
      cb('Error: addres is not valid');
      return;
  }*/

  address = _parseAddress(address, host);

  

  _getPage(address,function(err,body){
    _getElements(err,body, function(err, elemArray){
      _getLinks(err,elemArray, function(err, linkList){

        if (err) {
          //ev.done --;
          cb1(err);
          return;
        }

        //console.log('Got a linkList');
        cb1(null, linkList);
        //ev.done--;
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
  exports.Slave = Slave;
}