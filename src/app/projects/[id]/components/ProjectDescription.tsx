export default function ProjectDescription({ description, t }: any) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-3">
        {t("projectDetail.description")}
      </h3>
      <p className="text-text-secondary leading-relaxed whitespace-pre-wrap">
        {description}
      </p>
    </div>
  );
}
