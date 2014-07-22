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
	var crawl = new Crawler(req.query.address, req.query.itterations);

	crawl.getAllLinks(function(err, linkList){
		if (err) { res.send(err); return; }
		res.send(linkList);
	})

});

/*** ROUTES END***/



var e = new eventEmitter;
e.on('addlink', function(err, link){
	//elemArray.push(link);
	console.log('Link:', link);
})



app.listen(8080);
console.log('server started on port: 8080');