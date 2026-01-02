export type UploadVisibility = "private" | "public";

export interface UploadFileParams {
  file: File;
  folder?: string;
  visibility?: UploadVisibility;
  idToken: string;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  url?: string;
  name?: string;
  size?: number;
  type?: string;
  error?: string;
}

export async function uploadFile(params: UploadFileParams): Promise<UploadResult> {
  const { file, folder, visibility = "private", idToken } = params;

  if (!file) throw new Error("file is required");
  if (!idToken) throw new Error("idToken is required");

  const formData = new FormData();
  formData.append("file", file);
  if (folder) formData.append("folder", folder);
  formData.append("visibility", visibility);

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  const data = (await res.json()) as UploadResult;

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Upload failed");
  }

  return data;
}
