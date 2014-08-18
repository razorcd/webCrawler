process.ENV = 'test';
var parseWebsite = require('../lib/parseWebsite.js');
var websiteData;
var elementsList;

describe("_getPage function", function() {
  it("should return the content of a webpage", function(done) {
    parseWebsite._getPage('http://www.google.com', function(err,data){
      websiteData = data;
      expect(err).toBe(null);
      expect(typeof data).toBe('string');
      expect(data.length>0).toBe(true);
      done();
    })
  });

  it("should return error on bad address", function(done) {
    parseWebsite._getPage('dgdgdfgdsfg', function(err,data){
      expect(err).toBeDefined();
      expect(err).not.toBe(null);
      done();
    })
  });
  
});

describe("_getElements function", function() {
  var data = websiteData;
  var data =   ' <html><header><link ref="http://www.razor3ds.com/somecss.css" /></header>'
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
  it("should get all <a> elements from a website", function(done) {
    parseWebsite._getElements(null, data, function(err, elemList){
      expect(err).toBe(null);
      expect(elemList.length).toBe(11);
      expect(elemList[0]).toBe('<a href="http://www.razor3ds.com">')
      expect(elemList[9]).toBe('<a id="iddd" href="http://www.razor3ds.com">')
      elementsList = elemList;
      console.log(elemList);
      done();
    })
  });

  it("should return error when sending error", function(done) {
    parseWebsite._getElements({error:'some error mess'}, data, function(err,elemList){
      expect(err).toBeDefined();
      expect(err.error).toBe('some error mess');
      done();
    })
  });

});

describe("_getLinks function", function() {
  
  it("should get all links", function(done){
    parseWebsite._getLinks(null, elementsList, function(err, linkList){
      expect(err).toBe(null);
      expect(linkList).toBeDefined();
      expect(linkList.length).toBe(9);
      console.log(linkList);
      done();
    })
  });

  it("should return error when sending error", function(done) {
    parseWebsite._getLinks({error:'some error'}, elementsList, function(err,linkList){
      expect(err).toBeDefined();
      expect(err.error).toBe('some error');
      done();
    })
  });

});

describe("parseWebsite function/module", function(){

  it("should return a list of links from all <a> elements of a website", function(done){
    parseWebsite.getAllLinks('http://www.google.com', function(err, linkList){
      expect(err).toBe(null);
      expect(linkList).toBeDefined();
      expect(linkList.length>0).toBe(true);
      console.log(linkList);
      done();      
    })
  })

})

