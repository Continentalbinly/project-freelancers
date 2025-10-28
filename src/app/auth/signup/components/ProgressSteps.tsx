interface ProgressStepsProps {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="flex justify-center mt-4 sm:mt-6 lg:mt-8 mb-4 sm:mb-6 lg:mb-8">
      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-6">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center text-xs sm:text-sm lg:text-base font-medium transition-all duration-300 ${
                currentStep >= step
                  ? "bg-primary text-white shadow-lg scale-110"
                  : "bg-background-secondary text-text-secondary"
              }`}
            >
              {step}
            </div>
            {step < 3 && (
              <div
                className={`w-4 sm:w-8 lg:w-16 h-1 mx-1 sm:mx-2 lg:mx-4 rounded-full transition-all duration-300 ${
                  currentStep > step ? "bg-primary" : "bg-background-secondary"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
