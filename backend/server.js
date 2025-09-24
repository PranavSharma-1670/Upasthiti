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



// Add a new student
app.post("/api/students", async (req, res) => {
    try {
      const {
        admissionNo,
        firstName,
        lastName,
        dob,
        gender,
        address,
        contactInfo,
        photoPath,
        classId,
        section,
        specialNeeds,
        iepDetails,
        loginId,
        passwordHash
      } = req.body;
  
      const result = await pool.query(
        `INSERT INTO students 
         (admission_no, first_name, last_name, dob, gender, address, contact_info, photo_path, class_id, section, special_needs, iep_details, login_id, password_hash)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         RETURNING *`,
        [
          admissionNo,
          firstName,
          lastName,
          dob,
          gender,
          address,
          contactInfo,
          photoPath,
          classId,
          section,
          specialNeeds,
          iepDetails,
          loginId,
          passwordHash
        ]
      );
  
      res.json({ success: true, student: result.rows[0] });
    } catch (err) {
      console.error("Error adding student", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });
  

  // server.js or your routes file
app.get("/api/classes", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM classes ORDER BY class_name ASC");
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching classes:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });

  
  app.get("/api/students", async (req, res) => {
    const { class_id, section } = req.query; // e.g., /api/students?class_id=1&section=A
    if (!class_id || !section) return res.status(400).json({ error: "Missing class_id or section" });
  
    try {
      const result = await pool.query(
        `SELECT student_id, admission_no, first_name, last_name, dob
         FROM students
         WHERE class_id=$1 AND section=$2
         ORDER BY admission_no ASC`,
        [class_id, section]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Error fetching students:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  });

  
  
  app.get("/api/classes/sections", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT c.class_id, c.class_name, 
               ARRAY_AGG(DISTINCT s.section ORDER BY s.section) as sections
        FROM classes c
        LEFT JOIN students s ON c.class_id = s.class_id
        GROUP BY c.class_id, c.class_name
        ORDER BY c.class_name ASC
      `);
      
      // Process the result to ensure we have the right format
      const classesWithSections = result.rows.map(row => ({
        class_id: row.class_id,
        class_name: row.class_name,
        sections: row.sections.filter(section => section !== null) // Remove null sections
      }));
      
      res.json(classesWithSections);
    } catch (err) {
      console.error("Error fetching classes with sections:", err.message);
      res.status(500).json({ error: "Server error" });
    }
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
