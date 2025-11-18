//Paul Anderson, 
//Course Title: Data Base Systems Management
//Submission Date: 
//Assignment: Final Project, Backend Code

// to view http://localhost:3000/
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');


// Serve static files from the 'htmlfiles' directory
// specifically serves the login.html file when accessing the root URL
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './htmlfiles/login.html'));
});



// Displays current port
app.listen(port, function() {
    console.log(`Current Port: ${port}! Access the application at http://localhost:${port}/` );
});
