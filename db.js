/**
 * DISCLAIMER: 
 * This code was developed with the assistance of ChatGPT 
 * for guidance and improvements.
 */
const mysql = require("mysql2");

class Database {
    constructor() {
        this.creatorConnection = mysql.createConnection({
            host: "64.23.247.155",
            user: "creator_user",  
            password: "",
            database: "lab5db",
            port: 3306,
            multipleStatements: true
        });

        this.connection = mysql.createConnection({
            host: "64.23.247.155",
            user: "lab5user",  
            password: "",
            database: "lab5db",
            port: 3306,
            multipleStatements: true
        });

        this.connect();
    }

    connect() {
        this.connection.connect(err => {
            if (err) {
                console.error("Database Connection Error:", err);
                setTimeout(() => this.connect(), 5000);
            } else {
                console.log("Connected to MySQL as `lab5user`.");
            }
        });

        this.creatorConnection.connect(err => {
            if (err) {
                console.error("Creator User Connection Error:", err);
            } else {
                console.log("Connected to MySQL as `creator_user`.");
            }
        });

        this.connection.on("error", err => {
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect();
            }
        });
    }

    checkAndCreateTable(callback) {
        const checkTableQuery = `SHOW TABLES LIKE 'patient';`;

        this.creatorConnection.query(checkTableQuery, (err, results) => {
            if (err) {
                console.error("Error checking table existence:", err);
                return callback(err);
            }

            if (results.length === 0) {
                console.log("⚠️ Patient table does not exist. Creating...");

                const createTableQuery = `
                    CREATE TABLE patient (
                        patientid INT AUTO_INCREMENT PRIMARY KEY,
                        name VARCHAR(100) NOT NULL UNIQUE,
                        dateOfBirth DATETIME NOT NULL
                    );
                `;

                this.creatorConnection.query(createTableQuery, err => {
                    if (err) {
                        console.error("Error creating patient table:", err);
                        return callback(err);
                    }
                    console.log("Patient table created successfully.");
                    callback(null);
                });
            } else {
                callback(null);
            }
        });
    }

    executeQuery(sql, callback) {
        const forbiddenCommands = ["UPDATE", "DELETE", "DROP"];
        if (forbiddenCommands.some(cmd => sql.toUpperCase().includes(cmd))) {
            return callback(new Error("Forbidden query! UPDATE, DELETE, DROP are not allowed."), null);
        }

        this.connection.query(sql, (err, results) => {
            callback(err, results);
        });
    }

    closeConnection() {
        this.connection.end(err => {
            if (err) console.error("Error closing database connection:", err);
        });
        this.creatorConnection.end(err => {
            if (err) console.error("Error closing creator database connection:", err);
        });
    }
}

module.exports = new Database();