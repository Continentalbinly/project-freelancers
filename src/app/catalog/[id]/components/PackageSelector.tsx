interface Package {
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
}

interface PackageSelectorProps {
  packages: Package[];
  selectedPkg: number;
  onSelect: (index: number) => void;
  t: (key: string) => string;
}

export default function PackageSelector({
  packages,
  selectedPkg,
  onSelect,
  t,
}: PackageSelectorProps) {
  return (
    <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-4 space-y-2 shadow-sm">
      <p className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide px-2">
        {t("catalogDetail.choosePackage")}
      </p>
      {packages.map((p, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(idx)}
          className={`w-full p-4 rounded-xl transition-all duration-300 ease-out text-left ${
            selectedPkg === idx
              ? "bg-gradient-to-r from-primary dark:from-primary-dark to-secondary dark:to-secondary-dark text-white shadow-lg shadow-primary/30 dark:shadow-primary-dark/30 transform scale-[1.02]"
              : "bg-background-secondary dark:bg-background-secondary-dark hover:bg-background dark:hover:bg-background border border-border/50 dark:border-border-dark/50 text-text-primary dark:text-text-primary-dark hover:border-primary/50 dark:hover:border-primary-dark/50"
          }`}
        >
          <div
            className={`font-bold text-base ${
              selectedPkg === idx ? "text-white" : ""
            }`}
          >
            {p.name}
          </div>
          <div
            className={`text-lg font-bold mt-1 ${
              selectedPkg === idx
                ? "text-white"
                : "text-primary dark:text-primary-dark"
            }`}
          >
            {p.price?.toLocaleString()} LAK
          </div>
        </button>
      ))}
    </div>
  );
}
