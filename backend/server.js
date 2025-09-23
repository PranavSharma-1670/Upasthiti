// backend/server.js
import express from "express";
import cors from "cors";
import { pool , testConnection} from "./db.js";

const app = express();
const PORT = 5050;

app.use(cors());
app.use(express.json());

app.get("/api/test", async (req, res) => {
  const isConnected = await testConnection();
  if (isConnected) {
    res.json({ success: true, message: "PostgreSQL is connected" });
  } else {
    res.status(500).json({ success: false, message: "PostgreSQL connection failed" });
  }
});

// GET all events/notices
app.get("/api/events", async (req, res) => {
    try {
      const result = await pool.query(
        "SELECT event_id, event_date, title, description, type, created_at, updated_at FROM events_notices ORDER BY event_date ASC"
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Fetch error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });
  
// POST a new event/notice
app.post("/api/events", async (req, res) => {
    const { title, description, date, type } = req.body;
  
    if (!title || !date || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
  
    try {
      const result = await pool.query(
        `INSERT INTO events_notices (title, description, event_date, type)
         VALUES ($1, $2, $3, $4)
         RETURNING event_id, title, description, event_date, type, created_at, updated_at`,
        [title, description, date, type]
      );
  
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Insert error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });
  
  

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});






// Test connection

// import express from "express";
// import cors from "cors";

// const app = express();
// const PORT = 5050;

// app.use(cors());
// app.use(express.json());

// // Test route
// app.get("/api/test", (req, res) => {
//     res.json({ success: true, time: new Date().toISOString() });
//   });
  
//   app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
//   });
