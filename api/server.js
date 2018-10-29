
/**
 * Module dependencies.
 */
const express = require('express');
const Odoo = require('odoo-xmlrpc');
const config = require('./config');
const app = express();
const bodyParser = require('body-parser');

var router = express.Router();

var odoo = new Odoo({
    url: config.odoo.url,
    port: config.odoo.port,
    db: config.odoo.db,
    username: config.odoo.username,
    password: config.odoo.password
});

//Import routes
require("./routes")(router, odoo);

//Configuration
app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Handle rejections

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

// Tell express to use this router with /api before.
app.use("/api", router);

app.listen(config.port, function(){
  console.log("Express server listening");
});
