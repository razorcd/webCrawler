var httpGet = require('./httpGet.js');

//use with require('./lib/parseWebsite.js').getAllLinks;
//getAllLinks(address, function(err,linkList){} )

//address = website URL
//It will do a get request on the URL and parse the data of the website to return a list of all the content from all <a> elements href attribute;

function getAllLinks(address,cb){
  _getPage(address,function(err,body){
    _getElements(err,body, function(err, elemArray){
      _getLinks(err,elemArray, function(err, linkList){

        if (err) {
          cb(err);
          return;
        }

        cb(null, linkList);
      })
    })
  })
}


//gets the body from web address
function _getPage(address,cb){
  var result = null;
  var address = address;
  //TODO: add timeout in the httpGet module
  httpGet(address, function(err, data, redirected){
    if (err) { console.error("# Error when doing httpGet request on address: ", address); cb(err); return err; }
    cb(null, data);
  });
}


//gets an array of <a href=''> elements from the body
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
       linkList.push(string);
    }
  }
  cb(null, linkList);
  return linkList;
}


//module.exports = getAllLinks;
exports.getAllLinks = getAllLinks;

//export functions for testing
if (process.ENV === 'test') {
  //exports.getAllLinks = getAllLinks;
  exports._getPage = _getPage;
  exports._getElements = _getElements;
  exports._getLinks = _getLinks;
}