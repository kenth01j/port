const mongoose = require("mongoose");

const PortfolioData = require("../models/PortfolioData");

const editableFields = [
  "hero",
  "skills",
  "projects",
  "certificates",
  "atsResumeText",
];

async function getOrCreatePortfolio() {
  let portfolio = await PortfolioData.findById("portfolio");
  if (!portfolio) portfolio = await PortfolioData.create({});
  return portfolio;
}

async function getPortfolio(_req, res) {
  try {
    return res.json(await getOrCreatePortfolio());
  } catch (error) {
    console.error("Could not load portfolio data:", error);
    return res.status(500).json({ message: "Could not load portfolio data." });
  }
}

async function updatePortfolio(req, res) {
  const update = {};
  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      update[field] = req.body[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return res.status(400).json({ message: "No editable portfolio fields provided." });
  }

  try {
    const portfolio = await PortfolioData.findOneAndUpdate(
      { _id: "portfolio" },
      { $set: update },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    return res.json(portfolio);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not update portfolio data:", error);
    return res.status(500).json({ message: "Could not update portfolio data." });
  }
}

async function addProject(req, res) {
  try {
    const portfolio = await getOrCreatePortfolio();
    portfolio.projects.push(req.body);
    await portfolio.save();
    return res.status(201).json(portfolio);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not add project:", error);
    return res.status(500).json({ message: "Could not add project." });
  }
}

async function deleteProject(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid project ID." });
  }

  try {
    const portfolio = await getOrCreatePortfolio();
    const project = portfolio.projects.id(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found." });
    project.deleteOne();
    await portfolio.save();
    return res.json(portfolio);
  } catch (error) {
    console.error("Could not delete project:", error);
    return res.status(500).json({ message: "Could not delete project." });
  }
}

async function addCertificate(req, res) {
  try {
    const portfolio = await getOrCreatePortfolio();
    portfolio.certificates.push(req.body);
    await portfolio.save();
    return res.status(201).json(portfolio);
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ message: error.message });
    }
    console.error("Could not add certificate:", error);
    return res.status(500).json({ message: "Could not add certificate." });
  }
}

async function deleteCertificate(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "Invalid certificate ID." });
  }

  try {
    const portfolio = await getOrCreatePortfolio();
    const certificate = portfolio.certificates.id(req.params.id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found." });
    }
    certificate.deleteOne();
    await portfolio.save();
    return res.json(portfolio);
  } catch (error) {
    console.error("Could not delete certificate:", error);
    return res.status(500).json({ message: "Could not delete certificate." });
  }
}

module.exports = {
  getPortfolio,
  updatePortfolio,
  addProject,
  deleteProject,
  addCertificate,
  deleteCertificate,
};
