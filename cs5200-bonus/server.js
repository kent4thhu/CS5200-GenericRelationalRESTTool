const app = require('./express');
app.set('view engine', 'ejs');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 8080;
require('./service.server');
app.listen(port);

console.log('successfully start the server with ', port);