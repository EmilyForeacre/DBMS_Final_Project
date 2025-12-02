//Paul Anderson, Cooper Simon, Emily Foreacre 
//Course Title: Data Base Systems Management
//Submission Date: 
//Assignment: Final Project, Backend Code


// to view http://localhost:3000/
// establishing constants, requirements from express and mysql2/promise
const session = require('express-session');
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const mysql = require('mysql2/promise');
const fsp = require('fs').promises;

const pool = require('./mysqlConnection');
const e = require('express');

//testing for solid connection to database

// Middleware to parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    secret: 'finalprojectsecret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 10 // Session expires after 1 minute of inactivity
    }
})); 

// Serve static files from the 'public' directory
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
    console.log(req.session);
    console.log(req.sessionID);

    // if the user is already logged in, serve dashboard.html
    if(req.session.loggedIn) {
        return readAndServe("./htmlfiles/dashboard.html", res);
    } else {
        // if the user is not logged in, serve login.html
        readAndServe("./htmlfiles/login.html", res);
    }
});

app.get('/logout', function(req, res) {
    readAndServe("./htmlfiles/login.html", res)
});

app.get('/patient', function(req, res) {
    // if the user is not logged in, redirect to login page
    if(req.session.loggedIn !== true) {
        readAndServe("./htmlfiles/login.html", res)
    } else {
        readAndServe("./htmlfiles/patient.html", res)
    }
});

app.get('/appointment', function(req, res) {
    // if the user is not logged in, redirect to login page
    if(req.session.loggedIn !== true) {
        readAndServe("./htmlfiles/login.html", res)
    } else {
        readAndServe("./htmlfiles/appointments.html", res)
    }
});

app.get('/doctor', function(req, res) {
    // if the user is not logged in, redirect to login page
    if(req.session.loggedIn !== true) {
        readAndServe("./htmlfiles/login.html", res)
    } else {
        readAndServe("./htmlfiles/doctors.html", res)
    }
});

app.get('/medicine', function(req, res) {
    // if the user is not logged in, redirect to login page
    if(req.session.loggedIn !== true) {
        readAndServe("./htmlfiles/login.html", res)
    } else {
        readAndServe("./htmlfiles/medicine.html", res)
    }
});

app.get('/dashboard', function(req, res) {
    // if the user is not logged in, redirect to login page
    if(req.session.loggedIn !== true) {
        readAndServe("./htmlfiles/login.html", res)
    } else {
        readAndServe("./htmlfiles/dashboard.html", res)
    }
});

app.get('/search', function(req, res) {
    // if the user is not logged in, redirect to login page
    if(req.session.loggedIn !== true) {
        readAndServe("./htmlfiles/login.html", res)
    } else {
        readAndServe("./htmlfiles/search.html", res)
    }
});
/**************************************************************/

