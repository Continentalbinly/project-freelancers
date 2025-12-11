"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Category } from "../page";

export default function CategoryRow({
  cat,
  index,
  onEdit,
  onDelete,
}: {
  cat: Category;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="hover:transition-colors duration-150">
      <td className="py-3 px-4 text-text-muted">{index + 1}</td>
      <td className="py-3 px-4 text-text-primary">{cat.name_en}</td>
      <td className="py-3 px-4 text-text-secondary">{cat.name_lo || "—"}</td>
      <td className="py-3 px-4 text-center">
        <div className="flex justify-center gap-3">
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
