"use client";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 h-screen overflow-hidden">{children}</div>
  );
}
