import express from "express";
import { getClassesWithSections ,getStudentsByGradeAndSection} from "../controllers/studentsController.js";

const router = express.Router();

// GET /api/students/classes
router.get("/classes", getClassesWithSections);

router.get("/:grade/:section", getStudentsByGradeAndSection);

export default router;
