"use client";

export default function EditModal({
  editField,
  editValue,
  setEditValue,
  setIsEditing,
  user,
  profile,
  refreshProfile,
  t,
}: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {t("profile.editModal.title")} {editField}
        </h3>

        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mb-4"
        />

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIsEditing(false);
            }}
            className="btn btn-primary flex-1"
          >
            {t("profile.editModal.save")}
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-outline flex-1"
          >
            {t("profile.editModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
