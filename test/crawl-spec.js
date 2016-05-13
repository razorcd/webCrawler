process.ENV = 'test';
console.log('----------------------------------------');
var crawl = require('../lib/crawl.js');

describe("crawl module", function() {
  it("should emit error on wrong arguments", function(done) {
    expect(crawl.Master).toBeDefined();
    var wb1 = new crawl.Master('http://www.google.com', 'asdas', 1, false);

    wb1.ev.on('error', function(err){
      expect(err).toBeDefined();
      expect(err).toBe('Address not valid');
      done();
    })

  });


  it("should return valid data on correct arguments", function(done) {
    var wb2 = new crawl.Master('www.razor3ds.com', 'www.razor3ds.com', 1, false);
    wb2.ev.on('finished', function(){
      expect(wb2.addressObj).toBeDefined();
      expect(wb2.addressObj.isValid).toBe(true);
      expect(wb2.addressObj.parsedUrl).toBe('http://www.razor3ds.com');
      expect(wb2.addressObj.parsedMainHost).toBe('http://www.razor3ds.com');
      expect(wb2.addressObj.parsedParentHost).toBe('http://www.razor3ds.com');
      expect(wb2.ev).toBeUndefined();
      expect(wb2.itterations).toBe(1);
      expect(wb2.internalOnlyAccepted).toBe(false);
      expect(wb2.data).toBeDefined();
      expect(wb2.data.links).toBeDefined();
      expect(wb2.data.links.length>0).toBe(true);
      //console.log(wb2.data);
      done();
    });
  });


  it("should return valid data on correct arguments with itterations 2", function(done) {
    var wb2 = new crawl.Master('www.razor3ds.com', 'www.razor3ds.com', 2, false);
    wb2.ev.on('finished', function(){
      expect(wb2.addressObj).toBeDefined();
      expect(wb2.addressObj.isValid).toBe(true);
      expect(wb2.addressObj.parsedUrl).toBe('http://www.razor3ds.com');
      expect(wb2.addressObj.parsedMainHost).toBe('http://www.razor3ds.com');
      expect(wb2.addressObj.parsedParentHost).toBe('http://www.razor3ds.com');
      expect(wb2.ev).toBeUndefined();
      expect(wb2.itterations).toBe(2);
      expect(wb2.internalOnlyAccepted).toBe(false);

      //itteration 1 exists:
      expect(wb2.data).toBeDefined();
      expect(wb2.data.links).toBeDefined();
      expect(wb2.data.links.length>0).toBe(true);

      //itteration 2 exists:
      expect(wb2.data.links[0].links).toBeDefined();
      expect(wb2.data.links[0].links.length>0).toBe(true);
      expect(wb2.data.links[0].links[0].addressObj.isValid).toBe(true);

      console.log(wb2.data.links[0]);
      done();
    });
  });



  it("should return valid data on correct arguments with itterations 2", function(done) {
    var wb2 = new crawl.Master('www.razor3ds.com', 'www.razor3ds.com', 2, true);
    wb2.ev.on('done', function(){
      expect(wb2.addressObj).toBeDefined();
      expect(wb2.addressObj.isValid).toBe(true);
      expect(wb2.addressObj.parsedUrl).toBe('http://www.razor3ds.com');
      expect(wb2.addressObj.parsedMainHost).toBe('http://www.razor3ds.com');
      expect(wb2.addressObj.parsedParentHost).toBe('http://www.razor3ds.com');
      //expect(wb2.ev).toBeUndefined();
      expect(wb2.itterations).toBe(2);
      expect(wb2.internalOnlyAccepted).toBe(true);

      //itteration 1 exists:
      expect(wb2.data).toBeDefined();
      expect(wb2.data.links).toBeDefined();
      expect(wb2.data.links.length>0).toBe(true);

      //itteration 2 exists:
      expect(wb2.data.links[0].links).toBeDefined();
      expect(wb2.data.links[0].links.length>0).toBe(true);
      expect(wb2.data.links[0].links[0].addressObj.isValid).toBe(true);

      console.log(wb2.data);
      //checking only internals are parsed
      for (var i=0;i<wb2.data.links.length;i++){
        if(wb2.data.links[i].addressObj.sameAsMainHost) expect(wb2.data.links[i].links.length>0).toBe(true);
        if(!wb2.data.links[i].addressObj.sameAsMainHost) expect(wb2.data.links[i].links.length===0).toBe(true);
      }
      done();
    });
  });



});


