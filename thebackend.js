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

    //code to validate user credentials goes here

    // password should be license_number
    const loginquery = 'SELECT * FROM doctors WHERE email = ? AND license_number = ?';

    res.sendFile(path.join(__dirname, './htmlfiles/dashboard.html'));

    try {
        pool.execute(loginquery, [emails, password])
    } catch (error) {
        console.error('Error executing login query:', error);

    }
    
});

// Displays current port and how to access the application
app.listen(port, function() {
    console.log(`Current Port: ${port}! Access the application at http://localhost:${port}/` );
});
