import crypto from "crypto";

export const generateSlug = (title: string): string => {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .replace(/-+/g, "-"); // Clean up consecutive hyphens

  const shortId = crypto.randomBytes(3).toString("hex"); // Safeguard collision entropy
  return `${baseSlug}-${shortId}`;
};
