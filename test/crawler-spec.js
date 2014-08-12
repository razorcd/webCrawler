process.ENV = 'test';
var Event = require('events').EventEmitter;

var Crawler = require('../Crawler.js');

describe("private functions in Crowler.js should work: ", function() {


  describe("_getPage function", function(){
    it('should find exported functions for testing', function(done){
      expect(Crawler._getPage).toBeDefined();
      expect(Crawler._getElements).toBeDefined();
      expect(Crawler._getLinks).toBeDefined();
      expect(Crawler.getAllLinks).toBeDefined();
      expect(Crawler.getAllLinkzzzzz).toBeUndefined();
      done();
    })





    it('should request and retrieve the body', function(done){
      Crawler._getPage('http://www.razor3ds.com', function(err, body){
        //console.log(body);
        //console.log(typeof body);
        expect(body).toBeDefined();
        expect(typeof body).toBe('string');
        expect(body.search('</html>')).not.toBe(-1);  //body ends with '</html>'
        done();
      })  
    })






    it('should request and retrieve the body', function(done){
      Crawler._getPage('http://www.google.com', function(err, body){
        expect(body).toBeDefined();
        expect(typeof body).toBe('string');
        expect(body.substr(body.length-7)).toBe('</html>');  //body ends with '</html>'
        done();
      })  
    })


    it("should do multiple requests simultaniously", function(done) {
      var start = 0;
      
      start++;
      Crawler._getPage('http://www.razor3ds.com', function(err, body){
        expect(body).toBeDefined();
        expect(typeof body).toBe('string');
        start--;
        if (start === 0)  done();
      })  

      start++;
      Crawler._getPage('http://www.facebook.com', function(err, body){
        expect(body).toBeDefined();
        expect(typeof body).toBe('string');
        start--;
        if (start === 0)  done();
      })  
      
      start++;
      Crawler._getPage('http://www.bing.com', function(err, body){
        expect(body).toBeDefined();
        expect(typeof body).toBe('string');
        start--;
        if (start === 0)  done();
      })  

      start++;
      Crawler._getPage('http://www.google.com', function(err, body){
        expect(body).toBeDefined();
        expect(typeof body).toBe('string');
        start--;
        if (start === 0)  done();
      })  

      for (var i = 0; i < 10; i++) {
        start++;
        Crawler._getPage('http://www.google.com', function(err, body){
          expect(body).toBeDefined();
          expect(typeof body).toBe('string');
          start--;
          if (start === 0)  done();
        })  
      }
    });





    it('should return error when host does not respond/not exists', function(done){

      Crawler._getPage('http://www.dfgdfgcgsdgvtrvdfgdfg.com', function(err, body){
        expect(err).toBeDefined();
        expect(err.code).toBe('ENOTFOUND');
        expect(body).toBeUndefined();
        done();
      })  
    })


    it('should return error when host not a valid http address', function(done){
      Crawler._getPage('ivnuafvugggnadlfundafsv', function(err, body){
        expect(err).toBeDefined();
        expect(body).toBeUndefined();
        done();
      })  
    })
  })


  describe("_getElements function", function() {
    var body = ' <html><header><link ref="http://www.razor3ds.com/somecss.css" /></header>'
              +' <body> <p> Paragraph </p>'
              +' <a href="http://www.razor3ds.com"> Link1 </a>'
              +' <a href="www.razor3ds.com"> Link2 </a>'
              +' <a href="razor3ds.com"> Link3 </a>'
              + '<a href="x">1</a>'
              + '<a href="xxxxxx>">1</a>'
              + "<a href='xx\"xxx\"x>'>1</a>"
              + '<a id="ddd"></a>'
              +' <a href="/internal"> Link4 </a>'
              +' <a href="#"> Link5 </a>'
              +' <a> Link6 </a>'
              +' <a id="iddd" href="http://www.razor3ds.com"> Link1 </a>'
              + '</body></html>'
              + '<a />';

    it("should get all <a> elements", function() {
      Crawler._getElements(null, body, function(err, elemArray){
        expect(err).toBe(null);
        expect(elemArray).toBeDefined();
        expect(elemArray instanceof Array).toBeTruthy();
        //console.log(elemArray);
        expect(elemArray[0]).toBe('<a href="http://www.razor3ds.com">');
        expect(elemArray[1]).toBe('<a href="www.razor3ds.com">');
        expect(elemArray[3]).toBe('<a href="x">');
        expect(elemArray[4]).toBe('<a href="xxxxxx>">');
        expect(elemArray[5]).toBe("<a href='xx\"xxx\"x>'>");
        expect(elemArray[9]).toBe('<a id="iddd" href="http://www.razor3ds.com">');
        expect(elemArray.length).toBe(11);
      })
    });
    

    it("should get empty array if no <a> elements exist", function() {
      Crawler._getElements(null, 'xxxxxx', function(err, elemArray){
        expect(err).toBe(null);
        expect(elemArray).toBeDefined();
        expect(elemArray instanceof Array).toBeTruthy();        
        expect(elemArray.length).toBe(0);
      })
    });


    it("should get error if body not a string type", function() {
      Crawler._getElements(null, {text:'xxxxxx'}, function(err, elemArray){
        expect(err).not.toBe(null);
        expect(err.error).toBe('body is not a string type');
        expect(elemArray).toBeUndefined();
      })
    });


    it("should get empty array if body is an empty string", function() {
      Crawler._getElements(null, '', function(err, elemArray){
        expect(err).toBe(null);
        expect(elemArray).toBeDefined();
        expect(elemArray.length).toBe(0);
      })
    });

  });


  describe("_getLinks function", function(){
    var elemArray = [
      '<a href="http://www.razor3ds.com">',
      '<a href="www.razor3ds.com">',
      '<a href="razor3ds.com">',
      '<a href="/internal">',
      '<a href="#">',
      '<a id="ddd" href="http://www.razor3ds.com">',
      '<a href="x">',
      '<a href="xxx>x">',
      "<a href='111'>",
      '<a href=\'xx"xxx"x>\'>',
      '<a href="">',
      '<a />'
    ]

    it('should get an array of links', function(){
      Crawler._getLinks(null, elemArray, function(err, linkList){
        //console.log(linkList);
        expect(err).toBe(null);
        expect(elemArray).toBeDefined();

        expect(linkList[0]).toBe('http://www.razor3ds.com');
        expect(linkList[4]).toBe('#');
        expect(linkList[6]).toBe('x');
        expect(linkList[7]).toBe('xxx>x');
        expect(linkList[9]).toBe('xx"xxx"x>');

        expect(linkList.length).toBe(10);
      });
    })


    it('should get and empty array if elemArray is empty'), function(){
      Crawler._getLinks(null, [], function(err, linkList){
        expect(err).toBe(null);
        expect(linkList).toBeDefined();
        expect(linkList.length).toBe(0);
      })
    }

    it('should get and errror if error is passed or elemArray is not an array', function(){
      Crawler._getLinks('error',[], function(err, linkList){
        expect(err).not.toBe(null);
        expect(linkList).toBeUndefined();
      })

      Crawler._getLinks(null, {obj:'xxxxx'}, function(err, linkList){
        expect(err).not.toBe(null);
        expect(linkList).toBeUndefined();
      })
    })

  })


  describe("_getHost function", function(){
    it("should return host address", function() {
      var host = Crawler._getHost('http://www.razor3ds.com/aldlkjsldds/sdf');
      expect(host).toBe('http://www.razor3ds.com');

      var host = Crawler._getHost('tyrtyrty/sdf');
      expect(host).toBe('');
    });

  })


  describe("_parseAddress function", function(){
    var newUrl = Crawler._parseAddress('/path', 'www.razor3ds.com');
    expect(newUrl).toBe('http://www.razor3ds.com/path');

    var newUrl = Crawler._parseAddress('www.java.com', 'www.razor3ds.com');
    expect(newUrl).toBe('http://www.java.com');

  })


  describe("getAllLinks function", function(){



    it("should retrive a list of links from specified url", function(done) {
      var host = Crawler._getHost('http://www.java.com');
      Crawler.getAllLinks('http://www.java.com',host, function(err, linkList){
        expect(err).toBe(null);
        expect(linkList).toBeDefined();
        expect(linkList.length>0).toBeTruthy();
        done();
      })
    });


    it('should get an error when wrog url is sent', function(done){
      var host = Crawler._getHost('gdsfgsdgdsfgdfg');
      Crawler.getAllLinks('sdfsdfsdfsd',host, function(err,linkList){
        expect(err).not.toBe(null);
        expect(linkList).toBeUndefined();
        done();
      })
      
    })

    it('should get an error if address is not a string or is missing', function(done){
      var host = Crawler._getHost('sadasdas');
      Crawler.getAllLinks({address:'sadasdas'},host, function(err, linkList){
        expect(err).not.toBe(null);
        expect(linkList).toBeUndefined();
        done();
      })
    })

  })

});


