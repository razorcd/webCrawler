// URL object looks like this:
/* {
*   obj.originalUrl,
*   obj.originalHost,
*   obj.originalMainHost,
*   obj.isValid,          -> validates all addresses (boolean)
*   obj.urlIsInteral,     -> url is like '/about'
*   obj.parsedUrl,        -> parsing url to "http://www.google.com/about" format
*   obj.parsedHost,       -> parsing host to "http://www.google.com" format
*   obj.parsedMainHost,   -> parsing mainHost to "http://www.google.com" format
*   obj.sameAsHost,       -> parsedUrl and parsedHost share same url (like http://www.google.com) (boolean)
*   obj.sameAsMainHost    -> parsedUrl and parsedMainHost share same url (like http://www.google.com) (boolean)
*  }
*/

// Use like this (it will add the 'http://' part, if missing):
/*  
*   var u = new URL(url, mainHost, host)
*
*   var u = new URL("www.google.com/about", "www.google.com/about") =>  u.parsedUrl = 'http://www.google.com/about'; 
                                                                        u.parsedHost = "http://www.google.com";
                                                                        u.parsedMainHost = "http://www.google.com";
                                                                        u.isValid = true;
                                                                        u.originalUrl = "www.google.com/about";
                                                                        u.originalHost = undefined
                                                                        u.originalMainHostUrl = "www.google.com/about";
                                                                        u.urlIsInteral = false;
                                                                        u.sameAsHost = true;
                                                                        u.sameAsMainHost = true;

*   var u = new URL("www.google.com/about", "www.google.com", "www.google.com") =>  u.parsedUrl = 'http://www.google.com/about'; 
                                                                                    u.parsedHost = "http://www.google.com";
                                                                                    u.parsedMainHost = "http://www.google.com";
                                                                                    u.isValid = true;
                                                                                    u.originalUrl = "www.google.com/about";
                                                                                    u.originalHost = "www.google.com";
                                                                                    u.originalMainHostUrl = "www.google.com/about";
                                                                                    u.urlIsInteral = false;
                                                                                    u.sameAsHost = true;
                                                                                    u.sameAsMainHost = true;

*   var u = new URL("/about", "www.google.com", "www.google.com")  =>   u.parsedUrl = 'http://www.google.com/about'; 
                                                                        u.parsedHost = "http://www.google.com";
                                                                        u.parsedMainHost = "http://www.google.com";
                                                                        u.isValid = true;
                                                                        u.originalUrl = "/about";
                                                                        u.originalHost = "www.google.com"
                                                                        u.originalMainHostUrl = "www.google.com/about";
                                                                        u.urlIsInteral = true;
                                                                        u.sameAsHost = true;
                                                                        u.sameAsMainHost = true;

*   var u = new URL("hfghfgh", "dgdfgdfg", "sdfsdf")          =>    u.parsedUrl = undefined ;
                                                                    u.parsedHost = undefined ;
                                                                    u.parsedMainHost = undefined
                                                                    u.isValid = false;
                                                                    u.originalUrl = "hfghfgh";
                                                                    u.originalHost = "sdfsdf"
                                                                    u.originalMainHost = "dgdfgdfg"
                                                                    u.urlIsInteral = undefined;
                                                                    u.sameAsHost = undefined;
                                                                    u.sameAsMainHost = undefined;

*   var u = new URL("/about")                                 =>    u.parsedUrl = undefined ;
                                                                    u.parsedHost = undefined ;
                                                                    u.parsedMainHost = undefined
                                                                    u.isValid = false;
                                                                    u.originalUrl = "/about";
                                                                    u.originalHost = "undefined"
                                                                    u.originalMainHost = undefined;
                                                                    u.urlIsInteral = undefined;
                                                                    u.sameAsHost = undefined;
                                                                    u.sameAsMainHost = undefined;

*   var u = new URL("/about", "www.google.com")               =>    u.parsedUrl = undefined ;
                                                                    u.parsedHost = undefined ;
                                                                    u.parsedMainHost = undefined
                                                                    u.isValid = false;
                                                                    u.originalUrl = "/about";
                                                                    u.originalHost = "undefined"
                                                                    u.originalMainHost = undefined;
                                                                    u.urlIsInteral = undefined;
                                                                    u.sameAsHost = undefined;
                                                                    u.sameAsMainHost = undefined;

*/

var URL = function(url, mainHost, host){
  this.originalUrl = url;
  this.originalHost = host;
  this.originalMainHost = mainHost;
  
  //check if url and host(if exists) are strings and a valid urls
  this.isValid = (function(){
    //check if strings:
    if ((!url) || ((url !== undefined) && (typeof url !== 'string')))   {
      return false;
    }
    if ((!mainHost) || ((mainHost !== undefined) && (typeof mainHost !== 'string')))   {
      return false;
    }
    if (host && (typeof host !== 'string')) {
      return false;
    }
    
    //if url is internal and host is not defined => isValid=false
    if(!host && !mainHost && _checkIfInternal(url)) return false;

    if(!host && mainHost && _checkIfInternal(url)) host = mainHost;    //if url is internal and host is missing the host = mainhost

    //validate:
    var validHost = true;
    if (host !== undefined) validHost = _validate(host, false);  //if host exists validate it
    return _validate(url, true) && _validate(mainHost, false) && validHost;
  })();

  //if url or host(if exists) are not valid, STOP here
  if (!this.isValid) return;

  this.urlIsInteral = _checkIfInternal(url);    //if url is like:  '/about'
  this.parsedHost =  (host) ? _parseUrl(host, false) : _getHost( _parseUrl(url, false)) ;   //add host or create it from url
  this.parsedUrl = this.urlIsInteral ? _parseUrl(url, true, this.parsedHost) : _parseUrl(url, false);
  this.parsedMainHost = _getHost( _parseUrl(mainHost, false ));
  this.sameAsHost = (_getHost(this.parsedUrl) === _getHost(this.parsedHost));         // if address and parsedHost share same host as parsedUrl (www.google.com)
  this.sameAsMainHost = (_getHost(this.parsedUrl) === _getHost(this.parsedMainHost)); // if address and parsedMainHost share same host as parsedUrl (www.google.com)
};



//validates the url.   
//internalAccepted=true -> accepts urls like: '/adbout'
function _validate(url, internalAccepted){
  if (!url || (url && (typeof url !== 'string')) ) return false;
  if (url[0] === '/') return internalAccepted;    //if internal      //TODO: regex this to be anly valid characters
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  //var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9-:@]+)))([a-z0-9_]+([\.]|([\-])|([\/])))+([a-z0-9?=#]{2,})(/)?');
  return reg.test(url);
}


function _getHost(url){
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  var newHost = reg.exec(url);
  if (newHost && newHost instanceof Array && newHost[0]!=='/') return newHost[0];
  else return '';
}


function _checkIfInternal(url){
  if (!url && (typeof url !== 'string')) return false;
  if (url[0] === '/') return true;
  if (url[0] === '?') return true;
  return false;
}


//creates the big url
function _parseUrl(url, isInternal, host){
  //if internal
  if (isInternal) {
    if (url[0] === '?') url = '/' + url;
    if (url[0] === '/') url = host+url;
  } 
  else if (url.slice(0,7) !== 'http://') url = 'http://' + url;
  return url;
}


module.exports = URL;