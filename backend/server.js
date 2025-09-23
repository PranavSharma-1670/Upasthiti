// backend/server.js
import express from "express";
import cors from "cors";
import { testConnection } from "./db.js";

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
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
