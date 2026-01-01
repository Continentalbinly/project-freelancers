import BackButton from "@/app/components/BackButton";

export default function MyProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
      <BackButton />
      {children}
    </div>
  );
}
