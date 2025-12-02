# DBMS_Final_Project

## What is this project?
This project aims to emulate what a doctors office portal. A doctor would theoretically use a portal similar to this to edit appointments, manage patients, and manage medicines.

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

## The EER Database Diagram
![EER Diagram](https://github.com/EmilyForeacre/DBMS_Final_Project/blob/main/EER.png)

## What each group member is doing
Cooper
- tables
- html
- input validation

Emily
- html
- css styling
- html search

Paul
- backend 
- readme
- session information