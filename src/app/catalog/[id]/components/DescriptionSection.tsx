interface DescriptionSectionProps {
  description: string;
  t: (key: string) => string;
}

export default function DescriptionSection({ description, t }: DescriptionSectionProps) {
  return (
    <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
      <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
        {t("catalogDetail.aboutThisService")}
      </h2>
      <p className="text-text-secondary dark:text-text-secondary-dark text-base leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </div>
  );
}
