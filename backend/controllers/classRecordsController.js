import pool from "../db.js";

// GET - Dashboard Summary Statistics
export const getDashboardStats = async (req, res) => {
  try {
    const classCountPromise = pool.query("SELECT COUNT(*) FROM classes");
    const studentCountPromise = pool.query("SELECT COUNT(*) FROM students");
    const teacherCountPromise = pool.query("SELECT COUNT(*) FROM teachers");

    const [classResult, studentResult, teacherResult] = await Promise.all([
      classCountPromise,
      studentCountPromise,
      teacherCountPromise,
    ]);

    res.json({
      classCount: parseInt(classResult.rows[0].count, 10),
      studentCount: parseInt(studentResult.rows[0].count, 10),
      teacherCount: parseInt(teacherResult.rows[0].count, 10),
    });
  } catch (err) {
    console.error("Error fetching dashboard stats:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// GET - Simplified list of all classes for dropdowns
export const getAllClassesSimple = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT class_id, class_name, section 
             FROM classes 
             ORDER BY class_name, section`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching simple classes list:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// GET - Simplified list of all teachers for dropdowns
export const getAllTeachersSimple = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT teacher_id, first_name, last_name 
             FROM teachers 
             ORDER BY first_name, last_name`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching simple teachers list:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// GET - Timetable data by class_id or teacher_id
export const getTimetable = async (req, res) => {
  const { view, id } = req.query; // e.g., view=class&id=1

  if (!view || !id) {
    return res.status(400).json({ error: "View type and ID are required." });
  }

  try {
    const query = `
      SELECT
        tte.entry_id,
        tte.day_of_week,
        tte.period_number,
        c.class_name,
        c.section,
        t.first_name AS teacher_first_name,
        t.last_name AS teacher_last_name,
        s.name AS subject_name
      FROM timetable_entries tte
      JOIN classes c ON tte.class_id = c.class_id
      JOIN teachers t ON tte.teacher_id = t.teacher_id
      JOIN subjects s ON tte.subject_id = s.subject_id
      WHERE ${view === 'class' ? 'tte.class_id' : 'tte.teacher_id'} = $1
      ORDER BY tte.period_number, tte.day_of_week;
    `;
    
    const result = await pool.query(query, [id]);
    res.json(result.rows);

  } catch (err) {
    console.error(`Error fetching timetable for ${view} ID ${id}:`, err.message);
    res.status(500).json({ error: "Server error fetching timetable data" });
  }
};

// GET - All subjects for dropdowns
export const getAllSubjects = async (req, res) => {
    try {
        const result = await pool.query("SELECT subject_id, name FROM subjects ORDER BY name");
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching subjects list:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// POST - Add a new timetable entry with conflict detection
export const addTimetableEntry = async (req, res) => {
    const { class_id, teacher_id, subject_id, day_of_week, period_number } = req.body;

    if (!class_id || !teacher_id || !subject_id || !day_of_week || !period_number) {
        return res.status(400).json({ error: "All fields are required to add an entry." });
    }

    try {
        const newEntry = await pool.query(
            `INSERT INTO timetable_entries (class_id, teacher_id, subject_id, day_of_week, period_number)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [class_id, teacher_id, subject_id, day_of_week, period_number]
        );
        res.status(201).json(newEntry.rows[0]);

    } catch (err) {
        // This block catches errors, including unique constraint violations
        if (err.code === '23505') { // PostgreSQL's unique violation error code
            let conflictMessage = "A scheduling conflict occurred.";
            if (err.constraint.includes('teacher_id')) {
                conflictMessage = "Conflict: This teacher is already booked for this time slot.";
            } else if (err.constraint.includes('class_id')) {
                conflictMessage = "Conflict: This class already has a period scheduled at this time.";
            }
            return res.status(409).json({ error: conflictMessage }); // 409 Conflict
        }

        console.error("Error adding timetable entry:", err.message);
        res.status(500).json({ error: "Server error while adding entry." });
    }
};

// POST - Promote all students from one class to another
export const promoteClass = async (req, res) => {
    const { sourceClassId, destClassId } = req.body;

    if (!sourceClassId || !destClassId) {
        return res.status(400).json({ error: "Source and destination classes are required." });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Start transaction

        // First, get the section of the destination class
        const destClassInfo = await client.query(
            "SELECT section FROM classes WHERE class_id = $1",
            [destClassId]
        );
        if (destClassInfo.rows.length === 0) {
            throw new Error("Destination class not found.");
        }
        const destSection = destClassInfo.rows[0].section;

        // Update all students from the source class to the destination class and section
        const updateResult = await client.query(
            `UPDATE students SET class_id = $1, section = $2 WHERE class_id = $3`,
            [destClassId, destSection, sourceClassId]
        );

        await client.query('COMMIT'); // Commit transaction

        res.json({ 
            message: "Class promoted successfully!",
            studentsMoved: updateResult.rowCount 
        });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback on error
        console.error("Error promoting class:", err.message);
        res.status(500).json({ error: "Failed to promote class. The operation was cancelled." });
    } finally {
        client.release();
    }
};
