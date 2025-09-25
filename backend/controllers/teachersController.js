import pool from "../db.js";
import bcrypt from "bcrypt";

// --- Helper Functions ---

// Generates a random password
const generatePassword = (length = 8) => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// Generates the next unique teacher login ID (e.g., T2025001)
const generateTeacherLoginId = async () => {
  const year = new Date().getFullYear();
  const prefix = `T${year}`; // 'T' for Teacher

  const lastTeacher = await pool.query(
    `SELECT login_id FROM teachers 
     WHERE login_id LIKE $1 
     ORDER BY login_id DESC 
     LIMIT 1`,
    [`${prefix}%`]
  );

  let sequence = 1;
  if (lastTeacher.rows.length > 0) {
    const lastSeq = parseInt(lastTeacher.rows[0].login_id.substring(prefix.length));
    sequence = lastSeq + 1;
  }

  return `${prefix}${String(sequence).padStart(3, '0')}`;
};


// --- Route Handlers ---

// GET all teachers
export const getAllTeachers = async (req, res) => {
  try {
    const allTeachers = await pool.query(
      `SELECT teacher_id, login_id, first_name, last_name, role, subjects, contact_info 
       FROM teachers 
       ORDER BY first_name, last_name`
    );
    res.json(allTeachers.rows);
  } catch (err) {
    console.error("Error fetching teachers:", err.message);
    res.status(500).json({ error: "Server error fetching teachers" });
  }
};

// POST - Add a new teacher
export const addTeacher = async (req, res) => {
  const { firstName, lastName, subjects, contactInfo, role } = req.body;

  // Basic validation
  if (!firstName || !role) {
    return res.status(400).json({ error: "First name and role are required." });
  }

  try {
    // 1. Generate Login ID and Password
    const login_id = await generateTeacherLoginId();
    const rawPassword = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(rawPassword, salt);
    console.log(`Generated Password for ${login_id}: ${rawPassword}`); // For development/admin purposes

    // 2. Insert the new teacher into the database
    const newTeacher = await pool.query(
      `INSERT INTO teachers (
        first_name, last_name, subjects, contact_info, 
        role, login_id, password_hash
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING teacher_id, login_id, first_name, last_name, role, subjects, contact_info`,
      [firstName, lastName, subjects, contactInfo, role, login_id, password_hash]
    );

    // 3. Send success response
    res.status(201).json(newTeacher.rows[0]);

  } catch (err) {
    console.error("Error adding teacher:", err.message);
    res.status(500).json({ error: "Server error while adding teacher." });
  }
};