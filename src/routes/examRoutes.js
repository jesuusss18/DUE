const express = require("express");
const router = express.Router();

const examController = require("../controllers/examController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", examController.getExams);
router.post("/", examController.addExam);
router.put("/:id", examController.updateExam);
router.delete("/:id", examController.deleteExam);

module.exports = router;
