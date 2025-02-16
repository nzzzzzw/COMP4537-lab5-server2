const messages = {
    errors: {
        invalidQuery: "Invalid query. Only SELECT and INSERT statements are allowed.",
        dbConnectionError: "Database connection failed.",
        insertError: "Error inserting data into the database.",
        selectError: "Error fetching data from the database.",
        forbiddenQuery: "Forbidden query! UPDATE, DELETE, DROP, and ALTER are not allowed."
    },
    success: {
        insertSuccess: "Data successfully inserted into the database.",
        querySuccess: "Query executed successfully."
    },
    info: {
        serverRunning: "Server is running on port",
        dbConnected: "Database connected successfully."
    }
};

module.exports = messages;