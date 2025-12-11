"use client";

export default function BannerUploader({
  formData,
  setFormData,
  uploading,
  fileInputRef,
  handleBannerSelect,
  t,
}: any) {
  return (
    <div className="text-center">
      <h3 className="font-medium">{t("createProject.bannerImage")}</h3>

      {formData.imageUrl ? (
        <div className="flex flex-col items-center mt-3">
          <img
            src={formData.imageUrl}
            className="w-64 rounded-lg border border-border"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-outline mt-3"
          >
            {uploading
              ? t("createProject.uploading")
              : t("createProject.replaceImage")}
          </button>
        </div>
      ) : (
        <div className="border-dashed border-2 p-6 mt-3 rounded-lg flex flex-col items-center">
          <p>{t("createProject.noImageSelected")}</p>

          <button
            type="button"
            className="btn btn-outline mt-3"
            onClick={() => fileInputRef.current?.click()}
          >
            {t("createProject.chooseImage")}
          </button>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleBannerSelect}
      />
    </div>
  );
}
