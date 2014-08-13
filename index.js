var eventEmitter = require('events').EventEmitter;
var express = require('express');
var Crawler = require('./Crawler.js');

var app = express();
app.use(express.logger('dev'));
app.use(express.static(__dirname + "/public"));

/*** ROUTES ***/
app.get('/', function(req,res){
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/crawl', function(req,res){
	res.set('Content-Type','application/json');
	var bo1 = new Master(req.query.address, req.query.itterations, req.query.internal);

  bo1.ev.once('done', function(){
    console.log('DONE');
    res.send(200, bo1);
  });

  bo1.ev.once('error', function(err){
    console.log('Error');
    res.send(400, {error:err});
  });


// var o1 = new Obj("http://www.google.com/", 2);
// console.log('o1: ',o1);
// //console.log('o1.links[1].links: ',o1.links[0].links);

// setTimeout(function(){
//   console.log('o1: ', o1);
// }, 4000);






});

/*** ROUTES END***/



// var e = new eventEmitter;
// e.on('addlink', function(err, link){
// 	//elemArray.push(link);
// 	console.log('Link:', link);
// });



var port = Number(process.env.PORT || 5000);
app.listen(port);
console.log('server started on port: ' + port);