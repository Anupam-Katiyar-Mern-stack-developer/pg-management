
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import pool from "./config/db";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
    try {
        await pool.query("SELECT NOW()");

        console.log("✅ PostgreSQL Connected Successfully!");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Database connection failed:", error);
        await pool.end();
        process.exit(1);
    }
};

startServer();
