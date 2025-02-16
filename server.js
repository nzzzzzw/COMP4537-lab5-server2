const http = require("http");
const url = require("url");
const Database = require("./db");
const messages = require("./lang/en/en");

class Server {
    constructor(port) {
        this.port = process.env.PORT || port;
        this.createServer();
    }

    createServer() {
        const server = http.createServer((req, res) => {
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

        server.listen(this.port, () => {
            console.log(`${messages.info.serverRunning} ${this.port}`);
        });
    }

    handleGetRequest(req, res) {
        const queryObject = url.parse(req.url, true).query;
        const sqlQuery = queryObject.query;

        if (!sqlQuery || !sqlQuery.toUpperCase().startsWith("SELECT")) {
            res.writeHead(403);
            return res.end(JSON.stringify({ error: messages.errors.forbiddenQuery }));
        }

        Database.executeQuery(sqlQuery, (err, results) => {
            if (err) {
                console.error("Database Query Error:", err);
                res.writeHead(500);
                return res.end(JSON.stringify({ error: messages.errors.selectError }));
            }
            res.end(JSON.stringify({ success: messages.success.querySuccess, data: results }));
        });
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

                Database.executeQuery(sqlQuery, (err, results) => {
                    if (err) {
                        res.writeHead(500);
                        return res.end(JSON.stringify({ error: messages.errors.insertError }));
                    }
                    res.end(JSON.stringify({ success: messages.success.insertSuccess }));
                });
            } catch (error) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: messages.errors.invalidQuery }));
            }
        });
    }
}

const port = process.env.PORT || 3000;
new Server(port);