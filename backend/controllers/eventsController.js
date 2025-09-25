import pool from "../db.js";

export const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT event_id, event_date, title, description, type, created_at, updated_at
       FROM events_notices
       ORDER BY event_date ASC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching events:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// NEW: Add Event
export const addEvent = async (req, res) => {
  try {
    const { title, description, date, type} = req.body;

    const result = await pool.query(
      `INSERT INTO events_notices (event_date, title, description, type )
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [date, title, description, type]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error adding event:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};



// import pool from "../db.js";

// export const getEvents = async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT event_id, event_date, title, description, type, created_at, updated_at FROM events_notices ORDER BY event_date ASC"
//     );
//     res.json(result.rows);
//   } catch (err) {
//     console.error("Fetch error:", err.message);
//     res.status(500).json({ error: "Server error" });
//   }
// };
