import pool from "../db.js";

// GET - Attendance records for a class on a specific date
export const getAttendance = async (req, res) => {
    const { classId, date } = req.query;

    if (!classId || !date) {
        return res.status(400).json({ error: "Class ID and date are required." });
    }

    try {
        // This query fetches all students from the selected class and LEFT JOINs any
        // existing attendance records for the given date.
        const query = `
            SELECT 
                s.student_id,
                s.first_name,
                s.last_name,
                s.admission_no,
                COALESCE(a.status, 'Present') AS status -- Default to 'Present' if no record exists
            FROM students s
            LEFT JOIN attendance a ON s.student_id = a.student_id AND a.attendance_date = $2
            WHERE s.class_id = $1
            ORDER BY s.last_name, s.first_name;
        `;
        const result = await pool.query(query, [classId, date]);
        res.json(result.rows);

    } catch (err) {
        console.error("Error fetching attendance:", err.message);
        res.status(500).json({ error: "Server error" });
    }
};

// POST - Save/update attendance records for a class on a specific date
export const saveAttendance = async (req, res) => {
    const { classId, date, attendanceData } = req.body;

    if (!classId || !date || !attendanceData) {
        return res.status(400).json({ error: "Class ID, date, and attendance data are required." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN'); // Start transaction

        // Use a loop to "upsert" (update or insert) each record
        for (const record of attendanceData) {
            const { student_id, status } = record;
            
            const upsertQuery = `
                INSERT INTO attendance (attendance_date, student_id, status)
                VALUES ($1, $2, $3)
                ON CONFLICT (attendance_date, student_id) 
                DO UPDATE SET status = EXCLUDED.status;
            `;
            await client.query(upsertQuery, [date, student_id, status]);
        }
        
        await client.query('COMMIT'); // Commit transaction
        res.status(200).json({ message: "Attendance saved successfully!" });

    } catch (err) {
        await client.query('ROLLBACK'); // Rollback on error
        console.error("Error saving attendance:", err.message);
        res.status(500).json({ error: "Failed to save attendance." });
    } finally {
        client.release();
    }
};