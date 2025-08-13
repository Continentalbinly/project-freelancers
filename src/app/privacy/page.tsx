'use client'

import { useTranslationContext } from '@/app/components/LanguageProvider'
import en from '@/lib/i18n/en'
import lo from '@/lib/i18n/lo'

export default function PrivacyPage() {
  const { t, currentLanguage } = useTranslationContext()

  // Get the current translations object
  const translations = currentLanguage === 'lo' ? lo : en

  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-light to-secondary-light py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6">
              {t('privacyPage.title')}
            </h1>
            <p className="text-lg sm:text-xl lg:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
              {t('privacyPage.subtitle')}
            </p>
            <p className="text-sm text-text-secondary">
              {t('privacyPage.lastUpdated')}
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Content */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8">
              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.introduction.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.introduction.content')}
                </p>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.introduction.agreement')}
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.informationWeCollect.title')}</h2>

                <h3 className="text-xl font-semibold text-text-primary mb-3">{t('privacyPage.sections.informationWeCollect.personalInfo.title')}</h3>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.informationWeCollect.personalInfo.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.informationWeCollect.personalInfo.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>

                <h3 className="text-xl font-semibold text-text-primary mb-3">{t('privacyPage.sections.informationWeCollect.automaticInfo.title')}</h3>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.informationWeCollect.automaticInfo.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.informationWeCollect.automaticInfo.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* How We Use Information */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.howWeUseInformation.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.howWeUseInformation.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.howWeUseInformation.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Information Sharing */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.informationSharing.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.informationSharing.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.informationSharing.items.map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item.label}</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Data Security */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.dataSecurity.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.dataSecurity.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.dataSecurity.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.dataSecurity.note')}
                </p>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.yourRights.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.yourRights.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.yourRights.items.map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item.label}</strong> {item.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cookies */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.cookies.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.cookies.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.cookies.items.map((item: any, index: number) => (
                    <li key={index}>
                      <strong>{item.label}</strong> {item.text}
                    </li>
                  ))}
                </ul>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.cookies.note')}
                </p>
              </div>

              {/* Third-Party Services */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.thirdPartyServices.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.thirdPartyServices.description')}
                </p>
                <ul className="list-disc list-inside text-text-secondary mb-4 space-y-2">
                  {translations.privacyPage.sections.thirdPartyServices.items.map((item: string, index: number) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.thirdPartyServices.note')}
                </p>
              </div>

              {/* Children's Privacy */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.childrenPrivacy.title')}</h2>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.childrenPrivacy.content')}
                </p>
              </div>

              {/* International Users */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.internationalUsers.title')}</h2>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.internationalUsers.content')}
                </p>
              </div>

              {/* Changes to Policy */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.changesToPolicy.title')}</h2>
                <p className="text-text-secondary">
                  {t('privacyPage.sections.changesToPolicy.content')}
                </p>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-4">{t('privacyPage.sections.contactUs.title')}</h2>
                <p className="text-text-secondary mb-4">
                  {t('privacyPage.sections.contactUs.description')}
                </p>
                <div className="bg-background-secondary rounded-lg p-6">
                  <p className="text-text-secondary mb-2">
                    <strong>{t('privacyPage.sections.contactUs.email')}</strong> {t('privacyPage.sections.contactUs.emailAddress')}
                  </p>
                  <p className="text-text-secondary mb-2">
                    <strong>{t('privacyPage.sections.contactUs.address')}</strong> {t('privacyPage.sections.contactUs.addressValue')}
                  </p>
                  <p className="text-text-secondary">
                    <strong>{t('privacyPage.sections.contactUs.phone')}</strong> {t('privacyPage.sections.contactUs.phoneNumber')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 