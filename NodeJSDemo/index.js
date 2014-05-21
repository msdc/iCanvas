var express = require( 'express' );
var mysql = require( 'mysql' );

var connection = mysql.createConnection( {
    host: '115.28.205.176',
    user: 'root',
    password: 'Pass@word1'
});

var app = express();

app.get( '/hotword', function ( req, res ) {
    connection.connect();
    connection.query( 'SELECT * from digital_marketing.r_brand_hotword', function ( err, rows, fields ) {
        if ( err ) {
            throw err;
        }
        debugger;
        return res.send(rows);
    });
});

function GethotWord() {
    connection.connect();
    var result;
    connection.query( 'SELECT * from digital_marketing.r_brand_hotword', function ( err, rows, fields ) {
        if ( err ) {
            throw err;
        }
        debugger;
        result = rows;
    });

    connection.end();
    return result;
}

app.listen( 1337 );

console.log( 'Express app started on port 1337' );