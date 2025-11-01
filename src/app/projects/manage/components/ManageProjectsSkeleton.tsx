"use client";

export default function ManageProjectsSkeleton({ t }: any) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-6">
      <div className="text-center mb-6">
        <div className="animate-spin h-10 w-10 mx-auto border-2 border-primary border-t-transparent rounded-full"></div>
        <p className="mt-4 text-text-secondary">
          {t("manageProjects.loading")}
        </p>
      </div>
    </div>
  );
}
