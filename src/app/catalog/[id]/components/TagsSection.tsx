interface TagsSectionProps {
  tags: string[];
  t: (key: string) => string;
}

export default function TagsSection({ tags, t }: TagsSectionProps) {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="bg-background dark:bg-background-dark border border-border/50 dark:border-border-dark/50 rounded-2xl p-8 shadow-sm">
      <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
        {t("catalogDetail.tags")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-4 py-2 rounded-full bg-primary/10 dark:bg-primary-dark/20 border border-primary/30 dark:border-primary-dark/40 text-sm text-primary dark:text-primary-dark font-medium hover:bg-primary/20 dark:hover:bg-primary-dark/30 transition-colors cursor-pointer"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
