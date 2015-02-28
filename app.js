/* OAUTH */
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var CLIENT_ID = '430770259727-sbqrr3cpm8prhmf6v23l5objsq6rv7lg.apps.googleusercontent.com';
var CLIENT_SECRET = 'Ziyd-uSWZ0sFme87w4cGzbKJ';
var REDIRECT_URL = 'http://localhost:3000/oauth2callback';
var oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL);
var plus = google.plus('v1');

var express = require('express');
var courseparse = require('./courseparse.js');
var app = express();
var router = express.Router();
var path = require('path');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/plus.me'
});

// Router
app.use('/', router);

// Middleware
router.use(function (req, res, next) {
  console.log(req.url);
  //console.log(oauth2Client);
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
  password : 'dev'
});

/* MySQL test connection */
connection.connect(function(err){
	if (err) {
		console.error('error connecting: ' + err.stack);
		return;
	}
	console.log('connected as id ' + connection.threadId);
});

router.get('/', function (req, res) {

  // retrieve user profile
  plus.people.get({ userId: 'me', auth: oauth2Client }, function(err, profile) {
    if (err) {
      console.log('An error occured', err);
      res.render('index', {"url":url});
      return;
    }
    res.render("index", {"url":url, "profile": profile});
  });

});

router.get('/oauth2callback', function (req, res) {
  var code = req.query.code;
  oauth2Client.getToken(code, function (err, tokens) {
    oauth2Client.setCredentials(tokens);
    console.log(oauth2Client);
    res.redirect('/');
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

router.get('/populate', function(req, res){
	year = "2015";
	sem = "spring";
	courseparse.get_departments_hash(year, sem, function(matches1){
		for(var i = 0; i <matches1.length; i++){
			var dep = matches1[i].$.id;
			courseparse.get_courses_hash(year,sem, dep, function(retdep, matches2){
				for(var j = 0; j < matches2.length; j++){
					var num = matches2[j].$.id;
					var course_name = matches2[j]._;
					courseparse.get_desc(year, sem, retdep ,num,course_name, function(retnum,retname, matches3){
						courseparse.concat_query(retdep, retnum, retname, matches3);
            console.log(matches3);
					});
				}		
			}); 
		}
		res.send(200);
	});
});

router.get('/store', function(req, res){
	call_query(function(){
    console.log("Finished Calling Query");
  });	
	res.send(200);
});

function call_query(callback){
	var query = "INSERT INTO Class (department, number, title, description) VALUES ?";
	connection.query(query, [courseparse.values], function(err) {
		if(err){
			console.error('error querying: ' + err.stack);
		}
    callback();
	});
}

