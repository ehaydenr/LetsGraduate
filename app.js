// Modules
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var everyauth = require('everyauth');
var session = require('express-session');
var path = require('path');
var express = require('express');
var parseString = require('xml2js').parseString;
var http = require('http');
var async = require('async');
var request = require('request');


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
    // res.redirect('/login');
    next();
  }
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

router.get('/class/:id/:json?', function(req, res){
  var classid = req.params.id;
  var userid = req.user.google.id;
  var json = req.params.json;

  // Find out if user has taken that class
  var query = 'SELECT hours, type FROM UserClass WHERE google_id = ? AND class_id = ?;';
  connection.query(query, [userid, classid], function(err, rows, fields){
    if(err){
      console.log(err);
      res.send(500);
      return;
    }

    var taken = rows.length > 0 && rows[0].type == 'taken';
    var hours = rows.length > 0 ? rows[0].hours : '';
    var prospective = rows.length > 0 && taken == false;

    // Grab information about the class
    query = 'SELECT * FROM Class WHERE id = ?;';
    connection.query(query, [classid], function(err, rows, fields){
      if(err){
        console.log(err);
        res.send(500);
        return;
      }

      var course_data = rows[0];

      // Get section and location data
      query = 'SELECT * FROM CRNLocation WHERE class_id = ?;';
      connection.query(query, [classid], function(err, rows, fields){
        if(err){
          console.log(err);
          res.send(500);
          return;
        }
        var section_data = rows;
        if(json == undefined){ 
          res.render('WebPages/class', {google: req.user.google, prospective: prospective, taken: taken, hours: hours, course_data: course_data, section_data: section_data});
        }else{
          res.send({prospective: prospective, taken: taken, hours: hours, course_data: course_data, section_data: section_data});
        }
      });
    });
  });
});

//get the building name of a class given its dept and number
router.get('/dave/:dept/:num', function(req, res){
  var query = 'SELECT DISTINCT beginTime as start, endTime as end, daysOfWeek as days, crn, location as building, department as dept, number as num FROM CRNLocation, Class WHERE CRNLocation.class_id = Class.id AND type = \'Lecture\' AND department = ? AND number = ?;';
  connection.query(query, [req.params.dept, req.params.num], function(err, rows, fields){
    if(err){
      console.log(err);
      res.send(500);
      return;
    }
    res.send(rows);
  });

});

router.get('/prospective', function(req, res){
  var query = 'SELECT DISTINCT beginTime as start, endTime as end, daysOfWeek as days, crn, location as building, department as dept, number as num FROM CRNLocation, Class, UserClass WHERE CRNLocation.class_id = Class.id AND UserClass.class_id = Class.id AND CRNLocation.type = \'Lecture\' AND UserClass.type = \'prospective\';';
  connection.query(query, [req.params.dept, req.params.num], function(err, rows, fields){
    if(err){
      console.log(err);
      res.send(500);
      return;
    }
    res.send(rows);
  });
});


//Begining of Webpage rendering

router.get('/overview', function (req, res) {
  var id = req.user.google.id; //GOOGLE_ID; //later change to 'req.user.google.id';

  var query = 'SELECT Class.*, hours, type FROM UserClass JOIN Class ON UserClass.class_id = Class.id WHERE google_id = ?;';
  console.log("Looking up for: " + id);
  var reqs = require('./public/json/grad_reqs.json');
  var class_data = require('./public/class.json');
  connection.query(query, [id], function (err, rows, fields) {
    if(err){
      console.log(err);
      res.send(500);
      return;
    }
    var classes = new Array();
    for(var i=0; i<rows.length;i++){
      classes[i]=rows[i].department+rows[i].number;
    }

    res.render('WebPages/Overview', {"google": req.user.google, "class_data":class_data, "rows": rows, "reqs": reqs, "classes": classes});
  });
});

router.get('/councillor', function (req, res) {
  var id = req.user.google.id; 
  var class_data = require('./public/class.json');
  var query = 'SELECT Class.*, hours FROM UserClass JOIN Class ON UserClass.class_id = Class.id WHERE google_id = ? AND type = \'prospective\';';
  connection.query(query, [id], function (err, rows, fields) {
    if(err){
      console.log(err);
      res.send(500);
      return;
    }

    res.render('WebPages/Councillor', {"google": req.user.google, "rows": rows});
  });
});

router.get('/map', function (req, res) {
  res.render('WebPages/map', {"google": req.user.google});
});

//End of WebPage rendering

router.post('/import', function (req, res) {
  var id = req.user.google.id;
  var obj = JSON.parse(req.body.data)[0];
  var query = '';
  var sql = "INSERT INTO UserClass (google_id, class_id, hours, type) SELECT ?, Class.id, ? , ? FROM Class WHERE department = ? AND number = ? AND NOT EXISTS (SELECT 1 FROM UserClass WHERE google_id = ? AND class_id = Class.id);";
  for(var type in obj){
    for(var entry in obj[type]){
      var tuple = obj[type][entry];
      query += mysql.format(sql, [id, tuple.hours, (tuple.prospective ? 'prospective' : 'taken'), tuple.subject, tuple.number, id]);
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
  var hours = req.query.hours;
  var type = req.query.type;
  console.log(req.query);
  console.log("Action: " + action);

  if(action != 'insert' && action != 'delete' && action != 'update'){
    res.send(500);
    return;
  }

  // Run update
  var query_insert = 'INSERT INTO UserClass (google_id, class_id, hours, type) SELECT ? AS google_id, ? AS class_id, creditHours AS hours, ? FROM Class WHERE id = ?;'; // userid, class_id, hours
  var query_delete = 'DELETE FROM UserClass WHERE google_id = ? AND class_id = ?;';
  var query_update = 'UPDATE UserClass SET hours = ? WHERE google_id = ? AND class_id = ?;';

  var query;

  if(action == 'insert'){ 
    query = query_insert;
    var params = [userid, classid, (type == 'taken' ? 'taken' : 'prospective'), classid];
  } else if(action == 'delete'){ 
    query = query_delete;
    var params = [userid, classid];
  } else if(action == 'update'){
    query = query_update;
    var params = [hours, userid, classid];
  }

  connection.query(query, params, function(err, rows, fields) {
    if(err){
      console.log(err);
      res.send(500);
      return;
    }

    res.send(200);
  });
});

router.get('/requirement', function(req, res){
  var data = require('./public/test_requirement.json');
  res.render('requirement', data);
});

router.get('/councillorStuff', function(req, res){
  var id = req.user.google.id; //GOOGLE_ID; //later change to 'req.user.google.id';

  var query = 'SELECT Class.*, hours FROM UserClass JOIN Class ON UserClass.class_id = Class.id WHERE google_id = ?;';
  console.log("Looking up for: " + id);
  var reqs = require('./public/json/grad_reqs.json');
  connection.query(query, [id], function (err, rows, fields) {
    if(err){
      console.log(err);
      res.send(500);
      return;
    }
    var classes = new Array();
    for(var i=0; i<rows.length;i++){
      classes[i]=rows[i].department+rows[i].number;
    }

    res.json({"classRecs": require('./scripts/cs_req.json').concat(require('./scripts/eng_req.json')), "gradRecs": reqs, "classes": classes});
  });
})



var server = app.listen(3000, function () {
  var host = server.address().address
    var port = server.address().port
    console.log('Listening at http://%s:%s', host, port)

});

function getClassById(id, callback){
  var query = 'SELECT * FROM Class WHERE id = ?;';
  connection.query(query, [id], function(err, rows, fields) {
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

