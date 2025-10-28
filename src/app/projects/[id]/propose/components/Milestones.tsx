"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Milestones({ t, milestones, setMilestones }: any) {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    budget: "",
    dueDate: "",
  });

  const addMilestone = () => {
    if (
      newItem.title &&
      newItem.description &&
      newItem.budget &&
      newItem.dueDate
    ) {
      setMilestones([
        ...milestones,
        {
          ...newItem,
          id: Date.now().toString(),
          budget: Number(newItem.budget),
        },
      ]);
      setNewItem({ title: "", description: "", budget: "", dueDate: "" });
      setShowForm(false);
    }
  };

  const removeMilestone = (id: string) =>
    setMilestones(milestones.filter((m: any) => m.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-text-primary">
          {t("proposePage.milestonesLabel")}
        </label>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="btn btn-outline btn-xs"
        >
          <PlusIcon className="w-4 h-4 mr-1" /> {t("proposePage.addMilestone")}
        </button>
      </div>

      {milestones.map((m: any) => (
        <div
          key={m.id}
          className="flex items-center justify-between bg-background-secondary rounded-lg px-3 py-2 mb-2"
        >
          <div className="text-sm">
            <div className="font-medium text-text-primary">{m.title}</div>
            <div className="text-xs text-text-secondary">{m.description}</div>
            <div className="text-xs text-text-secondary">
              ₭{m.budget.toLocaleString()} — {m.dueDate}
            </div>
          </div>
          <button
            onClick={() => removeMilestone(m.id)}
            className="text-error hover:text-error/80"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}

      {showForm && (
        <div className="bg-background-secondary rounded-lg p-4 mt-2">
          <input
            type="text"
            placeholder={t("proposePage.milestoneTitlePlaceholder")}
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg mb-2 text-sm"
          />
          <textarea
            placeholder={t("proposePage.milestoneDescriptionPlaceholder")}
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg mb-2 text-sm"
            rows={2}
          />
          <div className="grid grid-cols-2 gap-3 mb-2">
            <input
              type="text"
              placeholder={t("proposePage.milestoneDueDatePlaceholder")}
              value={newItem.dueDate}
              onChange={(e) =>
                setNewItem({ ...newItem, dueDate: e.target.value })
              }
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder={t("proposePage.milestoneBudgetPlaceholder")}
              value={newItem.budget}
              onChange={(e) =>
                setNewItem({ ...newItem, budget: e.target.value })
              }
              className="px-3 py-2 border border-border rounded-lg text-sm"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="btn btn-outline btn-xs"
            >
              {t("proposePage.cancel")}
            </button>
            <button
              type="button"
              onClick={addMilestone}
              className="btn btn-primary btn-xs"
            >
              {t("proposePage.add")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
