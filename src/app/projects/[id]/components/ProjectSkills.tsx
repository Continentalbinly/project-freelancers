export default function ProjectSkills({ skills, t }: any) {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-text-primary mb-3">
        {t("projectDetail.skillsRequired")}
      </h3>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill: string, i: number) => (
          <span
            key={i}
            className="px-3 py-1 bg-primary-light text-primary text-sm rounded-full font-medium"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
