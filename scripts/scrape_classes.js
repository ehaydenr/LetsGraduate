var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');
var Promise = require('promise');
var x = require('XMLHttpRequest').XMLHttpRequest;
var xhr = new x();
var xml2js= require('xml2js');
var xpath = require("xml2js-xpath");	
var ProgressBar = require('progress');
var fs = require('fs');
var DEPT_LIMIT = Number.MAX_VALUE;
var req_array = ['./scripts/eng_req.json' ,'./scripts/cs_req.json']
/* MySQL Setup */
var mysql      = require('mysql');
var connection = mysql.createConnection({
	host     : 'localhost',
	database : 'letsgraduate_dev',
	user     : 'dev',
	password : 'dev',
	multipleStatements: true
});
function get_departments_cat(year, sem){
	return new Promise(function (resolve, reject){
		var url = url_cat+year+"/"+sem+".xml"; 
		request(url,function(error, response, body){
			if(error){
				rej(error);
			}else{
				xml2js.parseString(body, function (err, result) {
					var matches = xpath.find(result, "//subject");
					resolve({
						year: year,
						semester: sem,
						departments: matches
					});		
				});
			}
		});
	});
}
function get_departments_sch(year, sem){
	return new Promise(function (resolve, reject){
		var url = url_sch+year+"/"+sem+".xml"; 
		request(url,function(error, response, body){
			if(error){
				rej(error);
			}else{
				xml2js.parseString(body, function (err, result) {
					var matches = xpath.find(result, "//subject");
					resolve({
						year: year,
						semester: sem,
						departments: matches
					});		
				});
			}
		});
	});
}
function get_courses_cat(year, sem, dep){
	return new Promise(function (resolve, reject){
		var url = url_cat+year+"/"+sem+"/"+dep+".xml";
		request(url, function(error, response, body){
			if(error){
				rej(error);
			}else{
				xml2js.parseString(body, function(err, result){
					var matches = xpath.find(result, "//course");
					resolve({
						year: year,
						semester: sem,
						department: dep, 
						courses : matches
					});
				});
			}
		});
	});
}
function get_courses_sch(year, sem, dep){
	return new Promise(function (resolve, reject){
		var url = url_sch+year+"/"+sem+"/"+dep+".xml";
		request(url, function(error, response, body){
			if(error){
				rej(error);
			}else{
				xml2js.parseString(body, function(err, result){
					var matches = xpath.find(result, "//course");
					resolve({
						year: year,
						semester: sem,
						department: dep, 
						courses : matches
					});
				});
			}
		});
	});
}
function get_desc_sch(year, sem, dep, number, title){
	return new Promise(function (resolve, reject){
		var url = url_sch+year+"/"+sem+"/"+dep+"/"+number+".xml";
		request(url, function(error, response, body){
			bar_courseOfferings.tick(); // Even if null, still show progress
			if(error){
				rej(error);
				resolve(null);
			}else{
				xml2js.parseString(body, function(err, result){
					var matches = xpath.find(result, "//description");
					var creditHoursMatches = xpath.find(result, "//creditHours");
					var crnMatches = xpath.find(result, "//section");
					var crns = [];
					for(var i = 0; i < crnMatches.length; i++){
						crns.push(crnMatches[0].$.id);
					}
					var creditHours = 0;
					if(err || matches.length == 0){
						rej("Rejecting description for: year: " + year + " semester: " + sem + " department: " + dep + " number: " + number + " title: " + title);
						matches = [null];
					}

					if(creditHoursMatches.length > 0){
						creditHours = creditHoursMatches[0];
						creditHours = creditHours.split(' ')[0];
					}

					resolve({
						year: year,
						semester: sem,
						department: dep,
						number: number, 
						title: title,
						creditHours: creditHours,
						description: matches[0],
						crns: crns
					});
				});
			}
		});
	});
}
function get_desc_cat(year, sem, dep, number, title){
	return new Promise(function (resolve, reject){
		var url = url_cat+year+"/"+sem+"/"+dep+"/"+number+".xml";
		request(url, function(error, response, body){
			bar_courses.tick(); // Even if null, still show progress
			if(error){
				rej(error);
				resolve(null);
			}else{
				xml2js.parseString(body, function(err, result){
					var matches = xpath.find(result, "//description");
					var creditHoursMatches = xpath.find(result, "//creditHours");
					var creditHours = 0;
					if(err || matches.length == 0){
						rej("Rejecting description for: year: " + year + " semester: " + sem + " department: " + dep + " number: " + number + " title: " + title);
						matches = [null];
					}

					if(creditHoursMatches.length > 0){
						creditHours = creditHoursMatches[0];
						creditHours = creditHours.split(' ')[0];
					}

					resolve({
						year: year,
						semester: sem,
						department: dep,
						number: number, 
						title: title,
						creditHours: creditHours,
						description: matches[0]
					});
				});
			}
		});
	});
}
function get_crn_info(year, sem, dep, number, crn){
	return new Promise(function(resolve, reject){
		var url = url_sch+year+"/"+sem+"/"+dep+"/"+number+"/"+crn+".xml";
		request(url, function(error, response, body){
			if(error){
				rej(error);
				resilve(null);
			}
			else{
				xml2js.parseString(body, function(err, result){
					var nameMatches = xpath.find(result, "//sectionNumber")
					var name = "";
					if(typeof nameMatches != "undefined" && typeof nameMatches[0] != "undefined") name = nameMatches[0].trim(); 

					var typeMatches = xpath.find(result, "//type");
					var type = "";
					if(typeof typeMatches != "undefined" &&  typeof typeMatches[0] != "undefined") type = typeMatches[0]['_'];

					var locMatches = xpath.find(result, "//buildingName")[0];
					var loc = "";
					if(typeof locMatches != "undefined" && locMatches[0] != "undefined") loc = locMatches;
					resolve({
						year: year,
						semester: sem,
						department: dep,
						number: number,
						crn: crn,
						name: name,
						type: type,
						loc: loc
					});
				});
			}
		});
	});
}
function rej(res){
	console.log("Error: " + res);
}

