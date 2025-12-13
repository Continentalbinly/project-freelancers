import { ReactNode } from "react";
import BackButton from "../components/BackButton";

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <BackButton />
      {children}
    </div>
  );
}
