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

function get_desc(year, sem, dep, num, name){
  return new Promise(function (resolve, reject){
    var url = url_cat+year+"/"+sem+"/"+dep+"/"+num+".xml";
    request(url, function(error, response, body){
      if(error){
        reject(error);
      }else{
        xml2js.parseString(body, function(err, result){
          var matches = xpath.find(result, "//description");
          if(err || matches.length == 0){
            resolve(null);
          }else{
            resolve({
              year: year,
              semester: sem,
              num: num, 
              name: name,
              description: matches[0]
            });
          }
        });
      }
    });
  });
}

function getData(year, sem){
  return new Promise(function (resolve, reject) {
    get_departments(year, sem).then(function (res) {
      var course_promises = [];
      var departments = res.departments;
      for(var i = 0; i < departments.length && i < 1; ++i){
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
            var num = courses[j].$.id;
            var name = courses[j]._;
            var desc_promise = get_desc(year, sem, dep, num, name);
            desc_promises.push(desc_promise);
          }
        }
        Promise.all(desc_promises).then(function (res){
          // TODO insert description into database
          console.log(res);
          resolve();
        });
      });
    });
  });
}

getData('2015', 'spring').then(function (res) {
  console.log("Done!");
});