function pop_course_offerings(year, sem){
	return new Promise(function(resolve, reject){
		get_departments_sch(year, sem).then(function(res) {
			var course_promises = [];
			var departments = res.departments;
			for(var i = 0; i < departments.length && i < DEPT_LIMIT; ++i){
				var dep = departments[i].$.id;
				var course_promise = get_courses_sch(year, sem, dep);
				course_promises.push(course_promise);
			}
			Promise.all(course_promises).then(function(res){
				var desc_promises = [];
				for(var i = 0; i < res.length; ++i){
					var courses = res[i].courses;
					var dep = res[i].department;
					for(var j = 0; j < courses.length; ++j){
						var number = courses[j].$.id;
						var title = courses[j]._;
						var desc_promise = get_desc_sch(year, sem, dep, number, title);
						desc_promises.push(desc_promise);
					}
					
				}
				Promise.all(desc_promises).then(function(res){
					var offer_query = ""; 
					for(var i = 0; i < res.length; ++i){
						if(res[i] == null) 
							continue;
						var term_name = ""
						if(sem == 'spring') term_name = "SP";
						else if(sem == "fall") term_name = "FA";
						else term_name = "SU";
						term_name = term_name+year[2]+year[3]+"_1";
						var query = 	"INSERT INTO CourseOffering (hours, course_id, semester_id) "+
										"SELECT "+res[i].creditHours+", C.id, T.id "+
										"FROM Class AS C, Term AS T "+
										"WHERE C.department = '"+res[i].department+"' "+
										"AND C.number = '"+res[i].number+"' "+
										"AND T.name= '"+term_name+"';\n";
						offer_query = offer_query + query;
					}
					connection.query(offer_query, function(err, rows, fields){
						if(err) reject(err);
						else{
							resolve({
								rows: rows,
								fields: fields
							});
						}
					});
				}, rej);
			}, rej);
		}, rej);
	});
}
function pop_courses(year, sem){
	return new Promise(function (resolve, reject) {
		get_departments_cat(year, sem).then(function (res) {
			var course_promises = [];
			var departments = res.departments;
			for(var i = 0; i < departments.length && i < DEPT_LIMIT; ++i){
				var dep = departments[i].$.id;
				var course_promise = get_courses_cat(year, sem, dep);
				course_promises.push(course_promise);
			}
			Promise.all(course_promises).then(function (res){
				var desc_promises = [];
				for(var i = 0; i < res.length; ++i){
					var courses = res[i].courses;
					var dep = res[i].department;
					for(var j = 0; j < courses.length; ++j){
						var number = courses[j].$.id;
						var title = courses[j]._;
						var desc_promise = get_desc_cat(year, sem, dep, number, title);
						desc_promises.push(desc_promise);
					}
				}
				Promise.all(desc_promises).then(function (res){
					var query = 'INSERT INTO Class (department, number, title, creditHours, description) VALUES ?;';
					var args = [];
					for(var i = 0; i < res.length; ++i){
						if(res[i] == null) continue; // Ignore failures
						var arg_entry = [res[i].department, res[i].number, res[i].title, res[i].creditHours, res[i].description];
						args.push(arg_entry);
					}
					connection.query(query, [args], function(err, rows, fields){
						if(err){
							reject(err);
						}else{
							resolve({
								rows: rows, 
								fields: fields
							});
						}
					});
				}, rej);
			}, rej);
		}, rej);
	});
}
function pop_crnLocation(year, sem){
	return new Promise(function(resolve, reject){
		get_departments_sch(year, sem).then(function(res) {
			var course_promises = [];
			var departments = res.departments;
			for(var i = 0; i < departments.length && i < DEPT_LIMIT; ++i){
				var dep = departments[i].$.id;
				var course_promise = get_courses_sch(year, sem, dep);
				course_promises.push(course_promise);
			}
			Promise.all(course_promises).then(function(res){
				var desc_promises = [];
				for(var i = 0; i < res.length; ++i){
					var courses = res[i].courses;
					var dep = res[i].department;
					for(var j = 0; j < courses.length; ++j){
						var number = courses[j].$.id;
						var title = courses[j]._;
						var desc_promise = get_desc_sch(year, sem, dep, number, title);
						desc_promises.push(desc_promise);
					}
				}
				Promise.all(desc_promises).then(function(res){
					var crn_promises= [];
					for(var i = 0; i < res.length; ++i){
						if(res[i] == null) continue;
						var dep = res[i].department;
						var num = res[i].number;
						var crns = res[i].crns;
						for(var j = 0; j < crns.length; j++){
							var crn = crns[j];
							var crn_promise = get_crn_info(year, sem, dep, num, crn);
							//bar_locations.tick();
							crn_promises.push(crn_promise);
						}
					}
					Promise.all(crn_promises).then(function(res){
						for(var i = 0; i <res.length; i++){
							var section = res[i];
							var dep = section.department;
							var num = section.number;
							var crn = section.crn;
							var name = section.name;
							var type = section.type;
							var loc = section.loc;
							var query = "INSERT INTO CRNLocation(class_id, crn, name, type, location) "+
										"SELECT id, '"+crn+"', '"+name+"', '"+type+"', '"+loc+"' "+
										"FROM Class "+
										"WHERE department = '"+dep+"' "+
										"AND number = '"+num+"';\n";
							loc_queries = loc_queries + query;
						}
						connection.query(loc_queries, function(err, rows, fields){
							if(err) {
								console.log(err.stack);
							}
							else{
								resolve({
									rows: rows,
									fields: fields
								});
							}
						});
					}, rej);
				}, rej);
			}, rej);
		}, rej);
	});
}

