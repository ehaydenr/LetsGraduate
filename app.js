var request = require('request');
var express = require('express');
var app = express();
var parseString = require('xml2js').parseString;
var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cou = "http://courses.illinois.edu/cisapp/explorer/courses/";
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

app.get('/', function (req, res) {
	res.send('Hello World!')
})

var server = app.listen(3000, function () {

	var host = server.address().address
	var port = server.address().port

	console.log('Example app listening at http://%s:%s', host, port)

})

app.get('/populate', function(req, res){
	get_departments_hash("2015", "summer");
	res.send("Hi eric");
	/*	connection.query('', function(err, rows){
		if(err){
			console.error('error populating: ' + err.stack);
			return;
		}
		console.log(rows);
	});*/
});

function get_departments_hash(year, sem){
	console.log('dima');
	var ret = {};
	var url = url_sch+year+"/"+sem+".xml"; 
/*	request(url , function(error, response, body){
		doc = JSON.dw(eval("(" + body + ")")); 
	});*/
	return 5;

}
