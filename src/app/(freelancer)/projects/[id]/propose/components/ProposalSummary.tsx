"use client";

export default function ProposalSummary({
  t,
  proposedBudget,
  proposedRate,
  estimatedDuration,
  budgetType,
}: any) {
  return (
    <div className="bg-background-secondary rounded-lg p-4">
      <h3 className="font-semibold   mb-2">
        {t("proposePage.proposalSummary")}
      </h3>
      <div className="text-sm text-text-secondary space-y-1">
        <div>
          <span className="font-medium  ">
            {t("proposePage.budget")}:
          </span>{" "}
          ₭{proposedBudget}
        </div>
        {budgetType === "hourly" && (
          <div>
            <span className="font-medium  ">
              {t("proposePage.hourlyRate")}:
            </span>{" "}
            ₭{proposedRate}
          </div>
        )}
        <div>
          <span className="font-medium  ">
            {t("proposePage.estimatedDuration")}:
          </span>{" "}
          {estimatedDuration}
        </div>
      </div>
    </div>
  );
}
