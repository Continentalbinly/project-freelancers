"use client";

export default function ProfileTabs({ activeTab, setActiveTab, t }: any) {
  const tabs = [
    { id: "overview", label: t("profile.overview"), icon: "📊" },
    { id: "portfolio", label: t("profile.portfolio"), icon: "🎨" },
    { id: "skills", label: t("profile.skills"), icon: "⚡" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border">
      <nav className="flex space-x-8 px-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
