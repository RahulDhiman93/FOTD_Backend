const http    = require('http');

exports.startHttpServer = startHttpServer;

function startHttpServer(port) {
  return new Promise((resolve, reject) => {
    var server = http.createServer(app).listen(port, function () {
      console.error("###################### Express connected ##################", app.get('port'), app.get('env'));
      resolve(server);
    });
  });

}
