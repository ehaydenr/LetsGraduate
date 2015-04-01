var fs = require('fs');

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
});

var data;

var query = 'SELECT * FROM Class;';

connection.query(query, function (err, rows, fields) {
  if(err){
    console.log(err);
    return;
  }

  // Close connection to DB
  connection.end();

  // Write data to file
  fs.writeFile("./public/class.json", JSON.stringify(rows), function(err) {
    if(err) {
      console.log(err);
    } else {
      console.log("The file was saved!");
    }
  }); 

});

