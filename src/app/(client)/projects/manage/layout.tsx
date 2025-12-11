"use client";


export default function ManageProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 min-h-screen">
      {/* Page Content */}
      <div>{children}</div>
    </div>
  );
}
