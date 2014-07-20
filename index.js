var express = require('express');
var app = express();
var request = require('request');
var eventEmitter = require('events').EventEmitter;

app.get('/', function(req,res){
	res.sendfile(__dirname + '/public/index.html');
});

app.get('/crawl', function(req,res){
	//res.send(req.query);
	//validate
	var address = req.query.address;
	var itterations = req.query.itterations;

	request.get(address, function(err, response, body){
		if(err) {res.send(err); return; }
		console.log(address);
		//console.log(body);

		var htmlRegex = /(<html>|<html\s)([^]*)(<\/html>|<\/html\s)/i ;
		//body = '<html>cc<a >gfgdfg</a></html>x<html><a href="www.google.com" dd>ddlgkjsdlkgjd </a>flgd dg<a name="f" href=\'www.zzz.v\'>cbcbv</a> dgd gdfg dg </html>';
		
		var content = htmlRegex.exec(body);
		if (!content) { res.send('Not a valid html page'); return; }
		
		req.elementList = elemSearch(content[2]+'', 'a');
		req.hrefLinkList = hrefLinkSearch(req.elementList);

		res.send(req.hrefLinkList);

	});

})



function getPage(address){

}


function hrefLinkSearch(elementList){
	var i, len = elementList.length;
	var l, quotes, string;
	var linkList = [];

	for (i=0; i<len; i++){
		string = elementList[i];
		l = string.search('href=');
		console.log('Checking href: ', l);
		if (l !== -1) {
			 
			 quotes=string[l+5];
			 string = string.slice(l+6);
			 l = string.search(quotes);
			 string = string.slice(0,l);
			 linkList.push(string);

			}
	}
	return linkList;
}


function elemSearch(string, elem){
	var iterate = true;
	var elemArray = [];
	while (iterate){
		var i = 0, start= -1, fin= -1;

		start = string.search('<'+elem+' ');
		fin = string.search('</'+elem+'>');
		
		if (start !== -1 && fin !== -1) {
			console.log('found an <a : ', string.substr(start, fin-start+elem.length+3));
			elemArray.push( string.substr(start, fin-start+elem.length+3));
			string = string.slice(fin+elem.length+3);
		} else iterate = false;
	}
	//e.emit('addlink', null, start);
	return elemArray;
}




var e = new eventEmitter;
e.on('addlink', function(err, link){
	//elemArray.push(link);
	console.log('Link:', link);
})






app.listen(8080);
console.log('server started on port: 8080');