function getNumCourseOfferings(year, sem){
	var count = 0;	
	var url = url_sch+year+"/"+sem+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//subject");
			for(var i = 0; i < matches.length && i < DEPT_LIMIT; i++){
				code = matches[i].$.id;
				var url2 = url_sch+year+"/"+sem+"/"+code+".xml";
				xhr.open('GET', url2, false);
				xhr.send(null);
				if(xhr.status==200){
					xml2js.parseString(xhr.responseText, function(err, result){
						var matches2 = xpath.find(result, "//course");
						count+=matches2.length;
					});
				}
			}
		});
	}
	console.log("Number of Course Offerings: " + count);
	return count;
}
function getNumCourses(year, sem){
	var count = 0;	
	var url = url_cat+year+"/"+sem+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//subject");
			for(var i = 0; i < matches.length && i < DEPT_LIMIT; i++){
				code = matches[i].$.id;
				var url2 = url_cat+year+"/"+sem+"/"+code+".xml";
				xhr.open('GET', url2, false);
				xhr.send(null);
				if(xhr.status==200){
					xml2js.parseString(xhr.responseText, function(err, result){
						var matches2 = xpath.find(result, "//course");
						count+=matches2.length;
					});
				}
			}
		});
	}
	console.log("Number of Courses: " + count);
	return count;
}

