/**
 * DISCLAIMER: 
 * This code was developed with the assistance of ChatGPT 
 * for guidance and improvements.
 */
const mysql = require("mysql2");
const messages = require("./lang/en/en");

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
                console.error(messages.errors.dbConnectionError, err);
                process.exit(1);
            }
            console.log(messages.info.dbConnected);
        });
    }

    executeQuery(sql, callback) {
        const forbiddenCommands = ["UPDATE", "DELETE", "DROP"];
        if (forbiddenCommands.some(cmd => sql.toUpperCase().includes(cmd))) {
            return callback(new Error(messages.errors.forbiddenQuery), null);
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