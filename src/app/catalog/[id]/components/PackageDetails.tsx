import { Check, RotateCcw } from "lucide-react";

interface Package {
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
  revisionLimit?: number;
}

interface PackageDetailsProps {
  pkg: Package;
  isOwner: boolean;
  status: string;
  t: (key: string) => string;
  onOrderClick?: () => void;
}

export default function PackageDetails({
  pkg,
  isOwner,
  status,
  t,
  onOrderClick,
}: PackageDetailsProps) {
  return (
    <div className="bg-linear-to-br from-primary/10 dark:from-primary-dark/20 via-secondary/5 dark:via-secondary-dark/10 to-primary/5 dark:to-primary-dark/20 border border-primary/30 dark:border-primary-dark/40 rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          {pkg.name}
        </h3>
        <div className="text-4xl font-bold bg-linear-to-r from-primary dark:from-primary-dark to-secondary dark:to-secondary-dark bg-clip-text text-transparent">
          {pkg.price?.toLocaleString()}
        </div>
        <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2">
          {t("catalogDetail.deliveryLabel")} {pkg.deliveryDays} days
        </p>
        {pkg.revisionLimit !== undefined && (
          <p className="text-sm text-text-secondary dark:text-text-secondary-dark mt-2 flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            {t("catalogDetail.revisions") || "Revisions"}: {pkg.revisionLimit}
          </p>
        )}
      </div>

      <div className="border-t border-primary/20 dark:border-primary-dark/30 pt-6 mb-6">
        <h4 className="text-sm font-semibold text-text-primary dark:text-text-primary-dark uppercase tracking-wide mb-4">
          {t("catalogDetail.includedFeatures")}
        </h4>
        <ul className="space-y-3">
          {(pkg.features || []).map((feature, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-success/20 dark:bg-success/30 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-success dark:text-success" />
              </div>
              <span className="text-sm text-text-secondary dark:text-text-secondary-dark font-medium">
                {feature}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {!isOwner && (
        <button 
          onClick={onOrderClick}
          className="w-full bg-linear-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-95"
        >
          {t("catalogDetail.orderNow")}
        </button>
      )}

      {isOwner && (
        <div
          className={`rounded-xl p-4 text-center font-medium text-sm ${
            status === "draft"
              ? "bg-warning/20 text-warning border border-warning/30"
              : "bg-success/20 text-success border border-success/30"
          }`}
        >
          {status === "draft"
            ? t("catalogDetail.draftPreview")
            : t("catalogDetail.liveMarketplace")}
        </div>
      )}
    </div>
  );
}
