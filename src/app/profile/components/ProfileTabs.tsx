"use client";

export default function ProfileTabs({ activeTab, setActiveTab, t }: any) {
  const tabs = [
    { id: "overview", label: t("profile.overview"), icon: "📊" },
    { id: "portfolio", label: t("profile.portfolio"), icon: "🎨" },
    { id: "skills", label: t("profile.skills"), icon: "⚡" },
  ];

  return (
    <div className="rounded-xl shadow-sm border border-border dark:border-gray-800">
      <nav className="flex space-x-8 px-6 border-b border-border dark:border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-text-secondary dark:hover:text-gray-100"
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
