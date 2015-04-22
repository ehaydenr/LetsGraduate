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
    res.redirect('/login');
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
  var query = 'SELECT hours FROM UserClass WHERE google_id = ? AND class_id = ?;';
  connection.query(query, [userid, classid], function(err, rows, fields){
    if(err){
      console.log(err);
      res.send(500);
      return;
    }

    var taken = rows.length > 0;
    var hours = taken ? rows[0].hours : '';
    var prospective = false; // TODO

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
        console.log(section_data);
        if(json == undefined){ 
          res.render('WebPages/class', {google: req.user.google, prospective: prospective, taken: taken, hours: hours, course_data: course_data, section_data: section_data});
        }else{
          res.send({prospective: prospective, taken: taken, hours: hours, course_data: course_data, section_data: section_data});
        }
      });
    });
  });
});

/*
//get the building name of a class given its dept and number
router.get('/class/:dept/:num', function(req, res){
  var options = {
    host: 'courses.illinois.edu',
    path: '/cisapp/explorer/schedule/2015/fall/'+req.params.dept.toUpperCase()+"/"+req.params.num + ".xml"
  };

  var req = http.get(options, function(res2) {
    console.log('STATUS: ' + res2.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));

    // Buffer the body entirely for processing as a whole.
    var xml = '';
    res2.on('data', function(chunk) {

      xml+=chunk;

    }).on('end', function() {
      parseString(xml, function(err, result){
        // console.log(result);
        var arr = result["ns2:course"]["sections"][0]["section"];
        var classes = [];
        for(var i = 0; i<arr.length; i++){
          classes.push(arr[i]["$"]["href"]);
        }
        var farray = [];
        for(var i = 0; i< classes.length; i++){
          farray.push(
              function(callback) {
                var res1;
                var classURL = classes.pop();
                request(classURL, function(err, response, body) {

                  // JSON body
                  if(err) { 
                    console.log(err); 
                    callback(true); 
                    return; 
                  }

                  console.log("inside callback");
                  parseString(body, {async:false, trim: true} ,function (err, result1) {
                    res1 = result1;
                    callback(false,result1);
                  });
                });

              });
        }
        async.parallel(farray,
            function(err, results) {
              if(err) { 
                console.log(err); 
                res.send(500,"Server Error"); 
                return; 
              }
              var finalArray = [];

              for(var i = 0; i<results.length; i++){
                console.log(results[i]["ns2:section"]["parents"][0]["course"][0]["$"]["id"]);
                baseOb = results[i]["ns2:section"]["meetings"][0]["meeting"][0];
                if(baseOb["type"][0]["_"].toLowerCase().indexOf("lecture") != -1){
                  finOb = {};
                  finOb["start"] = baseOb["start"][0];
                  finOb["end"] = baseOb["end"][0];
                  finOb["days"] = baseOb["daysOfTheWeek"][0];
                  finOb["building"] = baseOb["buildingName"][0];
                  finOb["dept"] = results[i]["ns2:section"]["parents"][0]["subject"][0]["$"]["id"];
                  finOb["num"] = results[i]["ns2:section"]["parents"][0]["course"][0]["$"]["id"];

                  finalArray.push(finOb);
                }
              }

              res.send(finalArray);
            }
        );
      });
    });
  });
});

*/


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
    console.log(rows);

    res.render('WebPages/Councillor', {"google": req.user.google, "rows": rows});
  });
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
  console.log(req.query);
  console.log("Action: " + action);

  if(action != 'insert' && action != 'delete' && action != 'update'){
    res.send(500);
    return;
  }

  // Run update
  var query_insert = 'INSERT INTO UserClass (google_id, class_id, hours) SELECT ? AS google_id, ? AS class_id, creditHours AS hours FROM Class WHERE id = ?;'; // userid, class_id, hours
  var query_delete = 'DELETE FROM UserClass WHERE google_id = ? AND class_id = ?;';
  var query_update = 'UPDATE UserClass SET hours = ? WHERE google_id = ? AND class_id = ?;';

  var query;

  if(action == 'insert'){ 
    query = query_insert;
    var params = [userid, classid, classid];
  } else if(action == 'delete'){ 
    query = query_delete;
    var params = [userid, classid];
  } else if(action == 'update'){
    query = query_update;
    var params = [hours, userid, classid];
  }

  console.log(query);

  console.log(params);

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

