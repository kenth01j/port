import {
  ArrowRight,
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

function SectionHeading({ children, icon: Icon, tone = "text-blue-400" }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className={`rounded-lg border border-line bg-[#1a1a1a] p-2 ${tone}`}>
        <Icon size={20} />
      </span>
      <h2 className="text-2xl font-bold">{children}</h2>
    </div>
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
  const profileBackground = resolveAssetUrl(hero.profileImageUrl);

  return (
    <div className="relative isolate min-h-screen overflow-hidden">
      {profileBackground && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
          <img
            src={profileBackground}
            alt=""
            className="h-full w-full scale-105 object-cover opacity-40 blur-[2px]"
          />
          <div className="absolute inset-0 bg-[#0a0a0a]/65" />
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 z-[1] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/[0.09] blur-[120px]"
      />
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl justify-end px-6 py-6">
        <Link
          to="/admin"
          className="rounded-full border border-gray-800 px-5 py-2 text-sm text-gray-400 transition hover:border-gray-500 hover:text-white"
        >
          Admin Login
        </Link>
      </nav>

      <main className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 pb-20 md:grid-cols-3">
        <Sidebar hero={hero} />

        <div className="space-y-10 md:col-span-2">
          <section className="relative overflow-hidden rounded-3xl border border-gray-800 bg-[#121212] p-8 sm:p-10 md:p-12">
            <p className="mb-4 text-sm uppercase tracking-[0.2em] text-gray-400">
              Hello, I’m
            </p>
            <h1 className="mb-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                {hero.name || "Your Name"}
              </span>
            </h1>
            {hero.title && (
              <p className="mb-4 text-lg font-medium text-blue-300">{hero.title}</p>
            )}
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-black transition hover:bg-gray-200"
            >
              View My Work <ArrowRight size={17} />
            </a>
          </section>

          <section>
            <SectionHeading icon={Code2}>Technical Skills</SectionHeading>
            {skills.length ? (
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="flex cursor-default items-center gap-2 rounded-xl border border-gray-800 bg-[#121212] px-4 py-2 text-sm font-medium text-gray-300 transition hover:border-gray-600"
                  >
                    <span className="text-lg font-bold text-cyan-400">#</span>
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Skills will be added soon.</p>
            )}
          </section>

          <section id="projects" className="scroll-mt-8">
            <SectionHeading
              icon={BriefcaseBusiness}
              tone="text-purple-400"
            >
              Selected Projects
            </SectionHeading>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {projects.map((project) => (
                <article
                  key={project._id}
                  className="group flex flex-col justify-between rounded-3xl border border-gray-800 bg-[#121212] transition hover:border-gray-600"
                >
                  {project.imageUrl && (
                    <img
                      src={resolveAssetUrl(project.imageUrl)}
                      alt=""
                      className="aspect-[16/9] w-full rounded-t-3xl object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h3 className="mb-2 text-xl font-bold text-white transition group-hover:text-blue-400">
                        {project.title}
                      </h3>
                      <p className="mb-4 text-sm leading-relaxed text-gray-400">
                        {project.desc}
                      </p>
                      <div className="mb-6 flex flex-wrap gap-2">
                        {(project.techStack || []).map((tech, index) => (
                          <span
                            key={`${tech}-${index}`}
                            className="rounded-full border border-gray-800 bg-[#1a1a1a] px-3 py-1 text-xs text-gray-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    {(project.liveLink || project.repoLink) && (
                      <div className="mt-4 flex gap-3 border-t border-gray-800 pt-4">
                        {project.liveLink && (
                          <a
                            href={project.liveLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 rounded-lg bg-white py-2 text-center text-sm font-semibold text-black transition hover:bg-gray-200"
                          >
                            Live Demo
                          </a>
                        )}
                        {project.repoLink && (
                          <a
                            href={project.repoLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#1a1a1a] py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                          >
                            <Github size={16} /> Code
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
            {!projects.length && (
              <p className="text-sm text-gray-500">Projects will be added soon.</p>
            )}
          </section>

          <section>
            <SectionHeading icon={Award} tone="text-yellow-400">
              Certifications
            </SectionHeading>
            {certificates.length ? (
              <div className="space-y-4">
                {certificates.map((certificate) => (
                  <article
                    key={certificate._id}
                    className="flex items-center gap-4 rounded-2xl border border-gray-800 bg-[#121212] p-5 transition hover:bg-[#161616]"
                  >
                    {certificate.imageUrl ? (
                      <img
                        src={resolveAssetUrl(certificate.imageUrl)}
                        alt={`${certificate.title} certificate`}
                        className="h-12 w-12 shrink-0 rounded-full border border-gray-800 object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-800 bg-[#1a1a1a] text-gray-400">
                        <Award size={20} />
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-white">{certificate.title}</h3>
                      <p className="mt-1 text-sm text-gray-400">
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
                        className="ml-auto shrink-0 text-gray-500 transition hover:text-white"
                      >
                        <ExternalLink size={20} />
                      </a>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Certificates will be added soon.
              </p>
            )}
          </section>
          <footer className="border-t border-gray-800 pt-6 text-sm text-gray-500">
            <Link to="/resume" className="transition hover:text-white">
              View ATS-friendly resume
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
