var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');
var early  = require("earley-node").early;
var grammar = GrammerFromFile("req.cfg");

var xml2js= require('xml2js');
var xpath = require("xml2js-xpath");	
var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var values = [];
var prereq = [];
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Router
app.use('/', router);

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

/* Test a query */
connection.query('SHOW DATABASES;', function(err, rows) {
	if(err){
		console.error('error querying: ' + err.stack);
		return;
	}
	console.log(rows);

});

router.get('/', function (req, res) {
  res.render("index");
});

router.get('/class', function (req, res){
  // Testing with premade json
  var data = require('./public/test_class.json');
  res.render('class', data);
});

router.get('/requirement', function(req, res){
  var data = require('./public/test_requirement.json');
  res.render('requirement', data);
});

var server = app.listen(3000, function () {
	var host = server.address().address
	var port = server.address().port
	console.log('Example app listening at http://%s:%s', host, port)

});

router.get('/populate', function(req, res){
	year = "2015";
	sem = "spring";
	console.log("start");
	get_departments_hash(year, sem, function(matches1){
		for(var i = 0; i <matches1.length; i++){
			var dep = matches1[i].$.id;
			get_courses_hash(year,sem, dep, function(retdep, matches2){
				for(var j = 0; j < matches2.length; j++){
					var num = matches2[j].$.id;
					var course_name = matches2[j]._;
					get_desc(year, sem, retdep ,num,course_name, function(retnum,retname, matches3){
						concat_query(retdep, retnum, retname, matches3);
					});
				}		
			}); 
		}
		res.send(200);
	});
});

router.get('/store', function(req, res){
	call_query();	
	res.send(200);
});
function get_departments_hash(year, sem, callback){
	var url = url_cat+year+"/"+sem+".xml"; 
	console.log(url);
	request(url,function(error, response, body){
		xml2js.parseString(body, function (err, result) {
			var matches = xpath.find(result, "//subject");
			callback(matches);		
		});
	});
}

function get_courses_hash(year, sem, dep, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+".xml";
	request(url, function(error, response, body){
		xml2js.parseString(body, function(err, result){
			var matches = xpath.find(result, "//course");
			callback(dep, matches);
		});
	});
}

function get_desc(year, sem, dep, num,course_name, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+"/"+num+".xml";
	request(url, function(error, response, body){
		xml2js.parseString(body, function(err, result){
			var matches = xpath.find(result, "//description");
			callback(num,course_name, matches[0]);
		});
	});

}

function concat_query(dep, num, course_name, desc){
	insert = [dep, num, course_name,desc];
	values.push(insert);
	console.log(insert);
}

function call_query(){
	var query = "INSERT INTO Class (department, number, title, description) VALUES ?";
	connection.query(query, [values], function(err) {
		if(err){
			console.error('error querying: ' + err.stack);
			return;
		}
	});
}

