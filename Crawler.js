var request = require('request');

var Crawler = function(address, itterations, element){
	this.address = address;
	this.itterations = 0;
	this.element = element || 'a';
}


Crawler.prototype.getPage = function(cb){
	request.get(this.address, function(err, response, body){
		if (err) { cb(err); return err; }
		cb(null, body);
		return body;
	});
}


Crawler.prototype.getElements = function(err, body, cb){

	if(err) {
		cb(err);
		return err;
	}

	var iterate = true;
	var elemArray = [];
	while (iterate){
		var i = 0, start= -1, fin= -1;

		start = body.search('<'+this.element+' ');
		fin = body.search('</'+this.element+'>');
		
		if (start !== -1 && fin !== -1) {
			elemArray.push( body.substr(start, fin-start+this.element.length+3));
			body = body.slice(fin+this.element.length+3);
		} else iterate = false;
	}
	cb(null,elemArray);
	return elemArray;
}


Crawler.prototype.getLinks = function(err, elemArray, cb){
	if(err) {
		cb(err);
		return err;
	}

	var len = elemArray.length;
	var l, quotes, string;
	var linkList = [];
	for (var i=0; i<len; i++){
		string = elemArray[i];
		l = string.search('href=');
		if (l !== -1) {
			 quotes=string[l+5];
			 string = string.slice(l+6);
			 l = string.search(quotes);
			 string = string.slice(0,l);
			 linkList.push(string);
		}
	}
	cb(null, linkList);
	return linkList;
}


module.exports = Crawler;