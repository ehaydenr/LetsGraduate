var url_sch = "http://courses.illinois.edu/cisapp/explorer/schedule/";
var url_cat = "http://courses.illinois.edu/cisapp/explorer/catalog/";
var request = require('request');
var Promise = require('promise');

var xml2js= require('xml2js');
var xpath = require("xml2js-xpath");	

function get_departments(year, sem){
  return new Promise(function (resolve, reject){
    var url = url_cat+year+"/"+sem+".xml"; 
    request(url,function(error, response, body){
      if(error){
        reject(error);
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
        reject(error);
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

var printCourse = function (res) {
  console.log(res);
}

function getDep(year, sem){
  get_departments(year, sem).then(function (res) {
    course_promises = [];
    var departments = res.departments;
    for(var i = 0; i < departments.length; ++i){
      var dep = departments[i].$.id;
      var course_promise = get_courses(year, sem, dep);
      course_promises.push(course_promise);
    }
    Promise.all(course_promises).then(function (res){
      console.log(res);
    });
  });
}

getDep('2015', 'spring');
