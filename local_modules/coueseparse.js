var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var xhr = new XMLHttpRequest();
var require_tree = require('../cs_requirements.json');
var xml2js= require('xml2js');
var xpath = require("xml2js-xpath");	
var mysql = require('mysql');
var query_values = [];

/*
 * Connection to MySQL Server
 */
var connection = mysql.createConnection({
	host 	: 'localhost',
	database: 'letsgraduate_dev',
	user	: 'dev',
	password: 'dev'
});


/*
 * get all departments from catalog, synchronous
 */
function get_departments_cat_S(year, sem, callback){
	var url = url_cat+year+"/"+sem+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		//console.log(xhr.responseText);
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//subject");
			callback(matches);
		});
	}
}
/*
 * get all departments from schedule, synchronous
 */
function get_departments_sch_S(year, sem, callback){
	var url = url_sch+year+"/"+sem+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		//console.log(xhr.responseText);
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//subject");
			callback(matches);
		});
	}
}
/*
 * get all courses from a departmen catalog, synch
 */
function get_courses_cat_S(year, sem, dep, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//course");
			callback(dep, matches);
		});
	}
}

/* 
 * get all courses from a department schedule, synch
 */
function get_courses_sch_S(year, sem, dep, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//course");
			callback(dep, matches);
		});
	}
}

/*
 * gets the description of a course catalog, synch
 */

function get_desc_cat_S(year, sem, dep, num, course_name, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+"/"+num+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find(result, "//description");
			callback(num, course_name, matches[0]);
		});
	}
}



/*
 * gets the description of a course schedule, synch
 */

function get_desc_sch_S(year, sem, dep, num, course_name, callback){
	var url = url_cat+year+"/"+sem+"/"+dep+"/"+num+".xml";
	xhr.open('GET', url, false);
	xhr.send(null);
	if(xhr.status==200){
		xml2js.parseString(xhr.responseText, function(err, result){
			var matches = xpath.find("//description");
			callback(num, course_name, matches[0]);
		});
	}
}




function concat_query(dep, num, course_name, desc){
	insert = [dep, num, course_name,desc];
	query_values.push(insert);
}

/*
function get_all(){
	var query = "SELECT * FROM Class;";
	connection.query(query, function(err, dump){
		var query1 = "INSERT INTO Requirement (child_id_1, child_id_2, class_id, group_id, both_and, concurrent, occurence, description) VALUES ?";
		var reqs = []; 
		for(var i = require_tree.length-1;i >=0; i--){
			itter = require_tree[i];
			if(itter.req){
				continue;
			}
			var row = find_by_name(dump, itter.dep, itter.num);
				var insert = [0,0,row.id,0,0,0,0, ""];
				classes_added_db.push(itter.dep+itter.num);
				reqs.push(insert);
				require_tree.splice(i, 1);
		}
		connection.query(query1, [reqs], function(err){
			if(err){
				console.error('error querying: ' + err.stack);
			}
			
			connection.query("SELECT LAST_INSERT_ID();", function(err, info){
				var x = info[0]['LAST_INSERT_ID()'];
				console.log(x);
				for(var i = x; i<= classes_added_db.length; i++){
					added_req_id.push(i);
				}
				process_req(dump, require_tree, classes_added_db, function(){
					console.log("Done processing");
				});
			});
		});
	});

}

function process_req(dump, require_tree, classes_added_db, callback){
	var query = "SELECT * FROM Requirement;";
	var query1 = "INSERT INTO Requirement (child_id_1, child_id_2, class_id, group_id, both_and, concurrent, occurence, description) VALUES ?";
	connection.query(query, function(err, inserted){
		reqs = [];
		for(var i = require_tree.length-1; i >=0; i--){
			itter = require_tree[i];
			var a = ((typeof itter.req).localeCompare('string')==0);
			var b = ((classes_added_db.indexOf(itter.req)!= -1));
			if(a && b){
				var req_id;
				for(var j = 0; j<classes_added_db.length; j++){
					if(classes_added_db[j].localeCompare(itter.req)==0){
						req_id = added_req_id[j];
					}
				}
				id = find_by_name(dump, itter.dep, itter.num).id;
				var insert = [req_id, 0, id, 0, 0, 0, 0, itter.dep+itter.num];
				reqs.push(insert);
				added.push(itter.dep+itter.num);

				require_tree.splice(i, 1);
			}
			if((typeof itter.req).localeCompare('object')==0){
				return;			
			} 
			connection.query(query1, [reqs], function(err){
				if(err){
					console.error('error querying: ' + err.stack);
				}
				connection.query("SELECT LAST_INSERT_ID();", function(err, info){
					var x = info[0]['LAST_INSERT_ID()'];
					console.log(x);
					for(var j = x; j < added.length; j++){
						added_req_id.push(j);
					}
					if(require_tree.length != 0)
					process_req(dump, require_tree,added,  callback);
					else
					callback();

				});
			});
		}
	});
}*/

/*
 * SQL Query to store classes
 */
function store_classes(){
	var query = "INSERT INTO Class (department, number, title, description) VALUES ?";
	connection.query(query, [query_values], function(err){
		if(err){
			console.log("inserting error: " + err.stack);
		}
	});
}
/*
 * Scrapes XML for classes info
 */
function populate_classes(year, sem){
	query_values = [];
	get_departments_cat_S(year, sem, function(matches1){
		for(var i = 0; i < matches1.length; i++){
			var dep = matches1[i].$.id;
			get_courses_cat_S(year, sem, dep, function(retdep, matches2){
				for(var j = 0; j < matches2.length; j++){
					var num = matches2[j].$.id;
					var course_name = matches2[j]._;
					console.log(dep+" - "+num+" "+course_name);
					get_desc_cat_S(year, sem, retdep, num, course_name, function(retnum, retname, matches3){
						concat_query(retdep, retnum, retname, matches3);
					});
				}
			});
		}
	});
}
/*
get_courses_cat_S("2015", "spring", "AIS", function(retdep, matches2){
	for(var j = 0; j < matches2.length; j++){
		console.log(matches2[j]);
		var num = matches2[j].$.id;
		var course_name = matches2[j]._;
		get_desc_cat_S("2015", "spring", "AIS", num, course_name, function(retnum, retname, matches3){
			concat_query(retdep, retnum, retname, matches3);
		});
	}
});
*/
populate_classes("2015", "spring");
//store_classes();

