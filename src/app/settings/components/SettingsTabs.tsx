import { useTranslationContext } from "@/app/components/LanguageProvider";

interface Props {
  activeTab: string;
  onChange: (tab: string) => void;
}

export default function SettingsTabs({ activeTab, onChange }: Props) {
  const { t } = useTranslationContext();
  const tabs = [
    { id: "notifications", label: t("settings.notifications"), icon: "🔔" },
    { id: "privacy", label: t("settings.privacy"), icon: "🔒" },
    { id: "account", label: t("settings.account"), icon: "⚙️" },
  ];

  return (
    <nav className="flex border-b border-border space-x-8 px-6">
      {tabs.map((tab) => (
        <button suppressHydrationWarning
          key={tab.id}
          onClick={() => onChange(tab.id)}
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
  );
}
