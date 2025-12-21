import BackButton from "../components/BackButton"

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BackButton />
      {children}
    </div>
  )
} 