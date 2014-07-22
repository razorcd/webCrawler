var eventEmitter = require('events').EventEmitter;
var express = require('express');
var Crawler = require('./Crawler.js');

var app = express();
app.use(express.logger('dev'));

/*** ROUTES ***/
app.get('/', function(req,res){
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/crawl', function(req,res){
	res.set('Content-Type','text/plain');
	var o1 = new Obj(req.query.address, req.query.itterations);

  Crawler.e.on('done', function(){
    res.send(200, o1);
  })


// var o1 = new Obj("http://www.google.com/", 2);
// console.log('o1: ',o1);
// //console.log('o1.links[1].links: ',o1.links[0].links);

// setTimeout(function(){
//   console.log('o1: ', o1);
// }, 4000);







});

/*** ROUTES END***/



var e = new eventEmitter;
e.on('addlink', function(err, link){
	//elemArray.push(link);
	console.log('Link:', link);
})



app.listen(8080);
console.log('server started on port: 8080');