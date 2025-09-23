// testInsert.js
import pool from "./testdb.js";

const insertEvent = async () => {
  try {
    const query = `
      INSERT INTO events_and_notices (type, title, description, date, issuedBy)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      "Event",
      "Test Event",
      "This is a test event inserted from Node.js",
      "2025-09-23",
      "System"
    ];

    const res = await pool.query(query, values);
    console.log("✅ Inserted row:", res.rows[0]);
  } catch (err) {
    console.error("❌ Insert error:", err.message);
  } finally {
    await pool.end();
  }
};

insertEvent();