//gets for fetching data from the database and returning it as json
// in order to populate the tables within each respective html file
app.get('/appointments', async(req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM appointments JOIN patients ON appointments.patient_id = patients.patient_id JOIN doctors ON appointments.doctor_id = doctors.doctor_id');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/patients', async(req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM patients');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching patients:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/doctors', async(req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM doctors');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/medicines', async(req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM medicines');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching medicines:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

//all the post requests for the various html files
// login route to serve dashboard.html upon form submission
app.post('/login', function(req, res) {
    var emails = req.body.email;
    var password = req.body.password;

    // password should be license_number
    const loginquery = 'SELECT * FROM doctors WHERE email = ? AND license_number = ?';

    // if the user is already logged in, redirect to dashboard. 
    if(req.session.loggedIn) {
        return readAndServe("./htmlfiles/dashboard.html", res);
    }

    // if the user is not already logged in, proceed with login
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
                
                //set session variable to indicate user has logged in
                req.session.loggedIn = true;
                req.session.userEmail = emails;
                req.session.userPass = password;
                //this is to show that cookies are saved. In a real program this would be absent for security
                console.log(req.session);
                console.log(req.sessionID);
                
                //redirect to dashboard upon successful login
                readAndServe("./htmlfiles/dashboard.html", res);
            } else {
                //show error if login fails
                console.log("Login failed");

                readAndServe("./htmlfiles/login.html", res);

                //reset the values of emails and password
                emails = '';
                password = '';
            }

        }
        
    } catch (error) {
        // if there are any errors during the process, log them to the console 
        console.error('Error executing login query:', error);

    }
    
});
/**************************************************************/

// all the posts for appointements.html
app.post('/add_appointment', async(req, res) => {
    // get the values from the form submission and put them into quaries
    const { patient_id, doctor_id, appointment_date, appointment_time,reason_for_visit } = req.body;
    const insertQuery = 'INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, reason_for_visit, status) VALUES (?, ?, ?, ?, ?, "Scheduled")';
    const params = [patient_id, doctor_id, appointment_date, appointment_time,reason_for_visit];
    
    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to add an appointment.');
    }

    // try to execute the query and catch any errors
    try {
        await pool.execute(insertQuery, params);
        // log success message and redirect to appointments page
        console.log("Appointment added successfully for patient ID:", patient_id);
        res.redirect('/appointment');

    } catch (error) {
        // log error message and send 500 status code
        console.error('Error adding appointment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_appointment', async(req, res) => {
    // get form values and prepare a delete query
    const {patient_id, appointment_date} = req.body;
    const deleteQuery = 'DELETE FROM appointments WHERE patient_id = ? AND appointment_date = ?';
    const param = [patient_id, appointment_date];   
    
    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to delete an appointment.');
    }

    // try to execute the delete query and catch any errors
    try {
        // execute the delete query with provided parameters
        await pool.execute(deleteQuery, param);
        console.log("Appointment deleted successfully for patient ID:", patient_id, " on date:", appointment_date);
        res.redirect('/appointment');
    } catch (error) {   
        // log error message and send 500 status code
        console.error('Error deleting appointment:', error);
        res.status(500).send('Internal Server Error');
    }

});

app.post('/update_appointment_status', async(req, res) => {
    // get form values and prepare an update query
    const { appointment_id, status } = req.body;
    const updateQuery = 'UPDATE appointments SET status = ? WHERE appointment_id = ?';
    const params = [status, appointment_id];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to update appointment status.');
    }

    // try to execute the update query and catch any errors
    try {
        // execute the update query with provided parameters
        await pool.execute(updateQuery, params);
        console.log("Appointment status updated successfully for appointment id", appointment_id);
        res.redirect('/appointment');
    } catch (error) {
        // log error message and send 500 status code
        console.error('Error updating appointment status:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

// all posts for medicine.html 
app.post('/add_medicine', async(req, res) => {
    // get form values and prepare an insert query
    const { medicine_name, generic_name,manufacturer, dosage_type, strength, needs_prescription, instructions, side_effects, currently_used} = req.body;
    const insertQuery = 'INSERT INTO medicines (medicine_name, generic_name, manufacturer, dosage_type, strength, needs_prescription, instructions, side_effects, currently_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [medicine_name, generic_name, manufacturer, dosage_type, strength, needs_prescription, instructions, side_effects, currently_used];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to add medicine.');
    }

    // try to execute the insert query and catch any errors
    try {
        // execute the insert query with provided parameters
        await pool.execute(insertQuery, params);
        console.log("Medicine added successfully:", medicine_name);
        res.redirect('/medicine');
    } catch (error) {
        // log error message and send 500 status code
        console.error('Error adding medicine:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_medicine', async(req, res) => {
    // get form values and prepare a delete query
    const { medicine_id } = req.body;
    const deleteQuery = 'DELETE FROM medicines WHERE medicine_id = ?';
    const param = [medicine_id];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to delete medicine.');
    }

    // try to execute the delete query and catch any errors
    try {
        // execute the delete query with provided parameters
        await pool.execute(deleteQuery, param);
        console.log("Medicine deleted successfully with ID:", medicine_id);
        res.redirect('/medicine');
    } catch (error) {
        //  log error message and send 500 status code
        console.error('Error deleting medicine:', error);
        res.status(500).send('Internal Server Error');
    }
});

/**************************************************************/

// all posts for patients
app.post('/add_patient', async(req, res) => {
    // get form values and prepare an insert query
    const { first_name, last_name, date_of_birth, gender, phone_number, email, address, state, city, zip_code, insurance_provider, current_patient} = req.body;
    const insertQuery = 'INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone_number, email, address, state, city, zip_code, insurance_provider, current_patient) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [first_name, last_name, date_of_birth, gender, phone_number, email, address, state, city, zip_code, insurance_provider, current_patient];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to add patient.');
    }

    // try to execute the insert query and catch any errors
    try {
        // execute the insert query with provided parameters
        await pool.execute(insertQuery, params);
        console.log("Patient added successfully:", first_name, last_name);
        res.redirect('/patient');
    } catch (error) {
        // log error message and send 500 status code
        console.error('Error adding patient:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_patient', async(req, res) => {
    // get form values and prepare a delete query
    const { patient_id } = req.body;
    const deleteQuery = 'DELETE FROM patients WHERE patient_id = ?';
    const param = [patient_id];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to delete patient.');
    }

    // try to execute the delete query and catch any errors
    try {
        // execute the delete query with provided parameters
        await pool.execute(deleteQuery, param);
        console.log("Patient deleted successfully with ID:", patient_id);
        res.redirect('/patient');
    } catch (error) {
        // log error message and send 500 status code
        console.error('Error deleting patient:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

app.post('/add_doctor', async(req, res) => {
    //  get form values and prepare an insert query
    const { first_name, last_name, specialty, department, license_number, phone_number, email, office_number, current_doctor} = req.body;
    const insertQuery = 'INSERT INTO doctors (first_name, last_name, specialty, department, license_number, phone_number, email, office_number, current_doctor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [first_name, last_name, specialty, department, license_number, phone_number, email, office_number, current_doctor];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to add doctor.');
    }
    // try to execute the insert query and catch any errors
    try {
        // execute the insert query with provided parameters
        await pool.execute(insertQuery, params);
        console.log("Doctor added successfully:", first_name, last_name);
        res.redirect('/doctor');
    } catch (error) {
        // log error message and send 500 status code
        console.error('Error adding doctor:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_doctor', async(req, res) => {
    // get form values and prepare a delete query
    const { doctor_id } = req.body;
    const deleteQuery = 'DELETE FROM doctors WHERE doctor_id = ?';
    const param = [doctor_id];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to delete doctor.');
    }
    // try to execute the delete query and catch any errors
    try {
        // execute the delete query with provided parameters
        await pool.execute(deleteQuery, param);
        console.log("Doctor deleted successfully with ID:", doctor_id);
        res.redirect('/doctor');
    } catch (error) {
        // log error message and send 500 status code
        console.error('Error deleting doctor:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

// post for search.html
app.post('/search_records', async(req, res) => {
    // get form values and prepare a search query
    const { table_name, search_column, search_value } = req.body;
    const searchQuery = 'SELECT * FROM ?? WHERE ?? = ?';
    const params = [table_name, search_column, search_value];

    //if user is not logged in, return unauthorized status
    if(req.session.loggedIn !== true) {
        return res.status(401).send('Unauthorized: Please log in to search records.');
    }
    
    // try to execute the search query and catch any errors
    try {
        // use the pool to query the database regarding specific things
        const [rows] = await pool.query(searchQuery, params);
        console.log(`Search results from table ${table_name} where ${search_column} = ${search_value}:`, rows);

        let htmlResponse = `<html><body><a href="http://localhost:3000/dashboard">Back to Dashboard</a> <a href="http://localhost:3000/search">back to search</a><br><h1>Search Results</h1><table border="1"><tr>`;
        // Table headers
        if (rows.length > 0) {
            for (let column in rows[0]) {
                htmlResponse += `<th>${column}</th>`;
            } 
            htmlResponse += `</tr>`;
            // Table rows
            rows.forEach(row => {
                htmlResponse += `<tr>`;
                for (let column in row) {
                    htmlResponse += `<td>${row[column]}</td>`;
                }
                htmlResponse += `</tr>`;
            });
            htmlResponse += `</table></body></html>`;
            res.send(htmlResponse);
        } else {
            res.send("<html><body><h1>No records found.</h1></body></html>");
        }
    } catch (error) {
        //  log error message and send 500 status code
        console.error('Error searching tables:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Displays current port and how to access the application
app.listen(port, function() {
    console.log(`Current Port: ${port}! Access the application at http://localhost:${port}/` );
});
