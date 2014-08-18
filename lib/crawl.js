var Event  = require('events').EventEmitter;
var parseWebsite = require('./parseWebsite.js');
var webUrl = require('./webUrl.js');


//creating the master crawler object
exports.Master = Master = function(address, host, itterations, internalOnlyAccepted){
  this.addressObj = new webUrl(address, address, host);
  this.ev = new Event;        //event that will emit done when Slave crawler finished all itterations or 'error' on error
  var _self = this;

  //validating address first
  if (!this.addressObj.isValid) {
    process.nextTick(function(){
      _self.ev.emit('error', 'Address not valid');
    })
    return;
  }

  //on finished check result first
  //delete the ev from this object when done craling
  this.ev.on('finished', function(){
    console.log("!!! finished  !!!");
    //console.dir(_self.data);
     if (_self.data.links && _self.data.links.length !== 0) _self.ev.emit('done')
     else _self.ev.emit('error', 'No links were found'/*'Cannot crawl address'*/);
     delete _self.ev;
  })

  this.ev.done = 0;           //will hold the number of http requests currently in process once crawling stats
  this.itterations = itterations || 1;
  this.internalOnlyAccepted = (internalOnlyAccepted ? true : false);

  //..next tick?
  this.data = new Slave(this.addressObj, this.itterations, this.internalOnlyAccepted, this.ev);   //starting the crawler itterations
}






//creating the slave crawler object that will hold all the links in a tree
Slave = function(addressObj, itterations, internalOnlyAccepted, ev){
  //TODO: validate address and host here
  //console.log("-------------Event: ",ev);
  var _self = this;
  this.addressObj = addressObj;
  //this.tempOriginalAddress = this.addressObj.originalUrl;
  //this.tempOriginalMainHost = this.addressObj.originalMainHost;
  //this.tempSameAsMainHost = this.addressObj.sameAsMainHost;
  //this.tempAddress = this.addressObj.parsedUrl;
  //this.tempIsValid = this.addressObj.isValid;
  //this.tempIsInternal = this.addressObj.urlIsInteral;
  this.httpGetResponsive = undefined;      //if current link was not responsive
  this.parsed = false;                    //if current link was parsed              
  this.itterations = itterations;

  this.links = [];
  
  //start crawling function
  if (!(internalOnlyAccepted && !addressObj.sameAsMainHost) && addressObj.isValid) {   //start crawling only if NOT (internalOnly is checked and the address is not internalOnly)
    (function(addr, mainHost, itt, internalOnlyAccepted, ev){
      console.log("Itt: ", itt, "   Address: ", addr, "    Host: ", mainHost);
      if (itt>0){
        if (!ev.done) ev.done=0;                          //(re)initiliasing curent itterations under execution  counter
        ev.done++;                                        //itterations in process counter +1


       parseWebsite.getAllLinks(addr, function(err, linksList){   
          if(err) {   //getAllLinks returned err
            console.log('getAllLinks error: ', err.error);
            _self.httpGetResponsive = false;
            _self.error = err.error;
          } else {    //getAllLinks returned a list with links
            _self.parsed = true;
            _self.httpGetResponsive = true;
            //console.log("!!!!!!! linklist: ", linksList);
             for(var i=0;i<linksList.length;i++){  //doing another itteration for each link in the list
               //var tempHost = _getHost(addr) || mainHost;
               var newAddressObj = new webUrl(linksList[i], mainHost, addr);
                if (newAddressObj.isValid) _self.links.push(new Slave(newAddressObj, itt-1, internalOnlyAccepted, ev));
             }
          }
          ev.done--;
          //if finished:
          if (ev.done === 0 ) process.nextTick(function(){ ev.emit('finished') }); //emit 'done'.    //TOGO(ad 5 lines below:  if (ev.done === 0 ) setTimeout( function(){ if (ev.done === 0 ) ev.emit('done');}, 500); //to check if no more requests are waiting / delaying
        })

      } //else process.nextTick(function(){ ev.emit('done'); });


    }(this.addressObj.parsedUrl, this.addressObj.parsedMainHost, this.itterations, internalOnlyAccepted, ev));
  } //else process.nextTick(function(){ ev.emit('done'); });

}



