var express = require('express');
var courseparse = require('./courseparse.js');
var app = express();
var router = express.Router();
var path = require('path');
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

router.get('/', function (req, res) {
  res.render("index");
});

router.get('/class', function (req, res){
  // Testing with premade json
  var data = require('./public/test_class.json');
  getClassById(req.query.id, function(err, data){
    if(err) res.send(500);

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

