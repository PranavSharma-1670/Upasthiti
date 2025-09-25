import pool from "../db.js";
import bcrypt from "bcrypt";

// Helper function to generate a random password
const generatePassword = (length = 8) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Helper function to generate the next admission number
const generateAdmissionNo = async () => {
  const year = new Date().getFullYear();
  const prefix = `S${year}`;

  // Find the highest existing admission number for the current year
  const lastAdmission = await pool.query(
    `SELECT admission_no FROM students 
     WHERE admission_no LIKE $1 
     ORDER BY admission_no DESC 
     LIMIT 1`,
    [`${prefix}%`]
  );

  let sequence = 1;
  if (lastAdmission.rows.length > 0) {
    const lastSeq = parseInt(lastAdmission.rows[0].admission_no.substring(prefix.length));
    sequence = lastSeq + 1;
  }

  // Pad the sequence with leading zeros to make it 3 digits long (e.g., 1 -> 001)
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};


// POST - Add a new student
export const addStudent = async (req, res) => {
  const {
    first_name,
    last_name,
    dob,
    gender,
    address,
    contact_info,
    photo_path,
    class_name, // Receiving class_name from frontend
    section,
    special_needs,
    iep_details,
  } = req.body;

  // Basic validation
  if (!first_name || !class_name || !section) {
    return res.status(400).json({ error: "First name, class, and section are required." });
  }

  try {
    // 1. Find the class_id from class_name and section
    const classResult = await pool.query(
      "SELECT class_id FROM classes WHERE class_name = $1 AND section = $2",
      [class_name, section]
    );

    if (classResult.rows.length === 0) {
      return res.status(404).json({ error: "Class and section not found." });
    }
    const class_id = classResult.rows[0].class_id;

    // 2. Generate unique admission_no and login_id
    const admission_no = await generateAdmissionNo();
    const login_id = admission_no; // Login ID is the same as Admission No

    // 3. Generate and hash a random password
    const rawPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(rawPassword, salt);
    console.log(`Generated Password for ${login_id}: ${rawPassword}`); // Log for admin/dev use

    // 4. Insert the new student into the database
    const newStudent = await pool.query(
      `INSERT INTO students (
        admission_no, first_name, last_name, dob, gender, address, 
        contact_info, photo_path, class_id, section, special_needs, 
        iep_details, login_id, password_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *`,
      [
        admission_no, first_name, last_name, dob, gender, address, 
        contact_info, photo_path, class_id, section, special_needs, 
        iep_details, login_id, password_hash
      ]
    );

    // 5. Send success response
    res.status(201).json(newStudent.rows[0]);

  } catch (err) {
    console.error("Error adding student:", err.message);
    res.status(500).json({ error: "Server error while adding student." });
  }
};


// --- Existing functions from your file ---

// GET all classes with sections
export const getClassesWithSections = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT class_id, class_name, section FROM classes ORDER BY class_name, section`
    );

    const classesWithSections = {};
    result.rows.forEach(({ class_name, section }) => {
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
        TO_CHAR(s.dob, 'YYYY-MM-DD') as dob,
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




// import pool from "../db.js";

// // GET all classes with sections
// export const getClassesWithSections = async (req, res) => {
//   try {
//     const result = await pool.query(
//       `SELECT class_id, class_name, section FROM classes ORDER BY class_name, section`
//     );

//     // Transform data to a structured object like: { "1": ["A", "B"], "2": ["A"] }
//     const classesWithSections = {};
//     result.rows.forEach(({ class_name, section}) => {
//       if (!classesWithSections[class_name]) classesWithSections[class_name] = [];
//       classesWithSections[class_name].push(section);
//     });

//     res.json(classesWithSections);
//   } catch (err) {
//     console.error("Error fetching classes:", err.message);
//     res.status(500).json({ error: "Server error fetching classes" });
//   }
// };

// // Get students by Grade & Section
// export const getStudentsByGradeAndSection = async (req, res) => {
//   const { grade, section } = req.params;

//   try {
//     const query = `
//       SELECT 
//         s.student_id,
//         s.admission_no,
//         s.first_name,
//         s.last_name,
//         s.dob,
//         s.gender,
//         s.address,
//         s.contact_info,
//         c.class_name,
//         c.section AS class_section,
//         t.first_name || ' ' || t.last_name AS class_teacher
//       FROM students s
//       JOIN classes c ON s.class_id = c.class_id
//       LEFT JOIN teachers t ON c.class_teacher_id = t.teacher_id
//       WHERE c.class_name = $1
//         AND c.section = $2
//       ORDER BY s.first_name, s.last_name;
//     `;

//     const result = await pool.query(query, [grade, section]);
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Error fetching students:", error);
//     res.status(500).json({ error: "Failed to fetch students" });
//   }
// };


// // export const getStudentsByGradeAndSection = async (req, res) => {
// //     const { grade, section } = req.params;
// //     try {
// //       const result = await pool.query(
// //         "SELECT * FROM students WHERE class = $1 AND section = $2",
// //         [grade, section]
// //       );
// //       res.json(result.rows);
// //     } catch (error) {
// //       console.error("Error fetching students:", error);
// //       res.status(500).json({ error: "Failed to fetch students" });
// //     }
// //   };
  

// // // ✅ New: Fetch students by grade & section
// // export const getStudentsByGradeAndSection = async (req, res) => {
// //     const { grade, section } = req.params;
// //     try {
// //       const [rows] = await pool.query(
// //         "SELECT * FROM students WHERE grade = ? AND section = ?",
// //         [grade, section]
// //       );
// //       res.json(rows);
// //     } catch (error) {
// //       console.error("Error fetching students:", error);
// //       res.status(500).json({ error: "Failed to fetch students" });
// //     }
// //   };


// //   module.exports = {
// //     getClassesWithSections,
// //     getStudentsByGradeAndSection
// //   };