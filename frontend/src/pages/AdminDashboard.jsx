          <textarea name="bio" rows="4" defaultValue={hero.bio || ""} className={inputClass} />
        </label>
        <label className="block text-sm text-neutral-400">
          ATS resume text
          <textarea
            name="atsResumeText"
            rows="12"
            defaultValue={portfolio.atsResumeText || ""}
            className={`${inputClass} font-mono`}
          />
        </label>
        <button disabled={saving} className={buttonClass}>Save profile</button>
      </form>

      <section className="space-y-4 rounded-3xl border border-line bg-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Projects</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {portfolio.projects?.length || 0} project{portfolio.projects?.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={isProjectFormOpen}
            onClick={() => setIsProjectFormOpen((open) => !open)}
            className={buttonClass}
          >
            {isProjectFormOpen ? <X size={16} /> : <Plus size={16} />}
            {isProjectFormOpen ? "Cancel" : "Add project"}
          </button>
        </div>
        {portfolio.projects?.map((project) => (
          <div key={project._id} className="flex items-center justify-between gap-4 border-b border-line py-3">
            <span className="text-sm">{project.title}</span>
            <button
              type="button"
              disabled={saving}
              onClick={() => perform(() => api.delete(`/portfolio/projects/${project._id}`), "Project deleted.")}
              className={buttonClass}
            >
              Delete
            </button>
          </div>
        ))}
        {isProjectFormOpen && (
          <form onSubmit={addProject} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <Field label="Project title" name="title" required />
            <Field label="Tech stack (comma-separated)" name="techStack" />
            <ImagePicker label="Project image" name="projectImage" />
            <Field label="Live link" name="liveLink" />
            <Field label="Repository link" name="repoLink" />
            <label className="block text-sm text-neutral-400">
              Description
              <textarea name="desc" rows="2" className={inputClass} />
            </label>
            <button disabled={saving} className={`${buttonClass} sm:col-span-2`}>
              {saving ? "Saving…" : "Save project"}
            </button>
          </form>
        )}
      </section>

      <section className="space-y-4 rounded-3xl border border-line bg-panel p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Certifications</h2>
            <p className="mt-1 text-sm text-neutral-500">
              {portfolio.certificates?.length || 0} certification{portfolio.certificates?.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            aria-expanded={isCertificateFormOpen}
            onClick={() => setIsCertificateFormOpen((open) => !open)}
            className={buttonClass}
          >
            {isCertificateFormOpen ? <X size={16} /> : <Plus size={16} />}
            {isCertificateFormOpen ? "Cancel" : "Add certification"}
          </button>
        </div>
        {portfolio.certificates?.map((certificate) => (
          <div key={certificate._id} className="flex items-center justify-between gap-4 border-b border-line py-3">
            <span className="text-sm">{certificate.title}</span>
            <button
              type="button"
              disabled={saving}
              onClick={() =>
                perform(
                  () => api.delete(`/portfolio/certificates/${certificate._id}`),
                  "Certificate deleted.",
                )
              }
              className={buttonClass}
            >
              Delete
            </button>
          </div>
        ))}
        {isCertificateFormOpen && (
          <form onSubmit={addCertificate} className="grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
            <Field label="Certificate title" name="title" required />
            <Field label="Issuer" name="issuer" />
            <Field label="Date" name="date" />
            <ImagePicker label="Certificate image" name="certificateImage" />
            <button disabled={saving} className={`${buttonClass} sm:col-span-2`}>
              {saving ? "Saving…" : "Save certification"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
