
const express = require("express");
const router = express.Router();

const controller = require("../controllers/assignmentController");

router.get("/", controller.getAssignments);
router.post("/", controller.addAssignment);
router.put("/:id", controller.updateAssignment);
router.delete("/:id", controller.deleteAssignment);

module.exports = router;
