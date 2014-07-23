var httpGet = require('./httpGet.js');
console.log('----------------------');

//var address = 'http://www.razor3ds.com/ftp/GS/Designer_Batteries.zip';
//var address = 'http://www.java.com';
//var address = 'sdfgdfgsdfgdfg';
var address = 'http://www.dfgdfgcgsdgvtrvdfgdfg.com';

httpGet(address, function(err, data, redirect){
  if(err) {console.log(err); return;}
  console.log("Data received. Type: ", typeof data, ",     And redirected to: ", redirect);
})