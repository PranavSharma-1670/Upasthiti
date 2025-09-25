// import express from "express";
// import { getEvents, addEvent } from "../controllers/eventController.js";

// const router = express.Router();

// // GET all events
// router.get("/", getEvents);

// // POST a new event
// router.post("/", addEvent);

// export default router;


import express from "express";
import { getAllEvents ,addEvent} from "../controllers/eventsController.js";

const router = express.Router();

// GET /api/events
router.get("/",getAllEvents);
router.post("/",addEvent);

export default router;



// import express from "express";
// import { getEvents } from "../controllers/eventsController.js";

// const router = express.Router();

// router.get("/", getEvents);

// export default router;
