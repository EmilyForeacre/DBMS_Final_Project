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
        maxAge: 60000 * 1 // Session expires after 30 seconds of inactivity
    }
})); 

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

    if(req.session.loggedIn) {
        return readAndServe("./htmlfiles/dashboard.html", res);
    } else {
        readAndServe("./htmlfiles/login.html", res);
    }
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

app.get('/dashboard', function(req, res) {
    readAndServe("./htmlfiles/dashboard.html", res)
});

app.get('/search', function(req, res) {
    readAndServe("./htmlfiles/search.html", res)
});
/**************************************************************/

//gets for fetching data from the database and returning it as json
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

    if(req.session.loggedIn) {
        return readAndServe("./htmlfiles/dashboard.html", res);
    }

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
                console.log(req.session);
                console.log(req.sessionID);
                
                res.sendFile(path.join(__dirname, './htmlfiles/dashboard.html'));
            } else {
                //show error if login fails
                res.status(401).send({msg: 'Login failed: Invalid email or password.'});
                
                //reset the values of emails and password
                emails = '';
                password = '';
            }

        }
        
    } catch (error) {
        console.error('Error executing login query:', error);

    }
    
});
/**************************************************************/

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

    try {
        await pool.execute(deleteQuery, param);
        console.log("Appointment deleted successfully for patient ID:", patient_id, " on date:", appointment_date);
        res.redirect('/appointment');
    } catch (error) {   
        console.error('Error deleting appointment:', error);
        res.status(500).send('Internal Server Error');
    }

});
/**************************************************************/

// all posts for medicine.html 
app.post('/add_medicine', async(req, res) => {
    const { medicine_name, generic_name,manufacturer, dosage_type, strength, needs_prescription, instructions, side_effects, currently_used} = req.body;
    const insertQuery = 'INSERT INTO medicines (medicine_name, generic_name, manufacturer, dosage_type, strength, needs_prescription, instructions, side_effects, currently_used) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [medicine_name, generic_name, manufacturer, dosage_type, strength, needs_prescription, instructions, side_effects, currently_used];

    try {
        await pool.execute(insertQuery, params);
        console.log("Medicine added successfully:", medicine_name);
        res.redirect('/medicine');
    } catch (error) {
        console.error('Error adding medicine:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_medicine', async(req, res) => {
    const { medicine_id } = req.body;
    const deleteQuery = 'DELETE FROM medicines WHERE medicine_id = ?';
    const param = [medicine_id];

    try {
        await pool.execute(deleteQuery, param);
        console.log("Medicine deleted successfully with ID:", medicine_id);
        res.redirect('/medicine');
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

// all posts for patients
app.post('/add_patient', async(req, res) => {
    const { first_name, last_name, date_of_birth, gender, phone_number, email, address, state, city, zip_code, insurance_provider, current_patient} = req.body;
    const insertQuery = 'INSERT INTO patients (first_name, last_name, date_of_birth, gender, phone_number, email, address, state, city, zip_code, insurance_provider, current_patient) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [first_name, last_name, date_of_birth, gender, phone_number, email, address, state, city, zip_code, insurance_provider, current_patient];

    try {
        await pool.execute(insertQuery, params);
        console.log("Patient added successfully:", first_name, last_name);
        res.redirect('/patient');
    } catch (error) {
        console.error('Error adding patient:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_patient', async(req, res) => {
    const { patient_id } = req.body;
    const deleteQuery = 'DELETE FROM patients WHERE patient_id = ?';
    const param = [patient_id];

    try {
        await pool.execute(deleteQuery, param);
        console.log("Patient deleted successfully with ID:", patient_id);
        res.redirect('/patient');
    } catch (error) {
        console.error('Error deleting patient:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

app.post('/add_doctor', async(req, res) => {
    const { first_name, last_name, specialty, department, license_number, phone_number, email, office_number, current_doctor} = req.body;
    const insertQuery = 'INSERT INTO doctors (first_name, last_name, specialty, department, license_number, phone_number, email, office_number, current_doctor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const params = [first_name, last_name, specialty, department, license_number, phone_number, email, office_number, current_doctor];

    try {
        await pool.execute(insertQuery, params);
        console.log("Doctor added successfully:", first_name, last_name);
        res.redirect('/doctor');
    } catch (error) {
        console.error('Error adding doctor:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete_doctor', async(req, res) => {
    const { doctor_id } = req.body;
    const deleteQuery = 'DELETE FROM doctors WHERE doctor_id = ?';
    const param = [doctor_id];

    try {
        await pool.execute(deleteQuery, param);
        console.log("Doctor deleted successfully with ID:", doctor_id);
        res.redirect('/doctor');
    } catch (error) {
        console.error('Error deleting doctor:', error);
        res.status(500).send('Internal Server Error');
    }
});
/**************************************************************/

// post for search.html
app.post('/search_records', async(req, res) => {
    const { table_name, search_column, search_value } = req.body;
    const searchQuery = 'SELECT * FROM ?? WHERE ?? = ?';
    const params = [table_name, search_column, search_value];
    
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
        console.error('Error searching tables:', error);
        res.status(500).send('Internal Server Error');
    }
});



// Displays current port and how to access the application
app.listen(port, function() {
    console.log(`Current Port: ${port}! Access the application at http://localhost:${port}/` );
});
