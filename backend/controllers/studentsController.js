import pool from "../db.js";

// GET all classes with sections
export const getClassesWithSections = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT class_id, class_name, section FROM classes ORDER BY class_name, section`
    );

    // Transform data to a structured object like: { "1": ["A", "B"], "2": ["A"] }
    const classesWithSections = {};
    result.rows.forEach(({ class_name, section}) => {
      if (!classesWithSections[class_name]) classesWithSections[class_name] = [];
      classesWithSections[class_name].push(section);
    });

    res.json(classesWithSections);
  } catch (err) {
    console.error("Error fetching classes:", err.message);
    res.status(500).json({ error: "Server error fetching classes" });
  }
};

// Get students by Grade & Section
export const getStudentsByGradeAndSection = async (req, res) => {
  const { grade, section } = req.params;

  try {
    const query = `
      SELECT 
        s.student_id,
        s.admission_no,
        s.first_name,
        s.last_name,
        s.dob,
        s.gender,
        s.address,
        s.contact_info,
        c.class_name,
        c.section AS class_section,
        t.first_name || ' ' || t.last_name AS class_teacher
      FROM students s
      JOIN classes c ON s.class_id = c.class_id
      LEFT JOIN teachers t ON c.class_teacher_id = t.teacher_id
      WHERE c.class_name = $1
        AND c.section = $2
      ORDER BY s.first_name, s.last_name;
    `;

    const result = await pool.query(query, [grade, section]);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
};


// export const getStudentsByGradeAndSection = async (req, res) => {
//     const { grade, section } = req.params;
//     try {
//       const result = await pool.query(
//         "SELECT * FROM students WHERE class = $1 AND section = $2",
//         [grade, section]
//       );
//       res.json(result.rows);
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       res.status(500).json({ error: "Failed to fetch students" });
//     }
//   };
  

// // ✅ New: Fetch students by grade & section
// export const getStudentsByGradeAndSection = async (req, res) => {
//     const { grade, section } = req.params;
//     try {
//       const [rows] = await pool.query(
//         "SELECT * FROM students WHERE grade = ? AND section = ?",
//         [grade, section]
//       );
//       res.json(rows);
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       res.status(500).json({ error: "Failed to fetch students" });
//     }
//   };


//   module.exports = {
//     getClassesWithSections,
//     getStudentsByGradeAndSection
//   };