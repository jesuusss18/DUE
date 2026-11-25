const express = require("express");
const router = express.Router();

const assignmentController = require("../controllers/assignmentController");
const authMiddleware = require("../middleware/authMiddleware");
const validateId = require("../middleware/validateId");

router.use(authMiddleware);

router.get("/", assignmentController.getAssignments);
router.post("/", assignmentController.addAssignment);
router.put("/:id", validateId, assignmentController.updateAssignment);
router.delete("/:id", validateId, assignmentController.deleteAssignment);

module.exports = router;