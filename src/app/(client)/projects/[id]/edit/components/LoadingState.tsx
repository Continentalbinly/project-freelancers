export default function LoadingState({ t }: { t: (key: string) => string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-text-secondary">
          {t("editProject.loadingProject")}
        </p>
      </div>
    </div>
  );
}
