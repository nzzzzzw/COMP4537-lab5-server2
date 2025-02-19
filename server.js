/**
 * DISCLAIMER: 
 * This code was developed with the assistance of ChatGPT 
 * for guidance and improvements.
 */
const http = require("http");
const url = require("url");
const Database = require("./db");
const messages = require("./lang/en/en");

class Server {
    constructor() {
        this.port = process.env.PORT || 8080;
        this.createServer();
    }

    createServer() {
        const server = http.createServer((req, res) => {
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
            res.setHeader("Access-Control-Allow-Headers", "Content-Type");

            if (req.method === "OPTIONS") {
                res.writeHead(204);
                return res.end();
            }

            res.setHeader("Content-Type", "application/json");

            if (req.method === "GET") {
                this.handleGetRequest(req, res);
            } else if (req.method === "POST") {
                this.handlePostRequest(req, res);
            } else {
                res.writeHead(405);
                res.end(JSON.stringify({ error: "Method not allowed." }));
            }
        });

        server.on("error", (err) => {
            if (err.code === "EADDRINUSE") {
                console.error(`❌ ERROR: Port ${this.port} is already in use!`);
                process.exit(1);
            } else {
                console.error(`❌ Server Error: ${err.message}`);
            }
        });

        server.listen(this.port, () => {
            console.log(`✅ ${messages.info.serverRunning} ${this.port}`);
        });
    }

    handleGetRequest(req, res) {
        const queryObject = url.parse(req.url, true).query;
        const sqlQuery = queryObject.query;

        if (!sqlQuery) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "No query provided." }));
        }

        if (sqlQuery.toUpperCase().startsWith("SELECT")) {
            Database.executeQuery(sqlQuery, (err, results) => {
                if (err) {
                    console.error("❌ Database Query Error:", err);
                    res.writeHead(500);
                    return res.end(JSON.stringify({ error: messages.errors.selectError }));
                }
                res.end(JSON.stringify({ success: messages.success.querySuccess, data: results }));
            });
        } else {
            res.writeHead(403);
            return res.end(JSON.stringify({ error: messages.errors.forbiddenQuery }));
        }
    }

    handlePostRequest(req, res) {
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", () => {
            try {
                const data = JSON.parse(body);
                const sqlQuery = data.query;

                if (!sqlQuery || !sqlQuery.toUpperCase().startsWith("INSERT")) {
                    res.writeHead(403);
                    return res.end(JSON.stringify({ error: messages.errors.forbiddenQuery }));
                }

                // 🔹 确保 `patient` 表存在后再执行插入操作
                Database.checkAndCreateTable((err) => {
                    if (err) {
                        res.writeHead(500);
                        return res.end(JSON.stringify({ error: "Error ensuring table exists." }));
                    }

                    Database.executeQuery(sqlQuery, (err, results) => {
                        if (err) {
                            console.error("❌ Database Query Error:", err);
                            res.writeHead(500);
                            return res.end(JSON.stringify({ error: messages.errors.insertError }));
                        }
                        res.end(JSON.stringify({ success: messages.success.insertSuccess }));
                    });
                });

            } catch (error) {
                console.error("❌ JSON Parsing Error:", error);
                res.writeHead(400);
                res.end(JSON.stringify({ error: messages.errors.invalidQuery }));
            }
        });
    }
}

new Server();