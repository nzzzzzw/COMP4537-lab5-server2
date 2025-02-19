/**
 * DISCLAIMER: 
 * This code was developed with the assistance of ChatGPT 
 * for guidance and improvements.
 */
const http = require("http");
const url = require("url");
const Database = require("./db");

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
                res.end(JSON.stringify({ error: "❌ Method not allowed." }));
            }
        });

        server.listen(this.port, () => {
            console.log(`✅ Server running on port ${this.port}`);
        });
    }

    handleGetRequest(req, res) {
        const queryObject = url.parse(req.url, true).query;
        const sqlQuery = queryObject.query;

        if (!sqlQuery) {
            res.writeHead(400);
            return res.end(JSON.stringify({ error: "❌ No query provided." }));
        }

        if (sqlQuery.toUpperCase().startsWith("SELECT")) {
            Database.executeQuery(sqlQuery, (err, results) => {
                if (err) {
                    console.error("❌ Database Query Error:", err);
                    res.writeHead(500);
                    return res.end(JSON.stringify({ error: "❌ SELECT query failed." }));
                }
                res.end(JSON.stringify({ success: "✅ Query executed successfully.", data: results }));
            });
        } else {
            res.writeHead(403);
            return res.end(JSON.stringify({ error: "❌ Forbidden query type." }));
        }
    }

    async handlePostRequest(req, res) {
        let body = "";
        req.on("data", chunk => { body += chunk; });
        req.on("end", async () => {
            try {
                const data = JSON.parse(body);
                let sqlQuery = data.query;

                if (!sqlQuery || !sqlQuery.toUpperCase().startsWith("INSERT")) {
                    res.writeHead(403);
                    return res.end(JSON.stringify({ error: "❌ Forbidden query." }));
                }

                // **确保表存在**
                await Database.checkAndCreateTable();

                // **保留普通 INSERT INTO，保证每次点击都会插入**
                Database.executeQuery(sqlQuery, (err, results) => {
                    if (err) {
                        console.error("❌ Database Query Error:", err);
                        res.writeHead(500);
                        return res.end(JSON.stringify({ error: "❌ INSERT failed." }));
                    }
                    res.end(JSON.stringify({ success: "✅ Data inserted successfully." }));
                });

            } catch (error) {
                console.error("❌ JSON Parsing Error:", error);
                res.writeHead(400);
                res.end(JSON.stringify({ error: "❌ Invalid JSON format." }));
            }
        });
    }
}

new Server();