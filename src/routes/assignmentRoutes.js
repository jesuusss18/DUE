const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", assignmentController.getAssignments);
router.post("/", assignmentController.addAssignment);
router.put("/:id", assignmentController.updateAssignment);
router.delete("/:id", assignmentController.deleteAssignment);

module.exports = router;