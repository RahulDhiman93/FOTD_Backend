/**
 * Created by Rishikesh Arya on 16/11/19.
 */

require('./users');
require('./facts');
require('./feedback');
require('./files');
require('./notification');
require('./jade');

app.get('/ping', function(req, res) {
  res.send('OK');
});