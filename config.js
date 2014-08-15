process.ENV = process.ENV || 'development';

module.exports = {
  domain: (function(){
            switch (process.ENV) {
              case 'test': return '79.113.230.132';
                break;
              case 'development': return '79.113.230.132';
                break;
              default: return 'http://webcrawler.herokuapp.com/';
            }
          })()

}