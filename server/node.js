const express = require('express');
const cors = require('cors');
const mysql = require("mysql");
const bodyParser = require("body-parser");
const app = express();
app.use(cors()); 
app.use(bodyParser.json());

require('dotenv/config'); 



const con = mysql.createConnection({
    host: process.env.db_host,
    user: process.env.db_user,
    password: process.env.db_password,
    database: process.env.db_database
});

con.connect();




app.post('/', function(request, response) {
    console.log(request.body)
});

app.post('/getAtoms', function(request, response) {



    let stmt = 'SELECT id, name, weight, symbol FROM elements WHERE symbol=';

    for (let i = 0; i < request.body.atoms_data.length; i++) {
        if (i === request.body.atoms_data.length - 1) {
            stmt += "'" + request.body.atoms_data[i] + "'" + ";";
        } else {
            stmt += "'" + request.body.atoms_data[i] + "'" + " OR symbol=";
        }
    }


    con.query(stmt, function(error, results) {
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    })
});

app.get('/getAll', function(request, response) {

    let stmt = 'SELECT id, name, weight, symbol FROM elements';

    con.query(stmt, function(error, results) {
        if ( error ){
            response.status(400).send('Error in database operation');
        } else {
            response.send(results);
        }
    })
});

//ROUTES

app.listen(5000, function () {
    console.log('Active, port 5000');
});