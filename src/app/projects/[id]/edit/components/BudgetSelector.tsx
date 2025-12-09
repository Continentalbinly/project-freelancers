"use client";

import { Dispatch, SetStateAction } from "react";

interface Props {
  formData: any;
  setFormData: Dispatch<SetStateAction<any>>;
  t: (key: string) => string;
}

export default function BudgetSelector({ formData, setFormData, t }: Props) {
  // Same fixed budgets from Step 3
  const predefinedBudgets = [100000, 300000, 500000, 1000000, 2000000, 5000000];

  const handleBudgetSelect = (amount: number) => {
    setFormData((prev: any) => ({
      ...prev,
      budget: amount,
    }));
  };

  const handleCustomBudget = (value: string) => {
    const num = Number(value.replace(/\D/g, "")); // strip non-numbers
    setFormData((prev: any) => ({
      ...prev,
      budget: num,
    }));
  };

  return (
    <div>
      <label className="block text-sm font-semibold mb-2 text-text-primary">
        {t("createProject.projectBudget")}
      </label>

      {/* Predefined buttons */}
      <div className="flex flex-wrap gap-3">
        {predefinedBudgets.map((amount) => {
          const selected = Number(formData.budget) === amount;

          return (
            <button
              key={amount}
              type="button"
              onClick={() => handleBudgetSelect(amount)}
              className={`px-4 py-2 rounded-lg border text-sm cursor-pointer ${
                selected
                  ? "bg-primary text-white border-primary"
                  : "border-border hover:border-primary/40"
              }`}
            >
              ₭{amount.toLocaleString()}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="mt-4">
        <input
          type="text"
          value={
            formData.budget ? Number(formData.budget).toLocaleString() : ""
          }
          onChange={(e) => handleCustomBudget(e.target.value)}
          placeholder={t("createProject.projectBudgetPlaceholder")}
          className="border border-border rounded-lg px-3 py-2 w-full"
        />

        <p className="text-xs text-text-secondary mt-1">
          {t("createProject.projectBudgetNote")}
        </p>
      </div>
    </div>
  );
}
