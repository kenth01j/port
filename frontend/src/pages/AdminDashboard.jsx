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
  onDeleteImage,
  saving,
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
