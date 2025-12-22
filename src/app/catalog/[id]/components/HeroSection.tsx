interface HeroSectionProps {
  images: string[];
  title: string;
  categoryName: string;
  isOwner: boolean;
  status: string;
  tags?: string[];
  t?: (key: string) => string;
}

export default function HeroSection({
  images,
  title,
  categoryName,
  isOwner,
  status,
  tags,
  t,
}: HeroSectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="relative h-64 sm:h-80 rounded-md overflow-hidden shadow-2xl mb-12 mt-6">
      <img
        src={images[0]}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              {title}
            </h1>
            <div className="flex flex-col gap-3">
              {categoryName && (
                <span className="inline-block px-4 py-2 rounded-full bg-primary dark:bg-primary-dark text-white text-sm font-semibold w-fit">
                  {categoryName}
                </span>
              )}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {isOwner && (
            <div
              className={`px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2 ${
                status === "draft"
                  ? "bg-warning/20 text-warning border border-warning/30"
                  : "bg-success/20 text-success border border-success/30"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "draft"
                    ? "bg-warning"
                    : "bg-success animate-pulse"
                }`}
              ></span>
              {status === "draft" ? "Draft" : "Published"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
