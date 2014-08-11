
var url = require('url');
var http = require('http');

//httpGet(address, function(err, data, redirect){..})
module.exports = function httpGet(address,cb, _redirect, _itterations){
  _itterations = _itterations-1 || 4; //max 3 redirects allowed
  if (_itterations === 1) {
    cb("Error too many redirections.");
    return;
  }

  if (!_validateUrl(address)) {
    cb("Error, addres not valid");
    return;
  }

  var headers = {
      //"host": "localhost:9000",
      //"connection": "keep-alive",
      "cache-control": "max-age=100",
      "accept": "text/html"
      //"user-agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/36.0.1985.125 Safari/537.36",
      //"accept-encoding": "gzip,deflate,sdch",
      //"accept-language": "en-US,en;q=0.8",
      //"cookie": "connect.sid=s%3AS4wosJfnpCbhVDQg93SAJma_GFW2yNX6.eRmxSv63uew%2FCgnU4qMPShHAxQunqJBj6QbyylDzP%2BA"
  };


  var address = url.parse(address);
  var options={
    method: 'GET',
    host: address.host,
    path:address.path,
    headers: headers
  }

   http.get(options, function(res){
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
        //console.log(data);
        if (res.statusCode >300 && res.statusCode <400) {
          console.log("Redirecting to: ",res.headers.location);
          _redirect = res.headers.location;
          httpGet(res.headers.location, cb, _redirect, _itterations);
        } else  {
         cb(null, data, _redirect)
        }
      })

      // res.on('error', function(err){
      //   console.error("######## Error request on address: ", address);
      //   cb(err);
      // })

    } else {
      console.log('Empty: content-type is not text/*');
      cb(null,'');
    }

  }).on('error', function(err){
    console.error("######## Error request on address: ", address.href);
    cb(err);
  });
}



function _validateUrl(address){
  var reg = new RegExp('((((https?)|(ftp)):\/\/)?((www\.)?([a-z0-9][a-z0-9:@]+)))([a-z0-9-_\/]+[\.])+([a-z0-9]{2,})');
  return reg.test(address);
}