var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');

var xml2js= require('xml2js');
var xpath = require("xml2js-xpath");	

var values = [];
var prereq = [];

module.exports.get_departments_hash = function get_departments_hash(year, sem, callback){
	var url = url_cat+year+"/"+sem+".xml"; 
	request(url,function(error, response, body){
		xml2js.parseString(body, function (err, result) {
			var matches = xpath.find(result, "//subject");
			callback(matches);		
		});
	});
}

module.exports.get_courses_hash = function get_courses_hash(year, sem, dep, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+".xml";
	request(url, function(error, response, body){
		xml2js.parseString(body, function(err, result){
			var matches = xpath.find(result, "//course");
			callback(dep, matches);
		});
	});
}

module.exports.get_desc = function get_desc(year, sem, dep, num,course_name, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+"/"+num+".xml";
	request(url, function(error, response, body){
		xml2js.parseString(body, function(err, result){
			var matches = xpath.find(result, "//description");
			callback(num,course_name, matches[0]);
		});
	});

}

module.exports.concat_query = function concat_query(dep, num, course_name, desc){
	insert = [dep, num, course_name,desc];
	values.push(insert);
}

module.exports.values = values;
