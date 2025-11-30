# DBMS_Final_Project

## What is this project?
This project aims to emulate what a doctors office portal.

## Running this project
There are a couple of mandatory steps to get this project running. 

First, import all of the .csv files into the appropriate mySQL schema. 

Second, edit the following code in mysqlConnection.js to the appropriate password and schema
```javascript
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "xxxxxxxxx", // !! CHANGE THIS TO YOUR ACTUAL PASSWORD !!
    database: "finalproject", // !! CHANGE THIS TO YOUR ACTUAL DATABASE NAME !!
    // Connection Pool settings are optional but good practice
    waitForConnections: true, 
    connectionLimit: 10,
    queueLimit: 0
};
```

Third, get the project started simply run the following command in a command prompt open to the project location 
```
node thebackend.js
```

The code will return the web address used for ease of access when the program is initially started up 

# What we need to do
Making a doctor's office website. This is the doctors portal.

Tables
- Doctors table 
- Patiences table
- medicine table
- appointments table

Backend
- Read inputs
- scrub inputs 
- get information requested. 

frontend
- html 
- making the website look good

# What each group member is doing
Cooper
- Completing tables

Emily
- html & front end

Paul
- backend 