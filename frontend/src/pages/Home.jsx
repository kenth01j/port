import {
  Award,
  BriefcaseBusiness,
  Code2,
  ExternalLink,
  Github,
} from "lucide-react";
import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import { usePortfolio } from "../context/PortfolioContext";
import { resolveAssetUrl } from "../utils/api";

const PERMANENT_PROJECT_IMAGES = {
  roadscanai: "/roadscanai.png",
  rosdscanai: "/roadscanai.png",
  bluebookportal: "/bluebook-portal.png",
};

function SectionHeading({ children, icon: Icon, tone = "text-blue-400" }) {
  return (
    <h2 className="section-title">
      <Icon size={19} className={tone} aria-hidden="true" />
      {children}
    </h2>
  );
}

export default function Home() {
  const { portfolio, loading, error } = usePortfolio();

  if (loading) {
    return <main className="p-8 text-neutral-400">Loading portfolio…</main>;
  }
  if (error) {
    return <main className="p-8 text-red-300">Could not load portfolio: {error}</main>;
  }

  const { hero = {}, skills = [], projects = [], certificates = [] } = portfolio || {};
  const profileBackground = "/profile.jpg";

  return (
    <div className="portfolio-page relative isolate min-h-screen overflow-hidden">
      {profileBackground && (
        <div aria-hidden="true" className="portfolio-backdrop pointer-events-none fixed inset-0 z-0">
          <img
            src={profileBackground}
            alt=""
            className="h-full w-full scale-105 object-cover opacity-30 blur-[3px]"
          />
          <div className="portfolio-backdrop-overlay absolute inset-0" />
        </div>
      )}
      <div className="portfolio-shell relative z-10">
        <nav className="top-nav">
          <Link to="/admin" className="admin-link">
            Admin Login
          </Link>
        </nav>

        <main className="portfolio-content">
          <header className="hero-card">
            <div className="hero-content">
              <h1 className="hero-title">{hero.name || "KENTH JOHN"}</h1>
              {hero.title && <p className="hero-subtitle">{hero.title}</p>}
              {hero.bio && <p className="hero-bio">{hero.bio}</p>}
              <Link to="/resume" className="btn-outline">
                View Resume
              </Link>
            </div>
            <Sidebar hero={hero} />
          </header>

          <section className="section-box">
            <SectionHeading icon={Code2}>Technical Skills</SectionHeading>
            {skills.length ? (
              <div className="skills-grid">
                {skills.map((skill, index) => (
                  <span key={`${skill}-${index}`} className="skill-pill">
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-state">Skills will be added soon.</p>
            )}
          </section>

          <section id="projects" className="section-box projects-section scroll-mt-8">
            <SectionHeading
              icon={BriefcaseBusiness}
              tone="text-purple-400"
            >
              Selected Projects
            </SectionHeading>
            <div className="projects-grid">
              {projects.map((project) => {
                const normalizedTitle = (project.title || "")
                  .toLowerCase()
                  .replace(/[^a-z0-9]/g, "");
                const displayTitle =
                  normalizedTitle === "rosdscanai" ? "RoadScanAI" : project.title;
                const permanentImage = PERMANENT_PROJECT_IMAGES[normalizedTitle];
                const usesPermanentImage = Boolean(permanentImage);
                const imageUrl =
                  permanentImage || resolveAssetUrl(project.imageUrl);

                return (
                  <article
                    key={project._id}
                    className="project-card"
                  >
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt=""
                        className={`project-thumb ${
                          usesPermanentImage ? "project-thumb-contained" : ""
                        }`}
                      />
                    )}
                    <div className="project-card-content">
                      <div>
                        <h3 className="project-title">
                          {displayTitle}
                        </h3>
                        <p className="project-desc">
                          {project.desc}
                        </p>
                        <div className="tech-tags">
                          {(project.techStack || []).map((tech, index) => (
                            <span
                              key={`${tech}-${index}`}
                              className="tag"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                      {(project.liveLink || project.repoLink) && (
                        <div className="project-actions">
                          {project.liveLink && (
                            <a
                              href={project.liveLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-solid"
                            >
                              Live Demo
                            </a>
                          )}
                          {project.repoLink && (
                            <a
                              href={project.repoLink}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-repository"
                            >
                              <Github size={16} /> Code
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {!projects.length && (
              <p className="empty-state">Projects will be added soon.</p>
            )}
          </section>

          <section className="section-box certifications-section">
            <SectionHeading icon={Award} tone="text-yellow-400">
              Certifications
            </SectionHeading>
            {certificates.length ? (
              <div className="certificate-list">
                {certificates.map((certificate) => (
                  <article
                    key={certificate._id}
                    className="certificate-card"
                  >
                    {certificate.imageUrl ? (
                      <img
                        src={resolveAssetUrl(certificate.imageUrl)}
                        alt={`${certificate.title} certificate`}
                        className="certificate-image"
                      />
                    ) : (
                      <span className="certificate-placeholder">
                        <Award size={20} />
                      </span>
                    )}
                    <div className="certificate-details">
                      <h3>{certificate.title}</h3>
                      <p>
                        {[certificate.issuer, certificate.date]
                          .filter(Boolean)
                          .join(" • ")}
                      </p>
                    </div>
                    {certificate.imageUrl && (
                      <a
                        href={resolveAssetUrl(certificate.imageUrl)}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`View ${certificate.title} certificate`}
                        className="certificate-link"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="empty-state">Certificates will be added soon.</p>
            )}
          </section>
          <footer className="site-footer">
            <Link to="/resume" className="transition hover:text-white">
              View ATS-friendly resume
            </Link>
          </footer>
        </main>
      </div>
    </div>
  );
}
