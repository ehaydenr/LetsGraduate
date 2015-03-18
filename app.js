var bodyParser = require('body-parser')
var auth = require('./local_modules/auth.js');
var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Router
app.use('/', router);


// Middleware
router.use(function (req, res, next) {
  console.log(req.url);
  next();
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

/* MySQL Setup */
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  database : 'letsgraduate_dev',
  user     : 'dev',
  password : 'dev',
  multipleStatements: true
});

/* MySQL test connection */
connection.connect(function(err){
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});

router.get('/oauth2callback', function (req, res) {
  var code = req.query.code;
  auth.oauth2Client.getToken(code, function (err, tokens) {
    auth.oauth2Client.setCredentials(tokens);
    res.redirect('/');
  });
});

router.get('/', function (req, res) {

  // retrieve user profile
  auth.getProfile(function(err, profile){
    if(err){
      console.log(err);
      res.render('index', {"url":auth.url});
      return;
    }
    res.render("index", {"url":auth.url, "profile": profile});
  });

});

router.get('/profile', function (req, res) {
  plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
    if (err) {
      console.log('An error occured', err);
      res.send(401);
      return;
    }

    var query = 'SELECT Class.* FROM UserClass JOIN Class ON UserClass.class_id = Class.id WHERE google_id = ?;';
    connection.query(query, [profile.id], function (err, rows, fields) {
      if(err){
        console.log(err);
        res.send(500);
        return;
      }

      res.render('profile', {"profile": profile, "rows": rows});
    });


  });
});

router.post('/import', function (req, res) {
  //console.log(req.body);
  var id = req.body.id;
  var obj = JSON.parse(req.body.data)[0];
  var assoc = [];
  var query = '';
  var sql = "INSERT INTO UserClass (google_id, class_id) SELECT ?, Class.id FROM Class WHERE department = ? AND number = ?;";
  for(var type in obj){
    for(var entry in obj[type]){
      var tuple = obj[type][entry];
      assoc.push([id, tuple.subject, tuple.number]);
      query += mysql.format(sql, [id, tuple.subject, tuple.number]);
    }
  }
  //INSERT INTO UserClass (google_id, class_id)
  //  SELECT 12341234, Class.id
  //      FROM Class WHERE department = 'CS' AND number = '125';
  console.log(query);
  var ret = connection.query(query, function (err){
    if(err){
      console.log(err);
      res.send(500);
      return;
    }
    console.log("Succesful import!");
    res.send(200);
  });
  console.log(ret.sql);
});

router.get('/updateClass', function (req, res) {
  // retrieve user profile
  var id = req.query.id;
  var action = req.query.action; // Either delete or insert 

  if(action != 'insert' && action != 'delete'){
    res.send(500);
    return;
  }

  plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
    if (err) {
      console.log('An error occured', err);
      res.send(401);
      return;
    }
    // Run update
    var query_insert = 'INSERT INTO UserClass VALUES (?, ?);'; // userid, class_id
    var query_delete = 'DELETE FROM UserClass WHERE google_id = ? AND class_id = ?;';
    var query = action == 'delete' ? query_delete : query_insert;
    connection.query(query, [profile.id, id], function(err, rows, fields) {
      if(err){
        console.log(err);
        res.send(500);
        return;
      }

      res.send(200);
    });
  });
});

router.get('/class', function (req, res){
  // Testing with premade json
  var data = require('./public/test_class.json');
  getClassById(req.query.id, function(err, data){
    if(err) {
      res.send(500);
      return;
    }

    res.render('class', data);
  });
});

router.get('/requirement', function(req, res){
  var data = require('./public/test_requirement.json');
  res.render('requirement', data);
});

var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Listening at http://%s:%s', host, port)

});

function getClassById(id, callback){
  var query = 'SELECT * FROM Class WHERE id = ?;';
	connection.query(query, [id], function(err, rows, fields) {
    console.log(rows[0]);

    callback(err, rows[0]);
	});
}

function call_query(callback){
	var query = "INSERT INTO Class (department, number, title, description) VALUES ?";
	connection.query(query, [courseparse.values], function(err) {
		if(err){
			console.error('error querying: ' + err.stack);
		}
    callback();
	});
}

