import express from "express";
import { 
    getDashboardStats,
    getAllClassesSimple,
    getAllTeachersSimple,
    getTimetable,
    getAllSubjects,      // <-- Import new function
    addTimetableEntry,
    promoteClass
} from "../controllers/classRecordsController.js";

const router = express.Router();

// Route for summary stats
router.get("/stats", getDashboardStats);
// Route for simplified lists for dropdowns
router.get("/classes-list", getAllClassesSimple);
router.get("/teachers-list", getAllTeachersSimple);
// Route for getting timetable data
router.get("/timetable", getTimetable);

router.get("/subjects-list", getAllSubjects);
router.post("/timetable", addTimetableEntry);

router.post("/promote-class", promoteClass);

export default router;