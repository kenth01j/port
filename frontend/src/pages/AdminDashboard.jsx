import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { usePortfolio } from "../context/PortfolioContext";
import { api, clearToken, resolveAssetUrl } from "../utils/api";

const inputClass =
  "mt-1 w-full rounded-xl border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-neutral-500";
const buttonClass =
  "action-button rounded-xl border border-line px-4 py-2 text-sm text-neutral-200";

function Field({ label, ...props }) {
  return (
    <label className="block text-sm text-neutral-400">
      {label}
      <input {...props} className={inputClass} />
    </label>
  );
}

function ImagePicker({ label, name, currentUrl }) {
  const [preview, setPreview] = useState("");

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <label className="block text-sm text-neutral-400">
      {label}
      <input
        type="file"
        name={name}
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setPreview(file ? URL.createObjectURL(file) : "");
        }}
        className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:text-neutral-200`}
      />
      {(preview || currentUrl) && (
        <img
          src={preview || resolveAssetUrl(currentUrl)}
          alt={`${label} preview`}
          className="mt-3 h-28 w-28 rounded-xl border border-line object-cover"
        />
      )}
      <span className="mt-1 block text-xs text-neutral-500">
        Choose an image from your device (JPEG, PNG, WebP, or GIF; up to 5 MB).
      </span>
    </label>
  );
}

function ProfileGalleryPicker({
  currentImages,
  currentMainImage,
  files,
  primaryImage,
  onFilesChange,
  onPrimaryChange,
}) {
  const [previews, setPreviews] = useState([]);
  const selectedPrimary =
    primaryImage ||
    currentMainImage ||
    (currentImages.length === 0 && files.length > 0 ? "file:0" : "");

  useEffect(() => {
    const objectUrls = files.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [files]);

  return (
    <div className="block text-sm text-neutral-400 sm:col-span-2">
      <label className="block">
        Profile photos
        <input
          type="file"
          name={name}
          multiple
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={(event) => {
            onFilesChange(Array.from(event.target.files || []));
            event.target.value = "";
          }}
          className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-sm file:text-neutral-200`}
        />
      </label>
      <p className="mt-1 text-xs text-neutral-500">
        Choose multiple JPEG, PNG, WebP, or GIF images (up to 5 MB each), then select which one is the main profile photo.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {currentImages.map((imageUrl) => (
          <label
            key={imageUrl}
            className="cursor-pointer rounded-xl border border-line bg-canvas p-2"
          >
            <img
              src={resolveAssetUrl(imageUrl)}
              alt="Saved profile photo"
              className="aspect-square w-full rounded-lg object-cover"
            />
            <span className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="mainProfileImage"
                value={imageUrl}
                checked={selectedPrimary === imageUrl}
                onChange={() => onPrimaryChange(imageUrl)}
              />
              Main photo
            </span>
          </label>
        ))}
        {previews.map((preview, index) => (
          <label
            key={`${files[index].name}-${files[index].lastModified}-${index}`}
            className="cursor-pointer rounded-xl border border-line bg-canvas p-2"
          >
            <img
              src={preview}
              alt={`New profile photo ${index + 1} preview`}
              className="aspect-square w-full rounded-lg object-cover"
            />
            <span className="mt-2 flex items-center gap-2 text-xs">
              <input
                type="radio"
                name="mainProfileImage"
                value={`file:${index}`}
                checked={selectedPrimary === `file:${index}`}
                onChange={() => onPrimaryChange(`file:${index}`)}
              />
              Main photo
            </span>
          </label>
        ))}
      </div>
      {!currentImages.length && !files.length && (
        <p className="mt-3 text-xs text-neutral-500">No profile photos uploaded yet.</p>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { portfolio, loading, error, reload } = usePortfolio();
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileFiles, setProfileFiles] = useState([]);
  const [primaryProfileImage, setPrimaryProfileImage] = useState("");
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isCertificateFormOpen, setIsCertificateFormOpen] = useState(false);

  if (loading) return <main className="p-8 text-neutral-400">Loading dashboard…</main>;
  if (error) return <main className="p-8 text-red-300">Could not load dashboard: {error}</main>;
  if (!portfolio) return null;

  const hero = portfolio.hero || {};
  const socials = hero.socials || {};
  const profileImages = [
    ...new Set([...(hero.profileImages || []), hero.profileImageUrl].filter(Boolean)),
  ];

  async function perform(action, successMessage) {
    setSaving(true);
    setNotice("");
    try {
      await action();
      await reload();
      setNotice(successMessage);
    } catch (requestError) {
      setNotice(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file) {
    if (!file || file.size === 0) return "";
    const formData = new FormData();
    formData.append("image", file);
    const result = await api.upload("/uploads", formData);
    return result.imageUrl;
  }

  async function saveProfile(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const skills = String(form.get("skills"))
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);
    const atsResumeText = form.get("atsResumeText");
    await perform(
      async () => {
        const uploadedImages = await Promise.all(profileFiles.map(uploadImage));
        const savedProfileImages = [...new Set([...profileImages, ...uploadedImages])];
        const selectedMainImage = primaryProfileImage || hero.profileImageUrl;
        const mainImageMatch = selectedMainImage.match(/^file:(\d+)$/);
        const profileImageUrl = mainImageMatch
          ? uploadedImages[Number(mainImageMatch[1])] || hero.profileImageUrl || ""
          : selectedMainImage || uploadedImages[0] || "";
        const updatedHero = {
          name: form.get("name"),
          title: form.get("title"),
          bio: form.get("bio"),
          profileImageUrl,
          profileImages: savedProfileImages,
          socials: {
            github: form.get("github"),
            linkedin: form.get("linkedin"),
            facebook: form.get("facebook"),
            instagram: form.get("instagram"),
            email: form.get("email"),
          },
        };
        await api.put("/portfolio", { hero: updatedHero, skills, atsResumeText });
        setProfileFiles([]);
        setPrimaryProfileImage(profileImageUrl);
      },
      "Portfolio details saved.",
    );
  }

  async function addProject(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const project = {
      title: form.get("title"),
      desc: form.get("desc"),
      techStack: String(form.get("techStack"))
        .split(",")
        .map((tech) => tech.trim())
        .filter(Boolean),
      liveLink: form.get("liveLink"),
      repoLink: form.get("repoLink"),
    };
    await perform(async () => {
      project.imageUrl = await uploadImage(form.get("projectImage"));
      await api.post("/portfolio/projects", project);
      formElement.reset();
    }, "Project added.");
  }

  async function addCertificate(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const certificate = Object.fromEntries(
      ["title", "issuer", "date"].map((key) => [key, form.get(key)]),
    );
    await perform(async () => {
      certificate.imageUrl = await uploadImage(form.get("certificateImage"));
      await api.post("/portfolio/certificates", certificate);
      formElement.reset();
    }, "Certificate added.");
  }

  function logout() {
    clearToken();
    navigate("/admin", { replace: true });
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 sm:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Portfolio</p>
          <h1 className="mt-1 text-3xl font-semibold">Admin dashboard</h1>
        </div>
        <button type="button" onClick={logout} className={buttonClass}>Sign out</button>
      </header>

      {notice && (
        <p role="status" className="rounded-xl border border-line bg-panel p-4 text-sm text-neutral-300">
          {notice}
        </p>
      )}

      <form onSubmit={saveProfile} className="space-y-5 rounded-3xl border border-line bg-panel p-6">
        <h2 className="text-xl font-semibold">Profile, skills & ATS resume</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" name="name" defaultValue={hero.name || ""} required />
          <Field label="Title" name="title" defaultValue={hero.title || ""} />
          <ProfileGalleryPicker
            name="profileImages"
            currentImages={profileImages}
            currentMainImage={hero.profileImageUrl}
            files={profileFiles}
            primaryImage={primaryProfileImage}
            onFilesChange={setProfileFiles}
            onPrimaryChange={setPrimaryProfileImage}
          />
          <Field label="GitHub URL" name="github" defaultValue={socials.github || ""} />
          <Field label="LinkedIn URL" name="linkedin" defaultValue={socials.linkedin || ""} />
          <Field label="Facebook URL" name="facebook" defaultValue={socials.facebook || ""} />
          <Field label="Instagram URL" name="instagram" defaultValue={socials.instagram || ""} />
          <Field label="Email address" name="email" defaultValue={socials.email || ""} />
          <Field label="Skills (comma-separated)" name="skills" defaultValue={(portfolio.skills || []).join(", ")} />
        </div>
        <label className="block text-sm text-neutral-400">
          Bio
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
