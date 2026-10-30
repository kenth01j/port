const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  desc: { type: String, default: "" },
  techStack: [{ type: String, trim: true }],
  imageUrl: { type: String, default: "" },
  liveLink: { type: String, default: "" },
  repoLink: { type: String, default: "" },
});

const certificateSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  issuer: { type: String, default: "" },
  date: { type: String, default: "" },
  imageUrl: { type: String, default: "" },
});

const portfolioDataSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "portfolio" },
    hero: {
      name: { type: String, default: "Your Name" },
      title: { type: String, default: "Full-Stack Developer" },
      bio: { type: String, default: "" },
      profileImageUrl: { type: String, default: "" },
      profileImages: [{ type: String }],
      socials: {
        github: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        email: { type: String, default: "" },
      },
    },
    skills: [{ type: String, trim: true }],
    projects: [projectSchema],
    certificates: [certificateSchema],
    atsResumeText: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PortfolioData", portfolioDataSchema);
