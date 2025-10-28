export default function EditModal({ field, value, onCancel }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">Edit {field}</h3>
        <input suppressHydrationWarning
          type="text"
          defaultValue={value}
          className="w-full px-3 py-2 border border-border rounded-lg"
        />
        <div className="flex gap-2 mt-4">
          <button suppressHydrationWarning className="btn btn-primary flex-1">Save</button>
          <button suppressHydrationWarning onClick={onCancel} className="btn btn-outline flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
