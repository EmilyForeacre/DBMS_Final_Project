//Paul Anderson, 
//Course Title: Data Base Systems Management
//Submission Date: 
//Assignment: Final Project, Backend Code

// to view http://localhost:3000/
const express = require('express');
const app = express();
const port = 3000;
const path = require('path');



app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './htmlfiles/login.html'));
});

app.listen(port, function() {
    console.log(`Example app listening on port ${port}!`);
});
