
var url = require('url');
var http = require('http');
var config = require('./config.js');

//httpGet(address, function(err, data, redirect){..})
module.exports = function httpGet(address,cb, _redirect, _itterations, _domain, _initialAddress, _cookie){
  _initialAddress = _initialAddress || address;  //saving the initial address in this variable and keeping it for all redirect itterations
  _itterations = _itterations-1 || 6; //max 3 redirects allowed
  var currentHost = _getHost(address);  //the host of the address for current itteration
  if (_itterations === 1) {

    //request itterated 3 times without domain and failed. Now lets try with the domain = " ".
    if (_domain === undefined) {
      console.log('**********Trying again with hreder.domain=ip');
      console.log('Initial Address: ', _initialAddress);
      _itterations = 6;
      //_domain = _getHost(address);

      _domain = " ";//config.domain;
      //_domain = "www.oracle.com";
      console.log ("         _domain: ", _domain);
      //_initialAddress = "/html/privacy.html"
      httpGet(_initialAddress, cb, _redirect, _itterations, _domain, _initialAddress, _cookie);
      return;
    } else {
      //request itterated 3 times with domain===" " and failed. Now lets try with the domain = my host.
      if (_domain === " ") {
        console.log('**********Trying again with hreder.domain=ip');
        console.log('Initial Address: ', _initialAddress);
        _itterations = 6;
        //_domain = _getHost(address);

        _domain = config.domain;
        //_domain = "www.oracle.com";
        console.log ("         _domain: ", _domain);
        //_initialAddress = "/html/privacy.html"
        httpGet(_initialAddress, cb, _redirect, _itterations, _domain, _initialAddress, _cookie);
        return;
      }

      cb("Error too many redirections.");
      return;
    }
  }

  if (!_validateUrl(address, true)) {
    cb("Error, addres not valid");
    return;
  }

  //if (address[0] !== '/') _domain = _getHost(address) || "";   //don't change the host if the address is internal
  var headers = {
      "host": _domain || "", //_domain || "",
      //"connection": "keep-alive",
      //"cache-control": "max-age=100",
      "accept": "text/html",
      "user-agent": "",//"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36",
      //"accept-encoding": "gzip,deflate,sdch",
      //"accept-language": "en-US,en;q=0.8"
      "cookie": _cookie || ""
  };


  var address = url.parse(address);
  var options={
    method: 'GET',
    host: address.host,
    path:address.path,
    headers: headers
  }

   http.get(options, function(res){
    console.log(res.headers);
    console.log(res.statusCode);
    console.log("Cookie: ", _cookie);
    //console.log('domain: ', config.domain);
    console.log('_initialAddress: ', _initialAddress);

    var data='';
    var ct = res.headers['content-type'] || 'text/*';

    if (ct.search('text/') !== -1) {

      res.on('data', function(c){
        //console.log('+data');
        data += c;
      })

      res.on('end', function(){
        //console.log("Addr: ", address.href);
        console.log("Type: ", typeof data);
        console.log('Cookie: ', _cookie);
        console.log("-------- DATA: --------\n", data);
        if (res.statusCode >300 && res.statusCode <400) {
          _redirect = res.headers.location;
          console.log("Redirecting to: ",_redirect);
          _cookie = res.headers['set-cookie'];
          var newAddress = res.headers.location;
          if (newAddress[0] === '/' || newAddress[0] === '?') newAddress = currentHost + newAddress;
          httpGet(newAddress, cb, _redirect, _itterations, _domain, _initialAddress, _cookie);
        } else  {
         cb(null, data, _redirect)
        }
      })

    } else {
      console.log('Empty: content-type is not text/*');
      cb(null,'');
    }

  }).on('error', function(err){
    console.error("######## Error request on address: ", address.href);
    cb(err);
  });
}



function _validateUrl(address, internalAccepted){
  // TODO: still needs work
  //internal === true mean it accepts internal links (like: '/images')
  if (internalAccepted) {
    if (address[0] === '/') return true;
  }
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  return reg.test(address);
}


function _getHost(address){
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  var newHost = reg.exec(address);
  if (newHost && newHost instanceof Array && newHost[0]!=='/') return newHost[0];
  else return '';
}
