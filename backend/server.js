import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import testRoutes from "./routes/testConnection.js";
import eventsRoutes from "./routes/events.js";
import studentsRoutes from "./routes/students.js";
import teacherRoutes from "./routes/teachers.js";
import classRecordRoutes from "./routes/classRecords.js";
import attendanceRoutes from "./routes/attendance.js";

const app = express();
app.use(cors());
// app.use(express.json());
app.use(bodyParser.json());

// Root check
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// mount routes
app.use("/api/test", testRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/records", classRecordRoutes);
app.use("/api/attendance", attendanceRoutes);


app.listen(5050, () => {
  console.log("Server running on http://localhost:5050");
});







// import express from "express";
// import cors from "cors";
// import pool from "./db.js";
// import { testConnection } from "./routes/testConnection.js";

// const app = express();
// app.use(cors());
// app.use(express.json());

// // test route
// app.get("/api/test", async (req, res) => {
//   try {
//     const isConnected = await testConnection();
//     if (isConnected) {
//       res.json({ success: true, message: "PostgreSQL is connected" });
//     } else {
//       res.status(500).json({ success: false, message: "PostgreSQL connection failed" });
//     }
//   } catch (err) {
//     console.error("Error in /api/test:", err.message);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// });

// // GET all events/notices
// app.get("/api/events", async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT event_id, event_date, title, description, type, created_at, updated_at FROM events_notices ORDER BY event_date ASC"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Fetch error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// app.listen(5050, () => {
//   console.log("Server running on http://localhost:5050");
// });




// // // backend/server.js
// // import express from "express";
// // import cors from "cors";
// // import { pool , testConnection} from "./db.js";

// // const app = express();
// // const PORT = 5050;

// // app.use(cors());
// // app.use(express.json());

// // app.get("/api/test", async (req, res) => {
// //   const isConnected = await testConnection();
// //   if (isConnected) {
// //     res.json({ success: true, message: "PostgreSQL is connected" });
// //   } else {
// //     res.status(500).json({ success: false, message: "PostgreSQL connection failed" });
// //   }
// // });


  
// // // POST a new event/notice
// // app.post("/api/events", async (req, res) => {
// //     const { title, description, date, type } = req.body;
  
// //     if (!title || !date || !type) {
// //       return res.status(400).json({ error: "Missing required fields" });
// //     }
  
// //     try {
// //       const result = await pool.query(
// //         `INSERT INTO events_notices (title, description, event_date, type)
// //          VALUES ($1, $2, $3, $4)
// //          RETURNING event_id, title, description, event_date, type, created_at, updated_at`,
// //         [title, description, date, type]
// //       );
  
// //       res.status(201).json(result.rows[0]);
// //     } catch (err) {
// //       console.error("Insert error:", err.message);
// //       res.status(500).json({ error: "Server error" });
// //     }
// //   });
  
  

// // app.listen(PORT, () => {
// //   console.log(`Server running on http://localhost:${PORT}`);
// // });
