var webUrl = require('../lib/webUrl.js');

describe("webUrl module", function() {

  it("should create an invalid object if webUrl() argumets are not 'string'", function() {
    var address0 = new webUrl({});
    expect(typeof address0).toBe('object');
    expect(address0.isValid).toBe(false);
    var address0 = new webUrl('www.google.com', {});
    expect(address0.isValid).toBe(false);
    var address0 = new webUrl('www.google.com', 'www.google.com', {});
    expect(address0.isValid).toBe(false);
  });


  it("should create an invalid object if webUrl() argumets are not valid urls", function() {
    //when url is not valid
    var address1 = new webUrl('gfhfdghfdgh', 'ww.google.com');
    expect(typeof address1).toBe('object');
    expect(address1.isValid).toBe(false);
    expect(address1.originalUrl).toBe('gfhfdghfdgh');
    expect(address1.originalParentHost).toBeUndefined();
    
    //when host is not valid
    var address2 = new webUrl('http://www.google.com', 'http://www.google.com', 'adas');
    expect(address2.isValid).toBe(false);
    expect(address2.originalUrl).toBe('http://www.google.com');
    expect(address2.originalMainHost).toBe('http://www.google.com');
    expect(address2.originalParentHost).toBe('adas');

    //when host is internal url:  ('/about')
    var address22 = new webUrl('http://www.google.com', 'http://www.google.com','/about');   //host is '/about'
    expect(address22.isValid).toBe(false);
    expect(address22.originalUrl).toBe('http://www.google.com');
    expect(address22.originalMainHost).toBe('http://www.google.com');
    expect(address22.originalParentHost).toBe('/about');

    //when url is internal and host is undefined
    var address222 = new webUrl('/about', 'http://www.google.com');
    expect(address222.isValid).toBe(true);
    expect(address222.originalUrl).toBe('/about');
    expect(address222.originalMainHost).toBe('http://www.google.com');
    expect(address222.originalParentHost).toBeUndefined();
  });


  it("should create a valid object if webUrl() argumets are valid urls", function() {
    var address3 = new webUrl('http://www.google.com', 'http://www.google.com');
    expect(typeof address3).toBe('object');
    expect(address3.isValid).toBe(true);
    expect(address3.parsedUrl).toBe('http://www.google.com');
    expect(address3.parsedMainHost).toBe('http://www.google.com');
    expect(address3.parsedParentHost).toBe('http://www.google.com');    //should add the host too
  });

  it("should parse urls if they are not in the right format but valid. Parsed to: http://www.google.com/blalbla?x=1 format.", function() {
    //parseUrl(host)
    var address4 = new webUrl('www.google.com', 'www.google.com', 'www.google.com');
    expect(address4.isValid).toBe(true);
    expect(address4.parsedParentHost).toBe('http://www.google.com');
    expect(address4.parsedMainHost).toBe('http://www.google.com');
    var address4 = new webUrl('www.google.com', 'google.com', 'google.com');
    expect(address4.isValid).toBe(true);
    expect(address4.parsedParentHost).toBe('http://google.com');
    expect(address4.parsedMainHost).toBe('http://google.com');

    //parseUrl(url, mainhost)
    var address5 = new webUrl('www.google.com', 'www.google.com');
    expect(address5.isValid).toBe(true);
    expect(address5.parsedUrl).toBe('http://www.google.com');
    expect(address5.parsedMainHost).toBe('http://www.google.com');

    //parseUrl(url) and parseUrl(host) when url is internal
    var address6 = new webUrl('/about', 'www.google.com/ab', 'www.google.com');
    expect(address6.isValid).toBe(true);
    expect(address6.parsedParentHost).toBe('http://www.google.com');
    expect(address6.parsedMainHost).toBe('http://www.google.com');
    expect(address6.parsedUrl).toBe('http://www.google.com/about');
    expect(address6.sameAsHost).toBe(true);
    expect(address6.sameAsMainHost).toBe(true);
  });

  it("should create the host if it is not specified on creation", function() {
    var address7 = new webUrl('www.google.com/about', 'www.google.com');
    expect(address7.isValid).toBe(true);
    expect(address7.parsedUrl).toBe('http://www.google.com/about');
    expect(address7.parsedParentHost).toBe('http://www.google.com');
  });

  it("should have internal=false if address and host have different hostAdresses", function() {
    var address8 = new webUrl('www.google.com/about', 'www.youtube.com', 'www.yahoo.com');
    expect(address8.isValid).toBe(true);
    expect(address8.parsedUrl).toBe('http://www.google.com/about');
    expect(address8.parsedMainHost).toBe('http://www.youtube.com');
    expect(address8.parsedParentHost).toBe('http://www.yahoo.com');
    expect(address8.sameAsHost).toBe(false);
    expect(address8.sameAsMainHost).toBe(false);
  });

  it("should create valid object if url is internal, mainHost is good and host is missing", function() {
    var address8 = new webUrl('/about', 'www.google.com');
    expect(address8.isValid).toBe(true);
    expect(address8.parsedUrl).toBe('http://www.google.com/about');
    expect(address8.parsedMainHost).toBe('http://www.google.com');
    expect(address8.parsedParentHost).toBe('http://www.google.com');
    expect(address8.sameAsHost).toBe(true);
    expect(address8.sameAsMainHost).toBe(true);
  });


  it("should create valid object on there urs", function(done){
    var address9 = new webUrl('http://www.futureplc.com/what-we-do/advertising-solutions/', 'http://www.futureplc.com');
    expect(address9.isValid).toBe(true);
    console.log(address9);
    done();
  })
});