var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');
var Promise = require('promise');
var x = require('XMLHttpRequest').XMLHttpRequest;
var xhr = new x()
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

function get_departments(year, sem){
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

function get_courses(year, sem, dep){
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

function get_desc(year, sem, dep, number, title){
  return new Promise(function (resolve, reject){
    var url = url_cat+year+"/"+sem+"/"+dep+"/"+number+".xml";
    request(url, function(error, response, body){
      bar.tick(); // Even if null, still show progress
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

function rej(res){
  console.log("Error: " + res);
}

function getData(year, sem){
  return new Promise(function (resolve, reject) {
    get_departments(year, sem).then(function (res) {
      var course_promises = [];
      var departments = res.departments;
      for(var i = 0; i < departments.length && i < DEPT_LIMIT; ++i){
        var dep = departments[i].$.id;
        var course_promise = get_courses(year, sem, dep);
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
            var desc_promise = get_desc(year, sem, dep, number, title);
            desc_promises.push(desc_promise);
          }
        }
        console.log(desc_promises.length + " classes");
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
function getNumCourses(year, sem){
	var count = 0;	
//	console.log(year);
//	console.log(sem);
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
						//console.log(count);
					});
				}
			}
		});
	}
	console.log(count);
	return count;
}

var numCourses = getNumCourses("2015", "spring");
var ProgressBar = require('progress');

var bar = new ProgressBar(':bar', { total: numCourses}); 
var timer = setInterval(function () {
  if (bar.complete) {
    console.log('\ncomplete\n');
    clearInterval(timer);
  }
}, 100);

getData('2015', 'spring').then(function (res) {
  console.log("Done!");
  // Close the connection
  connection.destroy();
}, rej);

