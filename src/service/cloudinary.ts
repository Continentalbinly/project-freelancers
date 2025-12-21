import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name:
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  folder: string;
  resource_type: string;
}

export async function uploadToCloudinary(
  file: Buffer,
  fileName: string,
  mimeType: string,
  folderType: string = "general",
  subfolder?: string
): Promise<CloudinaryUploadResult> {
  // Convert buffer to base64 for Cloudinary
  const base64File = `data:${mimeType};base64,${file.toString("base64")}`;

  // Map folderType to Cloudinary folder structure
  let cloudinaryFolder = "freelancehub/general";
  if (folderType === "profile" || folderType === "profileImage") {
    cloudinaryFolder = "profileimage";
  } else if (folderType === "project" || folderType === "projectImage") {
    cloudinaryFolder = "projectImage";
  } else if (folderType === "proposalsImage") {
    cloudinaryFolder = "proposalsImage";
    if (subfolder) {
      cloudinaryFolder += `/${subfolder}`;
    }
  } else if (folderType === "portfolio") {
    cloudinaryFolder = "portfolio";
    if (subfolder) {
      cloudinaryFolder += `/${subfolder}`;
    }
  }

  // Upload to Cloudinary
  const result = await cloudinary.uploader.upload(base64File, {
    folder: cloudinaryFolder,
    public_id: fileName.replace(/\.[^/.]+$/, ""),
    resource_type: "auto",
    overwrite: true,
  });

  return {
    secure_url: result.secure_url,
    public_id: result.public_id,
    folder: result.folder || "",
    resource_type: result.resource_type,
  };
}

export default cloudinary;
