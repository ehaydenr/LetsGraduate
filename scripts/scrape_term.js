var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');
var Promise = require('promise');
var x = require('xmlhttprequest').XMLHttpRequest;
var xhr = new x();
var xml2js= require('xml2js');
var xpath = require("xml2js-xpath");	

var DEPT_LIMIT = Number.MAX_VALUE;

/* MySQL Setup */
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	database : 'letsgraduate_dev',
	user     : 'dev',
	password : 'dev',
	multipleStatements: true
});

pop_terms_15()
function pop_terms_15(){
	var args = [];
	var query = "INSERT INTO Term (year, start, end, season, name) VALUES ?";
	args.push(["2015", "2015-1-20", "2015-5-6", "spring", "SP15_1"]);
	args.push(["2015", "2015-1-20", "2015-3-13", "spring", "SP15_A"]);
	args.push(["2015", "2015-3-16", "2015-5-6", "spring", "SP15_B"]);

	args.push(["2015", "2015-5-18", "2015-8-6", "summer", "SU15_1"]);
	args.push(["2015", "2015-5-18", "2015-6-12", "summer", "SU15_S1"]);
	args.push(["2015", "2015-5-18", "2015-8-6", "summer", "SU15_S2"]);
	args.push(["2015", "2015-6-15", "2015-7-10", "summer", "SU15_S2A"]);
	args.push(["2015", "2015-6-15", "2015-8-6", "summer", "SU15_S2B"]);
	args.push(["2015", "2015-7-13", "2015-8-6", "summer", "SU15_SF"]);
	
	args.push(["2015", "2015-8-24", "2015-12-9", "fall", "FA15_1"]);
	args.push(["2015", "2015-8-24", "2015-10-16", "fall", "FA15_A"]);
	args.push(["2015", "2015-10-19", "2015-12-9", "fall", "FA15_B"]);
					

	connection.query(query, [args], function(err, rows, fields){
		if(err){
			console.log("ERROR: "+err.stack);
		}
    connection.destroy();

	});
}
