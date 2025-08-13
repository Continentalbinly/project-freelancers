'use client'

import { useTranslationContext } from '@/app/components/LanguageProvider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslationContext();

  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary">{t('authLayout.title')}</h1>
          <p className="mt-2 text-sm sm:text-base text-text-secondary">
            {t('authLayout.subtitle')}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
} 