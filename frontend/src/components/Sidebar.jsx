import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  X,
} from "lucide-react";

import { resolveAssetUrl } from "../utils/api";

const permanentProfileImage = "/profile.jpg";

const socialLinks = [
  { key: "github", label: "GitHub", Icon: Github },
  { key: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { key: "facebook", label: "Facebook", Icon: Facebook },
  { key: "instagram", label: "Instagram", Icon: Instagram },
  { key: "email", label: "Email", Icon: Mail },
];

export default function Sidebar({ hero = {} }) {
  const [isProfileImageOpen, setIsProfileImageOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [activeProfileImage, setActiveProfileImage] = useState("");
  const socials = hero.socials || {};
  const profileImageUrl = permanentProfileImage;
  const profileImages = [
    ...new Set([
      profileImageUrl,
      ...(hero.profileImages || []).filter((image) => image !== hero.profileImageUrl),
    ]),
  ];
  const availableSocialLinks = socialLinks.filter(({ key }) => socials[key]);

  function openProfileGallery() {
    setActiveProfileImage(profileImageUrl);
    setIsGalleryOpen(false);
    setIsProfileImageOpen(true);
  }

  useEffect(() => {
    if (!isProfileImageOpen) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsProfileImageOpen(false);
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileImageOpen]);

  return (
    <div className="hero-profile">
      {profileImageUrl ? (
        <button
          type="button"
          onClick={openProfileGallery}
          aria-label={`View ${hero.name || "profile"} photo larger`}
          aria-haspopup="dialog"
          className="profile-img-button"
        >
          <img
            src={profileImageUrl}
            alt={hero.name || "Profile"}
            className="profile-img"
          />
        </button>
      ) : (
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#1a1a1a] bg-neutral-900 text-5xl font-semibold text-neutral-500"
        >
          {(hero.name || "Y").charAt(0).toUpperCase()}
        </div>
      )}
      {availableSocialLinks.length > 0 && (
      <div className="social-links">
        {socialLinks.map(({ key, label, Icon }) => {
          const value = socials[key];
          if (!value) return null;
          const href =
            key === "email" && !value.startsWith("mailto:")
              ? `mailto:${value}`
              : value;
          return (
            <a
              key={key}
              href={href}
              target={key === "email" ? undefined : "_blank"}
              rel={key === "email" ? undefined : "noreferrer"}
              aria-label={label}
              className="social-link"
            >
              <Icon size={18} />
            </a>
          );
        })}
      </div>
      )}
      {isProfileImageOpen &&
        createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a]/95 p-4 backdrop-blur-md sm:p-8"
          onClick={() => setIsProfileImageOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${hero.name || "Profile"} profile photo`}
            className="relative flex max-h-full w-full max-w-5xl flex-col items-center justify-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsProfileImageOpen(false)}
              aria-label="Close enlarged profile photo"
              className="action-button absolute -right-3 -top-3 z-10 rounded-full border border-line bg-panel p-3 text-white sm:-right-4 sm:-top-4"
            >
              <X size={20} />
            </button>
            <img
              key={activeProfileImage}
              src={resolveAssetUrl(activeProfileImage)}
              alt={hero.name || "Profile"}
              className="profile-photo-transition relative z-10 max-h-[62vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {profileImages.length > 1 && (
              <div className="w-full max-w-2xl">
              <button
                type="button"
                aria-expanded={isGalleryOpen}
                aria-controls="profile-photo-gallery"
                onClick={() => setIsGalleryOpen((open) => !open)}
                className="action-button mx-auto flex gap-2 rounded-full border border-line bg-panel px-5 py-3 text-sm text-white"
              >
                {isGalleryOpen ? "Hide other photos" : "View other photos"}
                <ChevronDown
                  size={17}
                  className={`transition-transform duration-300 ${
                    isGalleryOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                id="profile-photo-gallery"
                aria-hidden={!isGalleryOpen}
                className={`profile-gallery-dropdown ${
                  isGalleryOpen ? "profile-gallery-dropdown-open" : ""
                }`}
              >
                <div className="mt-3 flex max-h-36 justify-center gap-3 overflow-x-auto rounded-2xl border border-line bg-panel/95 p-3">
                  {profileImages.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      disabled={!isGalleryOpen}
                      aria-label={`View profile photo ${index + 1}`}
                      aria-pressed={activeProfileImage === image}
                      onClick={() => setActiveProfileImage(image)}
                      className={`shrink-0 overflow-hidden rounded-xl border-2 transition ${
                        activeProfileImage === image
                          ? "border-[#00ed64]"
                          : "border-transparent hover:border-neutral-500"
                      }`}
                    >
                      <img
                        src={resolveAssetUrl(image)}
                        alt=""
                        className="h-20 w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
