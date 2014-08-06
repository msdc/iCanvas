var express = require( 'express' );
var mysql = require( 'mysql' );

var pool = mysql.createPool( {
    connectionLimit: 10,
    host: '115.28.205.176',
    user: 'xxxx',
    password: 'xxxxxx'
});

var app = express();

app.get( '/', function ( req, res ) {
    res.send( "please choose controller to get data! like/hotword" );
});

app.get( '/hotword', function ( req, res ) {
    pool.getConnection( function ( err, connection ) {
        connection.query( 'SELECT * from digital_marketing.r_brand_hotword', function ( err, rows, fields ) {
            if ( err ) {
                throw err;
            }
            debugger;
            connection.release();
            return res.send( rows );
        });
    });
    //connection.end();
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
