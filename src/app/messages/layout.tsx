export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden fixed inset-0 top-16">
      {children}
    </div>
  );
} 