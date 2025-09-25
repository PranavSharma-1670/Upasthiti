import express from "express";
import { testConnection } from "../controllers/testController.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ success: true, message: "PostgreSQL is connected" });
    } else {
      res.status(500).json({ success: false, message: "PostgreSQL connection failed" });
    }
  } catch (err) {
    console.error("Error in /api/test:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;




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
