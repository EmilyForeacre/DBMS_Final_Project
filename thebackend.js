//Paul Anderson, 
//Course Title: Data Base Systems Management
//Submission Date: 
//Assignment: Final Project, Backend Code

// to view http://localhost:3000/
// establishing constants, requirements from express and mysql2/promise
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mysql = require('mysql2/promise');

const pool = require('./mysqlConnection');

//testing for solid connection to database

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'htmlfiles' directory
// specifically serves the login.html file when accessing the root URL
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './htmlfiles/login.html'));
});

// login route to serve dashboard.html upon form submission
app.post('/login', function(req, res) {
    var emails = req.body.email;
    var password = req.body.password;

    // password should be license_number
    const loginquery = 'SELECT * FROM doctors WHERE email = ? AND license_number = ?';

    

    try {
        executeLoginQuery();

        //asyncronous function to execute the login query
        async function executeLoginQuery() {
            // using the connection pool to execute the login query with provided email and password
            const results = await pool.execute(loginquery, [emails, password])


            // if exactly one result is returned, login is successful
            // otherwise, login fails
            if (results[0].length == 1) {
                console.log("Login successful for email:", emails);
                res.sendFile(path.join(__dirname, './htmlfiles/dashboard.html'));
            } else {
                //reload to the sendfile screen if login fails
                console.log("Login failed for email:", emails);
                res.sendFile(path.join(__dirname, './htmlfiles/login.html'));
            }

        }
        
    } catch (error) {
        console.error('Error executing login query:', error);

    }
    
});

// Displays current port and how to access the application
app.listen(port, function() {
    console.log(`Current Port: ${port}! Access the application at http://localhost:${port}/` );
});
