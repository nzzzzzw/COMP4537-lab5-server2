const mysql = require("mysql2");

class Database {
    constructor() {
        this.initCreatorConnection();
    }

    // using creator_user check and create table
    initCreatorConnection() {
        const creatorConnection = mysql.createConnection({
            host: "64.23.247.155",
            user: "creator_user",  
            password: "",  
            database: "lab5db",
            port: 3306
        });

        creatorConnection.connect(err => {
            if (err) {
                console.error("❌ Creator User Database Connection Error:", err);
                return;
            }
            console.log("✅ Connected as creator_user.");
            this.createTable(creatorConnection);
        });
    }

    createTable(connection) {
        const sql = `
        CREATE TABLE IF NOT EXISTS patient (
            patientid INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            dateOfBirth DATETIME NOT NULL
        );`;
        connection.query(sql, err => {
            if (err) {
                console.error("❌ Error creating patient table:", err);
            } else {
                console.log("✅ Patient table is ready.");
            }
            connection.end(); 
            this.initLab5UserConnection(); // to use lab5user connection
        });
    }

    // using lab5user conncection to execute queries
    initLab5UserConnection() {
        this.connection = mysql.createConnection({
            host: "64.23.247.155",
            user: "lab5user",
            password: "",  
            database: "lab5db",
            port: 3306
        });

        this.connection.connect(err => {
            if (err) {
                console.error("❌ lab5user Database Connection Error:", err);
                setTimeout(() => this.initLab5UserConnection(), 5000); 
            } else {
                console.log("✅ Connected to MySQL as lab5user.");
            }
        });

        this.connection.on("error", err => {
            console.error("⚠️ Database error:", err);
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.initLab5UserConnection(); 
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
    }
}

module.exports = new Database();