function insert_CAT0(obj){
	var dep = obj.dep;
	var num = obj.num
	
	var insert = 	"INSERT INTO Requirement(class_id, description) "
	var select = 	"SELECT id, '"+dep+num+"' "+
					"FROM Class "+
					"WHERE department ='"+dep+"' "+
					"AND number ='"+num+"';\n";
	return insert+select;
}
function insert_CAT1(obj){
	var dep = obj.dep;
	var num = obj.num;
	var course_name = obj.req;

	var insert = 	"INSERT INTO Requirement(child_id_1, class_id,  description) ";
	var select = 	"SELECT Requirement.id, Class.id, '"+dep+num+"'  "+
					"FROM Requirement, Class "+
					"WHERE Requirement.description = '"+course_name+"' "+
					"AND CONCAT(Class.department, Class.number)='"+dep+num+"';\n";
	return insert+select;
}
function insert_CAT2(obj){
	var operation= false;
	if(obj.operation == "*") operation = true
	var dep = obj.dep;
	var num = obj.num;
	var term1 = obj.req.term1;
	var term2 = obj.req.term2;

	var insert = 		"INSERT INTO Requirement(child_id_1, child_id_2, class_id, both_and, description) ";
//	var select_class1 = "SELECT id "+
//						"FROM Class "+
//						"WHERE CONCAT(department, number) = '"+term1+"'";
//	var select_class2 = "SELECT id "+
//						"FROM Class "+
//						"WHERE CONCAT(department, number) = '"+term2+"'";
	var select_req = 	"SELECT R1.id, R2.id, Class.id, "+operation+", '"+dep+num+"' "+
						"FROM Requirement AS R1, Requirement AS R2, Class  "+
						"WHERE R1.description= '"+term1+"' "+
						"AND R2.description= '"+term2+"' "+
						"AND CONCAT(Class.department, Class.number) = '"+dep+num+"';\n";

	return insert+select_req;
}
function insert_CAT3(obj){
	var ret = "";
	var operation = false
	var op_symbol = obj.req.operation
	if(op_symbol == '*') operation = true;

	var operation_sub1 = false;
	var concur1 = false;
	var sub_symbol1 = obj.req.term1.operation;
	if(sub_symbol1 == '*') operation_sub1 = true;
	if(sub_symbol2 == 'c') concur1 = true;

	var operation_sub2 = false;
	var concur2 = false;
	var sub_symbol2 = obj.req.term2.operation;
	if(sub_symbol2 == '*') operation_sub2 = true;
	if(sub_symbol2 == 'c') concur2 = true;

	var dep = obj.dep;
	var num = obj.num;
	var term1_1 = obj.req.term1.term1;
	var term1_2 = obj.req.term1.term2;
	var term2_1 = obj.req.term2.term1;
	var term2_2 = obj.req.term2.term2;

	where1 = "";
	where2 = "";
	term1_id = "";
	term2_id = "";
	var insert_concur = 	"INSERT INTO Requirement(class_id, concurrent, description) ";
	var sub_insert_check = 	"INSERT INTO Requirement(child_id_1, child_id_2, both_and, concurrent, description) ";

	if(concur1){
		var exists_concur1 = 	"SELECT id FROM Requirement "+
								"WHERE description = 'C-"+term1_1+"'"
		var select_concur1 = 	"SELECT id, true, 'C-"+term1_1+"' "+
								"FROM Class "+
								"WHERE CONCAT(department, number) = '"+term1_1+"' "+
								"AND NOT EXISTS ("+exists_concur1+");\n"	
		term1_pre =  insert_concur+select_concur1;
		where1 = "(R1.description = 'C-"+term1_1+"')";
	}
	else{
		if(term1_2!=""){
			var sub_exists_check1 = "SELECT id "+
									"FROM Requirement "+
									"WHERE description  = '"+term1_1+sub_symbol1+term1_2+"' "+
									"OR description = '"+term1_2+sub_symbol1+term1_1+"'"
			var sub_select_check1 = "SELECT R1.id, R2.id, "+operation_sub1+", false, '"+term1_1+sub_symbol1+term1_2+"' "+
									"FROM Requirement AS R1, Requirement AS R2 "+
									"WHERE R1.description = '"+term1_1+"' "+
									"AND R2.description = '"+term1_2+"' "+
									"AND NOT EXISTS ("+sub_exists_check1+");\n";
			term1_pre = sub_insert_check + sub_select_check1;
			where1 = 	"(R1.description = '"+term1_1+sub_symbol1+term1_2+"' OR R1.description = '"+term1_2+sub_symbol1+term1_1+"')";
		}
		else{
			where1 = "(R1.description = '"+term1_1+"')";
		}
	}
	if(concur2){
		var exists_concur2 = 	"SELECT id "+
								"FROM Requirement "+
								"WHERE description = 'C-"+term2_1+"'"
		var select_concur2 = 	"SELECT id, true, 'C-"+term2_1+"' "+
								"FROM Class "+
								"WHERE CONCAT(department, number) ='"+ term1_1+"' "+
								"AND NOT EXISTS ("+exists_concur2+");\n"	
		term2_pre =  insert_concur+select_concur2;
		where2 = "(R2.description = 'C-"+term2_1+"')";
	}
	else{
		if(term2_2!=""){
			var sub_exists_check2 = "SELECT id "+
									"FROM Requirement "+
									"WHERE description = '"+term2_1+sub_symbol2+term2_2+"' "+
									"OR description = '"+term2_2+sub_symbol2+term2_1+"'";
			var sub_select_check2 = "SELECT R1.id, R2.id, "+operation_sub2+", false, '"+term2_1+sub_symbol2+term2_2+"' "+
									"FROM Requirement AS R1, Requirement AS R2 "+
									"WHERE R1.description = '"+term2_2+"' "+
									"AND R2.description = '"+term2_2+"' "+
									"AND NOT EXISTS("+sub_exists_check2+");\n";
			term2_pre = sub_insert_check + sub_select_check2;	
			where2 = "(R2.description = '"+term2_1+sub_symbol2+term2_2+"' OR R2.description = '"+term2_2+sub_symbol2+term2_1+"')";
		}
		else{
			where2 = "(R2.description = '"+term2_1+"')";
		}
	}
	
	ret = ret + term1_pre;
	ret = ret + term2_pre;

	var insert = 	"INSERT INTO Requirement(child_id_1, child_id_2, class_id,  both_and, description) ";
	var select = 	"SELECT R1.id, R2.id, Class.id, "+operation+",'"+dep+num+"' "+
					"FROM Requirement AS R1, Requirement AS R2, Class "+
					"WHERE "+where1+" "+
					"AND "+where2+" "+
					"AND CONCAT(Class.department, Class.number)='"+dep+num+"';\n";
	return ret+insert+select; 

}
function insert_CAT4(obj){
{
	var ret = "";
	var dep = obj.dep;
	var num = obj.num;
	var ret = "";
	var operation = false;
	var symbol = obj.req.operation;
	if(symbol == '*') operation = true;
}
{
	var operation_sub1 = false;
	var concur1 = false;
	var sub_symbol1 = obj.req.term1.operation;
	var term1_1 = obj.req.term1.term1;
	var term1_2 = obj.req.term1.term2;
	if(sub_symbol1 == '*') operation_sub1 = true;
	if(sub_symbol1 == 'c') concur1 = true;
}
{
	var operation_sub2 = false;
	var sub_symbol2 = obj.req.term2.operation;
	if(sub_symbol2 == '*') operation_sub2 = true;
}
{
	var operation_sub2_1 = false;
	var concur2_1 = false;
	var sub_symbol2_1 = obj.req.term2.term1.operation;
	var term2_1_1 = obj.req.term2.term1.term1;
	var term2_1_2 = obj.req.term2.term1.term2;
	if(sub_symbol2_1 == '*') operation_sub2_1 = true;
	if(sub_symbol2_1 == 'c') concur2_1 = true;
	var desc1_1 = term2_1_1+sub_symbol2_1+term2_1_2;
	var desc1_2 = term2_1_2+sub_symbol2_1+term2_1_1;
}
{
	var operation_sub2_2 = false;
	var concur2_2 =  false;
	var sub_symbol2_2 = obj.req.term2.term2.operation;
	var term2_2_1 = obj.req.term2.term2.term1;
	var term2_2_2 = obj.req.term2.term2.term2;
	if(sub_symbol2_2 == '*') operation_sub2_2 = true;
	if(sub_symbol2_2 == 'c') concur2_2 = true;
	var desc2_1 = term2_2_1+sub_symbol2_2+term2_2_2;
	var desc2_2 = term2_2_2+sub_symbol2_2+term2_2_1;
}
{
	var pre_query1 = "";
	var pre_query2 = "";
	var pre_query2_1 = "";
	var pre_query2_2 = "";
}
{
	var where1 = "";
	var where2 = "";
	var where2_1 = "";
	var where2_2 = "";
}

	var insert_concur = 	"INSERT INTO Requirement(class_id, concurrent, description) ";
	var sub_insert_check = 	"INSERT INTO Requirement(child_id_1, child_id_2, both_and, concurrent, description) ";
	
	if(concur1){
		exists_concur1 = 	"SELECT id "+
							"FROM Requirement "+
							"WHERE description = 'C-"+term1_1+"'";	
		select_concur1 = 	"SELECT id, true, 'C-"+term1_1+"' "+
							"FROM Class "+
							"WHERE CONCAT(department, name) = "+term1_1+
							"AND NOT EXISTS ("+exists_concur1+");\n";
		pre_query1 = insert_concur+select_concur1;
		where1 = "(R1.description = 'C-"+term1_1+"')"; 
	}
	else{
		if(term1_2!=""){
			var sub_exists_check1 = "SELECT id "+
									"FROM Requirement "+
									"WHERE description  = '"+term1_1+sub_symbol1+term1_2+"' "+
									"OR description = '"+term1_2+sub_symbol1+term1_1+"'";
			var sub_select_check1 = "SELECT R1.id, R2.id, "+operation_sub1+", false, '"+term1_1+sub_symbol1+term1_2+"'"+
									"FROM Requirement AS R1, Requirement AS R2 "+
									"WHERE R1.description = '"+term1_1+"' "+
									"AND R2.description = '"+term1_2+"'"+
									"AND NOT EXISTS ("+sub_exists_check1+");\n";
			pre_query1 = sub_insert_check + sub_select_check1;
			where1 ="(R1.description = '"+term1_1+sub_symbol1+term1_2+"' OR R1.description = '"+term1_2+sub_symbol1+term1_1+"')";
		}
		else{
			where1 = "(R1.description = '"+term1_1+"')";	
		}
	}

	if(concur2_1){
		exists_concur2_1 = 	"SELECT id "+
							"FROM Requirement "+
							"WHERE description = 'C-"+term2_1_1+"'";
		select_concur2_1 = 	"SELECT id, true, 'C-"+term2_1_1+"'" +
							"FROM Class "+
							"WHERE CONCAT(department, name) = "+term2_1_1+
							"AND NOT EXISTS ("+exists_concur2_1+");\n";
		desc1_1 = "C-'"+term2_1_1+"'";
		desc1_2 = "C-'"+term2_1_1+"'";
		pre_query2_1 = insert_concur+select_concur2_1;
		where2_1 = "(R1.description = 'C-"+term2_1_1+"')";
	}
	else{
		if(term2_1_2 != ""){
			var sub_exists_check2_1 = 	"SELECT id "+
										"FROM Requirement "+
										"WHERE description = '"+desc1_1+"' "+
										"OR description = '"+desc1_2+"' ";
			var sub_select_check2_1 = 	"SELECT R1.id, R2.id, "+operation_sub2_1+", false, '"+desc1_1+"' "+
										"FROM Requirement AS R1, Requirement AS R2 "+
										"WHERE R1.description = '"+term2_1_1+"' "+
										"AND R2.description = '"+term2_1_2+"' "+
										"AND NOT EXISTS ("+sub_exists_check2_1+");\n";

			desc1_1 = term2_1_1+sub_symbol2_1+term2_1_2;
			desc1_2 = term2_1_2+sub_symbol2_1+term2_1_1;
			pre_query2_1 = sub_insert_check +sub_select_check2_1;
			where2_1 = "(R1.description = '"+desc1_1+"' OR R1.description = '"+desc1_2+"')";
		}
		else{
			desc1_1 = term2_1_1;
			desc1_2 = term2_1_1;
			where2_1 = "(R1.description = '"+term2_1_1+"')";
		}
	}
	
	if(concur2_2){
		var exists_concur2_2 = 	"SELECT id "+
								"FROM Requirement "+
								"WHERE description = 'C-"+term2_2_1+"'";
		var select_concur2_2 = 	"SELECT id, true, 'C-"+term2_2_1+"'"+
								"FROM Class"+
								"WHERE CONCAT(department, number) = '"+term2_2_1+
								"AND NOT EXISTS ("+exists_concur2_2+");\n";
		desc2_1 = "C-'"+term2_1_1+"'";
		desc2_2 = "C-'"+term2_1_1+"'";
		pre_query2_2 = insert_concur+select_concur2_2;
		where2_2 = "(R2.description = 'C-"+term2_2_2+"')";
	}
	else{
		if(term2_2_2 != ""){
			sub_exists_check2_2 = 	"SELECT id "+
									"FROM Requirement "+
									"WHERE description = '"+desc2_1+"' "+
									"OR description = '"+desc2_2+"'";
			sub_select_check2_2 = 	"SELECT R1.id, R2.id,"+operation_sub2_2+", false, '"+desc2_1+"' "+
									"FROM Requirement AS R1, Requirement AS R2 "+
									"WHERE R1.description = '"+term2_2_1+"' "+
									"AND R2.description = '"+term2_2_2+"' "+
									"AND NOT EXISTS ("+sub_exists_check2_2+");\n"
			desc2_1 = term2_2_1+sub_symbol2_2+term2_2_2;
			desc2_2 = term2_2_2+sub_symbol2_2+term2_2_1;
			pre_query2_2 = sub_insert_check + sub_select_check2_2;
			where2_2 = "(R2.description = '"+desc2_1+"') OR R2.description = '"+desc2_2+"')";
		}
		else{
			desc2_1 = term2_2_1;
			desc2_2 = term2_2_1;
			where2_2 = "(R2.description = '"+term2_2_1+"')";
		}
	}
	
	var select2 = 	"SELECT R1.id, R2.id, "+operation_sub2+", false, '("+desc1_1+")"+sub_symbol2+"("+desc2_1+")' "+
					"FROM Requirement AS R1, Requirement AS R2 "+
					"WHERE "+where2_1+" AND "+where2_2+";\n"
	pre_query2 = sub_insert_check+select2;
	where2 = "(R2.description = '("+desc1_1+")"+sub_symbol2+"("+desc2_1+")')"

	var select = 	"SELECT R1.id, R2.id, "+operation+", false, '"+dep+num+"' "+
					"FROM Requirement AS R1, Requirement AS R2 "+
					"WHERE "+where1+" AND "+where2+" "+
					"LIMIT 1;\n";
	var query = sub_insert_check+select;	
	var ret = pre_query2_1+pre_query2_2+pre_query2+pre_query1+query;
	return ret;
}

