"use client";

export default function SampleUploader({
  formData,
  setFormData,
  uploadingSample,
  sampleInputRef,
  handleSampleSelect,
  t,
}: any) {
  const removeSample = (url: string) => {
    setFormData((prev: any) => ({
      ...prev,
      sampleImages: prev.sampleImages.filter((i: string) => i !== url),
    }));
  };

  return (
    <div className="text-center">
      <h3 className="font-medium">{t("createProject.sampleImages")}</h3>

      <div className="flex flex-wrap justify-center gap-3 mt-3">
        {formData.sampleImages.map((img: string) => (
          <div key={img} className="relative w-28 h-28">
            <img
              src={img}
              className="w-full h-full object-cover rounded-lg border border-border"
            />
            <button
              type="button"
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs
             flex items-center justify-center"
              onClick={() => removeSample(img)}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        disabled={uploadingSample}
        onClick={() => sampleInputRef.current?.click()}
        className="btn btn-outline mt-3"
      >
        {uploadingSample
          ? t("createProject.uploading")
          : t("createProject.addSampleImage")}
      </button>

      <input
        type="file"
        ref={sampleInputRef}
        accept="image/*"
        onChange={handleSampleSelect}
        className="hidden"
      />
    </div>
  );
}
