var express = require('express');
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
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

/* Test a query */
connection.query('SHOW TABLES;', function(err, rows) {
  if(err){
    console.error('error querying: ' + err.stack);
    return;
  }

  console.log(rows);

});

router.get('/', function (req, res) {
  res.render("index");
});

var server = app.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});

