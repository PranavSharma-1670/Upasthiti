// testSelect.js
import pool from "./testdb.js";

const getEvents = async () => {
  try {
    const res = await pool.query("SELECT * FROM events_and_notices ORDER BY id DESC LIMIT 5");
    console.log("✅ Latest rows:");
    console.table(res.rows);
  } catch (err) {
    console.error("❌ Select error:", err.message);
  } finally {
    await pool.end();
  }
};

getEvents();
