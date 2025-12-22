"use client";

interface ProposalSummaryProps {
  t: (key: string) => string;
  proposedBudget: number;
  proposedRate: number;
  estimatedDuration: string;
  budgetType: "fixed" | "hourly";
}

export default function ProposalSummary({
  t,
  proposedBudget,
  proposedRate,
  estimatedDuration,
  budgetType,
}: ProposalSummaryProps) {
  return (
    <div className="bg-background-secondary rounded-lg p-4">
      <h3 className="font-semibold text-text-primary mb-2">
        {t("proposePage.proposalSummary")}
      </h3>
      <div className="text-sm text-text-secondary space-y-1">
        <div>
          <span className="font-medium text-text-primary">
            {t("proposePage.budget")}:
          </span>{" "}
          ₭{proposedBudget}
        </div>
        {budgetType === "hourly" && (
          <div>
            <span className="font-medium text-text-primary">
              {t("proposePage.hourlyRate")}:
            </span>{" "}
            ₭{proposedRate}
          </div>
        )}
        <div>
          <span className="font-medium text-text-primary">
            {t("proposePage.estimatedDuration")}:
          </span>{" "}
          {estimatedDuration}
        </div>
      </div>
    </div>
  );
}
