// Modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var everyauth = require('everyauth');
var session = require('express-session');
var path = require('path');
var express = require('express');

// Local Modules
var Auth = require('./local_modules/auth.js');
var auth = new Auth(everyauth);

// Router Def
var router = express.Router();

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(express.static(path.join(__dirname, 'public')))
  .use(bodyParser())
  .use(bodyParser.urlencoded({extended: false}))
  .use(bodyParser.json())
  .use(cookieParser())
  .use(session({secret: 'dev'}))
  .use(everyauth.middleware())
  .use('/', router);

// Middleware
router.use(function (req, res, next) {
	
  console.log(req.url);
  if(req.session && req.session.auth && req.session.auth.loggedIn){
    next();
  }else if(req.url == '/login'){
     next();
  }else{
    res.redirect('/login');
  }

	//next();
  
});

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

router.get('/', function (req, res) {


  if(req.session && req.session.auth && req.session.auth.loggedIn){

    res.redirect('overview');
    return;
  }
    res.render('WebPages/Login');
});

router.get('/login', function(req, res){
  if(req.session && req.session.auth && req.session.auth.loggedIn){
    res.redirect('overview');
  }else{
    res.render('WebPages/Login');
  }
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

router.get('/profile', function (req, res) {
  var query = 'SELECT Class.* FROM UserClass JOIN Class ON UserClass.class_id = Class.id WHERE google_id = ?;';
  console.log("Looking up for: " + req.user.google.id);
  connection.query(query, [req.user.google.id], function (err, rows, fields) {
    if(err){
      console.log(err);
      res.send(500);
      return;
    }

    res.render('profile', {"rows": rows, "user" : req.user.google});
  });
});



//Begining of Webpage rendering

router.get('/overview', function (req, res) {
  console.log("on Overview");
  var id = req.user.google.id; //GOOGLE_ID; //later change to 'req.user.google.id';

  var query = 'SELECT Class.*, hours FROM UserClass JOIN Class ON UserClass.class_id = Class.id WHERE google_id = ?;';
  console.log("Looking up for: " + id);
  var reqs = require('./public/json/grad_reqs.json');
  connection.query(query, [id], function (err, rows, fields) {
    //console.log("queried");
    if(err){
      console.log(err);
      res.send(500);
      return;
    }
    //console.log(rows);
    res.render('WebPages/Overview', {"rows": rows, "reqs": reqs});
    //console.log("rendered");
  });


	// var data = require('./cs_requirements.json');
  // res.render('WebPages/Overview', {"data":data});
  // console.log(data);
});



router.get('/councillor', function (req, res) {
   res.render('WebPages/Councillor');
});


//End of WebPage rendering

router.post('/import', function (req, res) {
  var id = req.user.google.id;
  var obj = JSON.parse(req.body.data)[0];
  var query = '';
  var sql = "INSERT INTO UserClass (google_id, class_id, hours) SELECT ?, Class.id, ? FROM Class WHERE department = ? AND number = ?;";
  for(var type in obj){
    for(var entry in obj[type]){
      var tuple = obj[type][entry];
      query += mysql.format(sql, [id, tuple.hours, tuple.subject, tuple.number]);
    }
  }
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
  var classid = req.query.id;
  var userid = req.user.google.id;
  var action = req.query.action; // Either delete or insert 
  console.log(req.query);


  if(action != 'insert' && action != 'delete'){
    res.send(500);
    return;
  }

  // Run update
  var query_insert = 'INSERT INTO UserClass VALUES (?, ?);'; // userid, class_id
  var query_delete = 'DELETE FROM UserClass WHERE google_id = ? AND class_id = ?;';
  var query = action == 'delete' ? query_delete : query_insert;
  console.log(query);
  console.log(userid);
  console.log(classid);
  connection.query(query, [userid, classid], function(err, rows, fields) {
    if(err){
      console.log(err);
      res.send(500);
      return;
    }

    res.send(200);
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

