var httpGet = require('./httpGet.js');
console.log('----------------------');

//var address = 'http://www.razor3ds.com/ftp/GS/Designer_Batteries.zip';
//var address = 'http://www.java.com';
//var address = 'sdfgdfgsdfgdfg';
var address = 'http://www.blogger.com?tab=wj';

httpGet(address, function(err, data, redirect){
  if(err) {console.log(err); return;}
  console.log("Data received. Type: ", typeof data, ",     And redirected to: ", redirect);
})


var express = require('express');
var app = express();



app.get('/', function(req,res){
  res.send(req.headers);
})



app.listen(9000, function(){
  console.log("Server running on 9000");
});
