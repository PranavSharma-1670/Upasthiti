// testConnection.js
import pool from "./testdb.js";

const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL:", res.rows[0]);
  } catch (err) {
    console.error("❌ Connection error:", err.message);
  } finally {
    await pool.end();
  }
};

testConnection();
