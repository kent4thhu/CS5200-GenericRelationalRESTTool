const app = require('./express');
app.set('view engine', 'ejs');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require("app.js");
const port = process.env.PORT || 80;
app.listen(port);
