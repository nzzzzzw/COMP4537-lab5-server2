const mysql = require("mysql2");

class Database {
    constructor() {
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
                console.error("❌ Database Connection Error:", err);
                setTimeout(() => this.connect(), 5000); 
            } else {
                console.log("✅ Connected to MySQL Database.");
                this.createTable();
            }
        });

        this.connection.on("error", err => {
            console.error("⚠️ Database error:", err);
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect(); 
            }
        });
    }

    createTable() {
        const sql = `
        CREATE TABLE IF NOT EXISTS patient (
            patientid INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            dateOfBirth DATETIME NOT NULL
        );`;
        this.connection.query(sql, err => {
            if (err) {
                console.error("❌ Error creating patient table:", err);
            } else {
                console.log("✅ Patient table is ready.");
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