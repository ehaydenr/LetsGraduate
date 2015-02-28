var span_collection = document.getElementsByTagName('tbody')[0].rows[3].getElementsByTagName('pre')[0].getElementsByTagName('span');

var department = span_collection[4].innerText.trim();
console.log(department);
var college = span_collection[5].innerText.trim();
console.log(college);

var required_courses = $('span#item0 span');
var foreign_lang_req = $('span#item5 span');
var taken_courses = $('span#item12 span');
var hours_req = $('span#item7')[0].innerText;

var summary = {};
var required_data = {};
var foreign_lang_data = {};
var taken_data = {};
var hours_data = {};

function skipline(line){
  if(line.length == 0 || line.charAt(0) == ',') return true;
  return false;
}

var sequence_regex = new RegExp(/([+-])\s+(\d+)\)\s+(.*)/);
var num_course_regex = new RegExp(/(SP|FA|SU)\d{2}/g);
var course_regex = new RegExp(/([A-Z]{2})(\d{2})\s+(\w+)\s+(\d{3}\s+|)(\w+\s+|)(\d\.\d)\s+(\w+)/);
var foreign_lang_regex = new RegExp(/([A-Z]{2})(\d{2})\s+(\w+)\s+(\d{3}\s+|)(\w+\s+|)(\d\.\d)\s+(\d\.\d)\s+(\w+)/);
var hours_regex = new RegExp(/\s*EARNED:\s+(\d+\.\d+)\s+HOURS\s+(\d+\.\d+)\s+GPA\sHOURS\sEARNED\s+\d+\.\d+\s+POINTS\s+\d\.\d+\s+GPA\s+IN-PROGRESS\s+(\d+\.\d+)\s+HOURS\s+\-\-\>\s+NEEDS:\s+(\d+\.\d+)\s+HOURS/);

function parseCourseLine(line, regex){
  var match, result, arr = [];
  while(match = num_course_regex.exec(span_data)){
    result = regex.exec(span_data.substring(match.index));
    arr.push(
        {
          "term": result[1], 
          "year": result[2], 
          "department": result[3], 
          "number": result[4], 
          "section": result[5], 
          "grade_point": result[6], 
          "grade_letter": result[7]
        }
    );
  }
  return arr;
}

/* Hours Req */
var text = hours_req;
if(hours_regex.test(text)){
  var result = hours_regex.exec(text);
  hours_data.total = result[1];
  hours_data.gpa = result[2];
  hours_data.in_progress = result[3];
  hours_data.need = result[4];
}

/* Foreign Lang Req */
foreign_lang_data['courses'] = [];
for(var i = 0; i < foreign_lang_req.length; ++i){
  var span_data = foreign_lang_req[i].innerText.trim();
  
  if(skipline(span_data)) continue;

  if(foreign_lang_regex.test(span_data)){
    foreign_lang_data['courses'].push.apply(foreign_lang_data['courses'], parseCourseLine(span_data, foreign_lang_regex));
  }
}

/* Courses Taken */
taken_data['courses'] = [];
for(var i = 0; i < taken_courses.length; ++i){
  var span_data = taken_courses[i].innerText.trim();
  if(skipline(span_data)) continue;

  if(course_regex.test(span_data)){
    taken_data['courses'].push.apply(taken_data['courses'], parseCourseLine(span_data, course_regex));
  }
}


/* Requirements */
var current_sequence;

for(var i = 0; i < required_courses.length; ++i){
  var span_data = required_courses[i].innerText.trim();

  if(skipline(span_data)) continue;

  if(sequence_regex.test(span_data)){

    var result = sequence_regex.exec(span_data);
    current_sequence = result[3];

    required_data[current_sequence] = {"sign": result[1], "num": result[2], "title": result[3], "courses": []};
    
  }else if(course_regex.test(span_data)){
    required_data[current_sequence]['courses'].push.apply(required_data[current_sequence]['courses'], parseCourseLine(span_data, course_regex));
  }

}

summary.hours_data = hours_data;
summary.foreign_lang_data = foreign_lang_data;
summary.required_data = required_data;
summary.taken_data = taken_data;

console.log(summary);