describe("Slave objects:", function(){

  it("should return a list of objects", function(done){
    var ev = new Event;
    var slave;

    ev.on('done', function(){
      expect(slave.host).toBeDefined();
      expect(slave.host).toBe('www.google.com');
      expect(slave.itterations).toBe(1);
      expect(slave.links.length>0).toBeTruthy();
      expect(slave.links[0].host).toBe('www.google.com');
      done();
    })

    slave = new Crawler.Slave('www.google.com', 'www.google.com', 1, undefined,ev);
  })

  it("should return a slave object with links=[] (empty array) when link doese not return anything", function(done) {
     var ev = new Event;
     var slave;

     ev.on('done', function(){
      //expect(slave.host).toBe('www.google.com');
      //expect(slave.address).toBe('fhdfhgh');
      //expect(slave.httpGetNotResponsive).toBe(true);
      //expect(slave.links.length).toBe(0);
      done();
     })

    slave = new Crawler.Slave('fhdfhgh', 'www.google.com', 1, undefined, ev);
  });


  it("should itterate 1 time", function(done) {
         var ev = new Event;
     var slave;

     ev.on('done', function(){
      console.log(slave);
      expect(slave.host).toBe('www.google.com');
      expect(slave.address).toBe('www.google.com');
      expect(slave.links.length>0).toBe(true);
      expect(slave.links[0].host).toBe('www.google.com');
      expect(slave.links[1].host).toBe('www.google.com');
      expect(slave.links[0].links.length>0).toBe(true);
      done();
     })

    slave = new Crawler.Slave('www.google.com', 'www.google.com', 2, undefined,ev);



  }, 100000000);


describe("Slave object with Internal ON", function(){

  it("should only crawl internal links", function(done){
    var ev = new Event;
    var slave;

    ev.on('done', function(){

      expect(slave.host).toBe('www.google.com');
      expect(slave.address).toBe('www.google.com');

      for (var i=0; i<slave.links.length; i++){
        //check internal links were crawled
        if (slave.links[i].isInternal && !slave.links[i].httpGetNotResponsive) expect(slave.links[i].links.length>0).toBeTruthy();
        //check non internal links were not crawled
        if (!slave.links[i].isInternal) expect(slave.links[i].links.length===0).toBeTruthy();
      }
      console.log(slave);
      done();
    })


    slave = new Crawler.Slave('www.google.com', 'www.google.com', 2, true, ev);
  })

})


})
