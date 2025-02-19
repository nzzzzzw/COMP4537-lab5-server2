/**
 * DISCLAIMER: 
 * This code was developed with the assistance of ChatGPT 
 * for guidance and improvements.
 */
const mysql = require("mysql2");
const messages = require("./lang/en/en");


class Database {
    constructor() {
        this.userConnection = mysql.createConnection({
            host: "64.23.247.155",
            user: "lab5user",
            password: "",
            database: "lab5db",
            port: 3306
        });

        this.creatorConnection = mysql.createConnection({
            host: "64.23.247.155",
            user: "creator_user",
            password: "",
            database: "lab5db",
            port: 3306
        });

        this.connect();
    }

    connect() {
        this.userConnection.connect(err => {
            if (err) {
                console.error(messages.errors.dbConnectionError, err);
                setTimeout(() => this.connect(), 5000);
            } else {
                console.log(`${messages.info.dbConnected} (lab5user)`);
            }
        });

        this.creatorConnection.connect(err => {
            if (err) {
                console.error(messages.errors.dbConnectionError, err);
            } else {
                console.log(` ${messages.info.dbConnected} (creator_user)`);
            }
        });

        this.userConnection.on("error", err => {
            if (err.code === "PROTOCOL_CONNECTION_LOST") {
                this.connect();
            }
        });
    }

    async checkAndCreateTable() {
        return new Promise((resolve, reject) => {
            const checkTableQuery = `SELECT COUNT(*) AS tableExists FROM information_schema.tables WHERE table_schema = 'lab5db' AND table_name = 'patient';`;

            this.creatorConnection.query(checkTableQuery, (err, results) => {
                if (err) {
                    console.error(messages.errors.dbConnectionError, err);
                    return reject(err);
                }

                if (results[0].tableExists === 0) {
                    console.log("Patient table does not exist. Creating...");

                    const createTableQuery = `
                        CREATE TABLE patient (
                            patientid INT AUTO_INCREMENT PRIMARY KEY,
                            name VARCHAR(100) NOT NULL,
                            dateOfBirth DATETIME NOT NULL
                        );
                    `;

                    this.creatorConnection.query(createTableQuery, err => {
                        if (err) {
                            console.error(messages.errors.dbConnectionError, err);
                            return reject(err);
                        }
                        console.log("Patient table created successfully.");
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    }

    executeQuery(sql, callback) {
        const forbiddenCommands = ["UPDATE", "DELETE", "DROP"];
        if (forbiddenCommands.some(cmd => sql.toUpperCase().includes(cmd))) {
            return callback(new Error(messages.errors.forbiddenQuery), null);
        }

        this.userConnection.query(sql, (err, results) => {
            callback(err, results);
        });
    }

    closeConnection() {
        this.userConnection.end(err => {
            if (err) console.error("Error closing database connection:", err);
        });
        this.creatorConnection.end(err => {
            if (err) console.error("Error closing creator database connection:", err);
        });
    }
}

module.exports = new Database();