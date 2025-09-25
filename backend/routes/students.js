import express from "express";
import { getClassesWithSections ,getStudentsByGradeAndSection, addStudent} from "../controllers/studentsController.js";

const router = express.Router();

// GET /api/students/classes
router.get("/classes", getClassesWithSections);

router.get("/:grade/:section", getStudentsByGradeAndSection);

router.post("/", addStudent);

export default router;
