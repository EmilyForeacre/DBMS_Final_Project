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
const fsp = require('fs').promises;

const pool = require('./mysqlConnection');
const { read } = require('fs');

//testing for solid connection to database

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

async function readAndServe(path, res) {
    try {
        const data = await fsp.readFile(path);
        res.setHeader('Content-Type', 'text/html');
        res.end(data);
    } catch (err) {
        console.error("File Read Error:", err);
        res.status(404).send("<html><body><h1>404 Not Found</h1><p>The file " + path + " could not be served.</p></body></html>");
    }
}

// Serve static files from the 'htmlfiles' directory
// specifically serves the login.html file when accessing the root URL
// All the .gets serve their respective html files
app.get('/', function(req, res) {
    readAndServe("./htmlfiles/login.html", res);
});

app.get('/logout', function(req, res) {
    readAndServe("./htmlfiles/login.html", res)
});

app.get('/patient', function(req, res) {
    readAndServe("./htmlfiles/patient.html", res)
});

app.get('/appointment', function(req, res) {
    readAndServe("./htmlfiles/appointments.html", res)
});

app.get('/doctor', function(req, res) {
    readAndServe("./htmlfiles/doctors.html", res)
});

app.get('/medicine', function(req, res) {
    readAndServe("./htmlfiles/medicine.html", res)
});

//all the post requests for the various html files
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
                
                //reset the values of emails and password
                emails = '';
                password = '';
            }

        }
        
    } catch (error) {
        console.error('Error executing login query:', error);

    }
    
});

// all the posts for appointements.html
app.post('/add_appointment', async(req, res) => {
    const { patient_id, doctor_id, appointment_date, appointment_time,reason_for_visit } = req.body;
    const insertQuery = 'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason_for_visit, status) VALUES (?, ?, ?, ?, ?, "Scheduled")';
    const params = [patient_id, doctor_id, appointment_date, appointment_time,reason_for_visit];
    try {
        await pool.execute(insertQuery, params);

        console.log("Appointment added successfully for patient ID:", patient_id);
        res.redirect('/appointment');

    } catch (error) {
        console.error('Error adding appointment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_appointment', async(req, res) => {
    const {patient_id, appointment_date} = req.body;
    const deleteQuery = 'DELETE FROM appointments WHERE patient_id = ? AND appointment_date = ?';
    const param = [patient_id, appointment_date];    

    console.log("Received delete request for patient ID:", patient_id, " on date:", appointment_date);

    try {
        await pool.execute(deleteQuery, param);
        console.log("Appointment deleted successfully for patient ID:", patient_id, " on date:", appointment_date);
        res.redirect('/appointment');
    } catch (error) {   
        console.error('Error deleting appointment:', error);
        res.status(500).send('Internal Server Error');
    }

});


// Displays current port and how to access the application
app.listen(port, function() {
    console.log(`Current Port: ${port}! Access the application at http://localhost:${port}/` );
});
