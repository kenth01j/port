const express = require("express");

const {
  getPortfolio,
  updatePortfolio,
  addProject,
  deleteProject,
  addCertificate,
  deleteCertificate,
} = require("../controllers/portfolioController");
const verifyToken = require("../middleware/verifyToken");

const router = express.Router();

router.get("/", getPortfolio);
router.put("/", verifyToken, updatePortfolio);
router.post("/projects", verifyToken, addProject);
router.delete("/projects/:id", verifyToken, deleteProject);
router.post("/certificates", verifyToken, addCertificate);
router.delete("/certificates/:id", verifyToken, deleteCertificate);

module.exports = router;
