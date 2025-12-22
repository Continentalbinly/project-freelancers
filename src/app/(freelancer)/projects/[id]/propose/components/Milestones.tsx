"use client";

import {
  PlusIcon,
  XMarkIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

interface MilestonesProps {
  t: (key: string) => string;
  milestones: Milestone[];
  setMilestones: (milestones: Milestone[]) => void;
}

export default function Milestones({ t, milestones, setMilestones }: MilestonesProps) {
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  const addMilestone = () => {
    if (newItem.title && newItem.description && newItem.dueDate) {
      setMilestones([
        ...milestones,
        {
          ...newItem,
          id: Date.now().toString(),
        },
      ]);
      setNewItem({ title: "", description: "", dueDate: "" });
      setShowForm(false);
    }
  };

  const removeMilestone = (id: string) =>
    setMilestones(milestones.filter((m: Milestone) => m.id !== id));

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-medium  ">
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

      {/* Existing milestones list */}
      {milestones.map((m: Milestone) => (
        <div
          key={m.id}
          className="flex items-center justify-between bg-background-secondary rounded-lg px-4 py-3 mb-2"
        >
          <div className="text-sm">
            <div className="font-medium  ">{m.title}</div>
            <div className="text-xs text-text-secondary">{m.description}</div>
            <div className="text-xs text-text-secondary flex items-center gap-1 mt-1">
              <CalendarDaysIcon className="w-3.5 h-3.5 text-primary/70" />
              <span>
                {t("proposePage.dueDate")}:{" "}
                <strong className=" ">
                  {new Date(m.dueDate).toLocaleDateString()}
                </strong>
              </span>
            </div>
          </div>
          <button
            onClick={() => removeMilestone(m.id)}
            className="text-error hover:text-error/80 transition"
            title={t("proposePage.removeMilestone")}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      ))}

      {/* Add form */}
      {showForm && (
        <div className="bg-background-secondary rounded-lg p-4 mt-3">
          <input
            type="text"
            placeholder={t("proposePage.milestoneTitlePlaceholder")}
            value={newItem.title}
            onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
            className="w-full px-3 py-2 border border-border rounded-lg mb-2 text-sm bg-background focus:ring-2 focus:ring-primary"
          />
          <textarea
            placeholder={t("proposePage.milestoneDescriptionPlaceholder")}
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-border rounded-lg mb-2 text-sm bg-background focus:ring-2 focus:ring-primary"
            rows={2}
          />
          <div className="relative mb-3">
            <label className="block text-xs text-text-secondary mb-1">
              {t("proposePage.milestoneDueDateLabel")}
            </label>
            <div className="flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4 text-primary/70" />
              <input
                type="date"
                value={newItem.dueDate}
                onChange={(e) =>
                  setNewItem({ ...newItem, dueDate: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Buttons */}
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
