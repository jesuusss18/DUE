const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");
const authMiddleware = require("../middleware/authMiddleware");
const validateId = require("../middleware/validateId");

router.use(authMiddleware);

router.get("/", examController.getExams);
router.post("/", examController.addExam);
router.put("/:id", validateId, examController.updateExam);
router.delete("/:id", validateId, examController.deleteExam);

module.exports = router;
