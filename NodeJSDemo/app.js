var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '115.28.205.176',
  user     : 'root',
  password : 'Pass@word1'
});

connection.connect();

connection.query('SELECT * from digital_marketing.r_brand_hotword', function(err, rows, fields) {
  if (err) 
  {
      throw err;
  }
  for(var row in rows)
  {
      debugger;
      console.log(row);
  }
});

connection.end();