"use client";

export default function TopupStepper({ step, t }: any) {
  const steps = [
    { id: "select", label: t("topup.stepSelect") },
    { id: "payment", label: t("topup.stepPayment") },
    { id: "pending", label: t("topup.stepPending") },
  ];

  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((s, index) => {
          const isActive = index <= currentIndex;

          return (
            <div key={s.id} className="flex-1 flex flex-col items-center">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border
                  ${
                    isActive
                      ? "bg-primary text-white border-primary"
                      : "border-border text-text-secondary"
                  }
                `}
              >
                {index + 1}
              </div>

              <p
                className={`text-xs mt-2 text-center whitespace-nowrap
                  ${
                    isActive
                      ? "text-primary font-medium"
                      : "text-text-secondary"
                  }
                `}
              >
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Progress Bar (below circles) */}
      <div className="relative mt-4 h-1 bg-border rounded-full">
        <div
          className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