function end_req(queries){
	connection.query(queries, function (err, res){
		if(err) console.log(err);
	});
}
function populateReqTree(start, queries){
	if(start == req_array.length) return end_req(queries);
	fs.readFile(req_array[start],'utf-8', function(err, data){
		if(err) console.log(err);
		var txt = JSON.parse(data);
		for(var i = 0; i < txt.length; i++){
			req = txt[i];
			if(req.req == "") 
				queries = queries + insert_CAT0(req)	
			else if(typeof req.req == 'string') 
				queries = queries + insert_CAT1(req);
			else if((typeof req.req == 'object') && (typeof req.req.term1 == 'string'))
				queries = queries + insert_CAT2(req);	
			else if((typeof req.req == 'object') && (typeof req.req.term1 == 'object') && (typeof req.req.term1.term1 == 'string')){
				if((typeof req.req.term2 == 'object') && (typeof req.req.term2.term1 == 'string')) queries = queries + insert_CAT3(req);
				if((typeof req.req.term2 == 'object') && (typeof req.req.term2.term1 == 'object') && (typeof req.req.term2.term1.term1 == 'string')) queries = queries + insert_CAT4(req); 
			}
			else{
				console.log("UNDEFINDED");
				console.log(req.dep+req.num);
				console.log(req.req);
			}
		}
		populateReqTree(start+1, queries);

	});
}

