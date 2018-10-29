module.exports = function(router, odoo){

  // Provide all routes here, first is for Home page.

  router.get("/",function(req,res){
    res.json({"message" : "Welcome to Sotral API"});
  });

  //Sotral agent API

  router.post('/agent/login', (req, res, next) => {

    var data = req.body || {}; console.log("\nCalled /agent/login/ => Data"+ JSON.stringify(req.body) );

    if(!data.username || !data.password) return done(res, next, "Error 0000X: Username or password not set \n");

    getOdooUser(data.username).then(function(result){
      var users = result || [];
      if(users[0] && users[0].employee_ids[0]) //To be refactored, users[0].employee_ids[0] can be zero
      return getEmployeeByResourceId(users[0].employee_ids[0]);
      else
      return done(res, next, "Error 0000X: User (Agent) of username "+ data.username + " not foud \n");
    }).catch(error => { console.log('caught', err.message); })

    .then(function(result){
      var employees = result || [];
      if(employees[0]) return done(res, next, employees[0]);
      else
      return done(res, next, "Error 0000X: Employee of username "+ data.username + " not foud \n");
    }).catch(error => { console.log('caught', err.message); });

  });

  router.get('/agent/:employee_id/assignations/', (req, res, next) => {

    var params = req.params || {}; console.log("\nCalled /agent/:employee_id/assignations/ => Data"+ JSON.stringify(req.params));

    if(!params.employee_id) return done(res, next, "Error 0000X: Employee_id not set \n");

    getEmployeeByResourceId(params.employee_id).then(function(result){
      var employees = result || [];
      if(employees[0] && employees[0].agent_type == 'driver')
      return getEmployeeAssignedVehicle(params.employee_id);
      else
      return done(res, next, "Error 0000X: User (Agent) of Id "+ params.employee_id + " not foud \n");
    }).catch(error => { console.log('caught', err.message); })

    .then(function(result){
      var vehicles = result || [];
      if(vehicles[0]) done(res, next, vehicles[0]);
      else
      return done(res, next, "Error 0000X: No bus found \n");
    }).catch(error => { console.log('caught', err.message); });

  });


  //Sotral customer API calls

  router.get('/user/:phone/balance', (req, res, next) => {

    var params = req.params || {}; console.log("\nCalled /customers/:phone/balance => Data"+ JSON.stringify(req.params));

    getUserByPhone(params.phone).then(function(result){
      var users = result || [];
      if(users[0])
      return getUserCardBalance(users[0]);
      else
      return done(res, next, "Error 0000X: User of phone "+ params.phone + " not foud \n");
    }).catch(error => { console.log('caught', err.message); })

    .then(function(result){
      console.log("\nReturning user balance "+  result);
      res.send("" + result);
    }).catch(error => { console.log('caught', error.message); });

  });


  router.get('/card/history/:phone', (req, res, next) => {

    var params = req.params || {}; console.log("\nCalled /card/history/:phone => Data"+ JSON.stringify(req.params) );

    getUserByPhone(params.phone).then(function(result){
      var users = result || [];
      if(users[0])
      return getUserCardHistory(users[0]);
      else
      return done(res, next, "Error 0000X: User of phone "+ params.phone + " not foud \n");
    }).catch(error => { console.log('caught', err.message); })

    .then(function(result){
      console.log("\nReturning user historye "+  result);
      res.send("" + result);
    }).catch(error => { console.log('caught', error.message); });

  });

  router.post('/card/topup/notify', (req, res, next) => {

    var data = req.body || {};

  });

  router.get('/card/topup/params', (req, res, next) => {
     res.send({'TMONEY':'*145*1*1*amount*91859704#', 'FLOOZ':'155*1*96632444*amount#', 'TMONEY_VS':'(91 85 97 04)', 'FLOOZ_VS':'96632444' ,'amounts':[10, 20, 50, 80]});
  });


  // User account setup

  router.post('/user/account-setup/', (req, res, next) => {

      var data = req.body || {}; console.log("\nCalled /account-setup/ => Data"+ JSON.stringify(req.body) );

      var scannedCard = null;

      // First of all we check if the scanned card exists
      getCardByQRCode(data.code).then(function(result){
        var card = result || {};
        console.log("\nA card has been scanned for first setup - Code: " + data.code + " Card found: " + JSON.stringify(card));

        if( card.card_status == false ) { // Card exists but is not active yet
          scannedCard = card;

          // Then we check if user phone is already registered
          return getUserByPhone(data.phone);
        }
        else if(card.card_status == true) return done(res, next, "Error 0001x: Carte déja activée \n"); // Card already exists and is active
        else return done(res, next, "Error 0001: Carte non trouvée \n");

      }).catch(error => { console.log('caught', error.message); })
      .then(function(result){

        var users = result || [];
        console.log(users);

        if(users.length > 0) return done(res, next, "Error 0002: Ce numéro de téléphone exist déjà dans la base de données \n");
        else if(scannedCard) return createUser(data.name, data.phone);
        else return done(res, next, "Exiting here \n");

      }).catch(error => { console.log('caught', error.message); })
      .then(function(user_id){
        if(scannedCard && user_id) return activateCardIfExists(scannedCard.id, user_id);
        else return done(res, next, "Error 0003: User not populated \n");

      }).catch(error => { console.log('caught', error.message); })
      .then(function(res){
        done(res, next, "Card activated successfully \n");
      }).catch(error => { console.log('caught', error.message); });
  });

  // Functions

  //Agent API

  var getOdooUser = function(_username){
    return new Promise(function(resolve, reject) {
      odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['phone', '=', _username]]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw('res.users', 'search_read', params, function (err, values) {
           if (err) { reject(err); }
           resolve(values);
        });
      });
    });
  }

  var getEmployeeByResourceId = function(_employee_id){
    return new Promise(function(resolve, reject) {
      odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['id', '=', _employee_id]]);
        inParams.push(['name', 'id', 'agent', 'agent_type']); //fields
        inParams.push(0); //offset
        inParams.push(1); //limit
        var params = [];
        params.push(inParams);
        odoo.execute_kw('hr.employee', 'search_read', params, function (err, values) {
           if (err) { reject(err); }
           resolve(values);
        });
      });
    });
  }

  var getEmployeeAssignedVehicle = function(_employee_id){
    return new Promise(function(resolve, reject) {
      odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['id', '!=', 0]]);
        inParams.push(['name', 'id', 'bus_line_id', 'license_plate']); //fields
        inParams.push(0); //offset
        inParams.push(1); //limit
        var params = [];
        params.push(inParams);
        odoo.execute_kw('fleet.vehicle', 'search_read', params, function (err, values) {
           if (err) { reject(err); }
           resolve(values);
        });
      });
    });
  }

  var getVehicleAssignedLine = function(_bus_line_id){
    return new Promise(function(resolve, reject) {
      odoo.connect(function (err) {
        if (err) { return console.log(err); }
        console.log('Connected to Odoo server.');
        var inParams = [];
        inParams.push([['bus_line_id', '=', _bus_line_id]]);
        var params = [];
        params.push(inParams);
        odoo.execute_kw('strl.busline', 'search_read', params, function (err, values) {
           if (err) { reject(err); }
           resolve(values);
        });
      });
    });
  }

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

  var getUserByPhone = function(_phone){
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
          inParams.push([['id', '=', _user_id]]);
          var params = [];
          params.push(inParams);
          odoo.execute_kw('res.partner', 'search_read', params, function (err, customers) {
             if (err) { reject(err); }
             resolve(customers);
          });
      });
    });
  }

  var getUserCard = function(_user_id){

    return new Promise(function(resolve, reject){
      odoo.connect(function (err) {
          if (err) { reject(err); }

          var inParams = [];
          inParams.push([['card_owner', '=', _user_id]]);
          var params = [];
          params.push(inParams);
          odoo.execute_kw('card.card', 'search_read', params, function (err, cards) {
             if (err) { reject(err); }
             resolve(cards);
          });
      });
    });
  }

  var getUserCardBalance = function(_user_id){

    return new Promise(function(resolve, reject){
      odoo.connect(function (err) {
          if (err) { reject(err); }

          var inParams = [];
          inParams.push([['card_owner', '=', _user_id]]);
          var params = [];
          params.push(inParams);
          odoo.execute_kw('card.card', 'search_read', params, function (err, cards) {
             if (err) { reject(err); }
             resolve(cards[0].card_value);
          });
      });
    });
  }

  var getCardHistory = function(_card_id){

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

  var done = function (res, next, msg) {
    console.log(msg);
    res.send(msg);
    next();
  };

}
