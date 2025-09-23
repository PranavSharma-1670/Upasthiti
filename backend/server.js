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

app.get("/api/events", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM events_and_notices ORDER BY date ASC");
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: "Server error" });
    }
  });

app.post("/api/events", async (req, res) => {
    const { title, description, date, type, issued_by } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO events_and_notices (title, description, date, type, issued_by) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [title, description, date, type, issued_by]
      );
      res.json(result.rows[0]);
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