var loc_queries = "";
//pop_crnLocation("2015", "spring").then(function(res){
//	console.log("Done Locations!")	
//	connection.destroy();
//});;


var req_queries = ""; 
var numCourses = getNumCourses("2015", "spring"); 
var numCourseOfferings = getNumCourseOfferings("2015", "spring");
var bar_courses = new ProgressBar(':bar', { total: numCourses}); 
var bar_courseOfferings = new ProgressBar(':bar', {total: numCourseOfferings});
var bar_locations = new ProgressBar(':bar', {total: numCourseOfferings});

var timer_courses = setInterval(function () {
	if (bar_courses.complete) {
		console.log('complete1');
		clearInterval(timer_courses);
	}
}, 100);
pop_courses('2015', 'spring').then(function(res){
	console.log("Done Courses!");
	var timer_offerings = setInterval(function(){
		if(bar_courseOfferings.complete){
			console.log('complete2');
			clearInterval(timer_offerings);
		}
	}, 100);
	pop_course_offerings("2015", "spring").then(function(res) {
		console.log("Done Course Offerings!");
		populateReqTree(0, req_queries);
		var timer_location = setInterval(function(){
			if(bar_locations.complete){
				console.log('complete3');
				clearInterval(timer_location);
			}
		}, 100);
		pop_crnLocation("2015", "spring").then(function(res){
			console.log("Done Locations!")	
			connection.destroy();
		});;
	}, rej);
}, rej);

