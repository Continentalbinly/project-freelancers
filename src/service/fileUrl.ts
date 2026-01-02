export function fileUrl(path: string) {
  const trimmed = path.replace(/^\/+/, "");
  return `/api/file/${trimmed}`;
}
