import pool from "../db.js";

export const testConnection = async () => {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("PostgreSQL connected:", res.rows[0]);
    return true;
  } catch (err) {
    console.error("PostgreSQL connection error:", err);
    return false;
  }
};





// import pool from "../db.js";

// export const testConnection = async () => {
//   try {
//     const res = await pool.query("SELECT NOW()");
//     console.log("PostgreSQL connected:", res.rows[0]);
//     return true;
//   } catch (err) {
//     console.error("PostgreSQL connection error:", err.message);
//     return false;
//   }
// };
