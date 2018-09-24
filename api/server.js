
/**
 * Module dependencies.
 */
var express = require("express");
const Odoo = require('odoo-xmlrpc');
var app = express();
var bodyParser = require("body-parser");

var router = express.Router();

var odoo = new Odoo({
    url: 'http://web',
    port: '8069',
    db: 'sotral',
    username: 'mawababotossi@yahoo.fr',
    password: '7u7ud@sxX'
});


// Configuration

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// Functions


var getCardByQRCode = function(_qr_code){

  return new Promise(function(resolve, reject) {

    odoo.connect(function (err) {
        if (err) { reject(err); }

        var inParams = [];
        inParams.push([['card_code', '=', _qr_code]]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw('card.card', 'search_read', params, function (err, cards) {
           if (err) { reject(err); }
           else {
             resolve(cards[0]);
           }
        });
      });
    });
}

//Second, check user with that phone does not exists

var searchForUserWithThatPhone = function(_phone){
  return new Promise(function(resolve, reject) {
    odoo.connect(function (err) {
      if (err) { return console.log(err); }
      console.log('Connected to Odoo server.');
      var inParams = [];
      inParams.push([['phone', '=', _phone]]);
      var params = [];
      params.push(inParams);
      odoo.execute_kw('res.partner', 'search', params, function (err, values) {
         if (err) { reject(err); }
         resolve(values);

      });
    });
  });
}


var createUser = function(_names, _phone){

  return new Promise(function(resolve, reject) {

    odoo.connect(function (err) {
      if (err) { return console.log(err); }
      console.log('Connected to Odoo server.');
      var inParams = [];
      inParams.push({'name': _names, 'phone': _phone })
      var params = [];
      params.push(inParams);
      odoo.execute_kw('res.partner', 'create', params, function (err, value) {
         if (err) { reject(err); }
         resolve(value);
      });
    });
  });
}

// Third, activate card if exists

var activateCardIfExists = function(_card_id, _user_id){

  return new Promise(function(resolve, reject){

    odoo.connect(function (err) {
       if (err) { return console.log(err); }
       console.log('Connected to Odoo server.');
       var inParams = [];
       inParams.push([parseInt(_card_id)]); //id to update
       inParams.push({'card_status': 1})
       var params = [];
       params.push(inParams);
       odoo.execute_kw('card.card', 'write', params, function (err, value) {
          if (err) { reject(err); }

          var inParams = [];
          inParams.push([parseInt(_card_id)]); //id to update
          inParams.push({'card_owner': parseInt(_user_id)})
          var params = [];
          params.push(inParams);
          odoo.execute_kw('card.card', 'write', params, function (err, value) {
             if (err) { reject(err); }
             resolve(value);
          });

       });
     });
  });
}

var getUser = function(_user_id){

  return new Promise(function(resolve, reject){
    odoo.connect(function (err) {
        if (err) { reject(err); }

        var inParams = [];
        inParams.push([['id', '=', req.params.id]]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw('res.partner', 'search_read', params, function (err, customers) {
           if (err) { reject(err); }
           resolve(customers);
        });
    });
  });
}

var getCardTopups = function(_card_id){

  return new Promise(function(resolve, reject){

    odoo.connect(function (err) {
     if (err) { reject(err); }
     console.log('Connected to Odoo server.');
     var inParams = [];
     inParams.push([['card', '=', req.params.card_id]]);
     var params = [];
     params.push(inParams);
     odoo.execute_kw('card.topup', 'search_read', params, function (err, topups) {
        if (err) { reject(err); }
        resolve(topups);
     });
    });
  });
}

var makeTopup = function(_data){

  return new Promise(function(resolve, reject){

    var numbers = _data.sms.match(/\d+/g).map(Number);  console.log("Amount: "+numbers[1]);

    odoo.connect(function (err) {
     if (err) { reject(err); }
     console.log('Connected to Odoo server.');
     var inParams = [];
     inParams.push({'card': _data.card_id, 'amount':numbers[1], 'operator': _data.operator, 'sms': _data.sms})
     var params = [];
     params.push(inParams);
     odoo.execute_kw('card.topup', 'create', params, function (err, value) {
        if (err) { reject(err); }
        console.log('Result: ', value);
        resolve({'value':value});
     });
   });
 });
}

// Provide all routes here, this is for Home page.

router.get("/",function(req,res){
  res.json({"message" : "Hello World"});
});

router.get('/cards/:code', (req, res, next) => {
    // Queries DB to obtain individual card based on code
    getCardByQRCode(req.body.code).then(function(result){
      var card = result || {};
      res.send(card);
      next();
    });
});

// This one have to require an authentication
router.post('/cards/activate', (req, res, next) => {
    var data = req.body || {}; console.log('Data '+ JSON.stringify(req.body) );

    activateCardIfExists(_user_id, _card_id).then(function(result){
      res.send(result);
      next();
    });
});


router.post('/customer/create/', (req, res, next) => {
  var data = req.body || {};

  createUser(data.name, data.phone).then(function(result){
    res.send(result);
    next();
  });

});

router.get('/users/', (req, res, next) => {

});

router.get('/user/:id', (req, res, next) => {

});

router.get('/topups/card/:card_id', (req, res, next) => {

  getCardTopups(req.params.id).then(function(result){
    res.send(result);
  });

});

router.post('/topups/create', (req, res, next) => {

  var data = req.body || {};

});

router.get('/topups/params', (req, res, next) => {
   res.send({'TMONEY':'*145*1*1*amount*91859704#', 'FLOOZ':'155*1*96632444*amount#', 'TMONEY_VS':'(91 85 97 04)', 'FLOOZ_VS':'96632444' ,'amounts':[10, 20, 50, 80]});
});

router.post('/first-setup/', (req, res, next) => {

    var data = req.body || {}; console.log('Data '+ JSON.stringify(req.body) );

    var scannedCard = null;

    // First of all we check if the scanned card exists
    getCardByQRCode(data.code).then(function(result){
      var card = result || {};
      console.log("A card has been scanned for first setup - Code: " + data.code + " Card found: " + JSON.stringify(card));

      if( card.card_status == false ) { // Card exists but is not active yet
        scannedCard = card;

        // Then we check if user phone is already registered
        return searchForUserWithThatPhone(data.phone);
      }
      else if(card.card_status == true) return done("Error 0001x: Carte déja activée"); // Card already exists and is active
      else return done("Error 0001: Carte non trouvée");

    }).catch(error => { console.log('caught', err.message); })
    .then(function(result){

      var users = result || [];
      console.log(users);

      if(users.length > 0) return done("Error 0002: Ce numéro de téléphone exist déjà dans la base de données");
      else if(scannedCard) return createUser(data.name, data.phone);
      else return done("Exiting here");

    }).catch(error => { console.log('caught', err.message); })
    .then(function(user_id){
      if(scannedCard && user_id) return activateCardIfExists(scannedCard.id, user_id);
      else return done("Error 0003: User not populated");

    }).catch(error => { console.log('caught', err.message); })
    .then(function(res){
      done("Card activated successfully");
    }).catch(error => { console.log('caught', err.message); });

    var done = function (msg) {
      console.log(msg);
      res.send(msg);
      next();
    };
});

//Handle rejections

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

// Tell express to use this router with /api before.
app.use("/api",router);

app.listen(3000, function(){
  console.log("Express server listening");
});
