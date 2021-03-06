var httpGet = require('./httpGet.js');
console.log('----------------------');

var address = 'http://search.bbc.co.uk/search';

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
