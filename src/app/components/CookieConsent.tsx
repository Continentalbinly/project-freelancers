'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import cookiesImage from '../../images/assets/cookies.png'
import { useTranslationContext } from '@/app/components/LanguageProvider'

interface CookiePreferences {
    essential: boolean
    performance: boolean
    functionality: boolean
    targeting: boolean
}

export default function CookieConsent() {
    const { t } = useTranslationContext()
    const [showBanner, setShowBanner] = useState(false)
    const [showPreferences, setShowPreferences] = useState(false)
    const [preferences, setPreferences] = useState<CookiePreferences>({
        essential: true, // Always true, cannot be disabled
        performance: false,
        functionality: false,
        targeting: false
    })

    useEffect(() => {
        // Check if user has already made a choice
        const cookieConsent = localStorage.getItem('cookieConsent')
        if (!cookieConsent) {
            setShowBanner(true)
        }
    }, [])

    const handleAcceptAll = () => {
        const allAccepted = {
            essential: true,
            performance: true,
            functionality: true,
            targeting: true
        }
        localStorage.setItem('cookieConsent', JSON.stringify(allAccepted))
        localStorage.setItem('cookieConsentDate', new Date().toISOString())
        setShowBanner(false)
    }

    const handleAcceptSelected = () => {
        localStorage.setItem('cookieConsent', JSON.stringify(preferences))
        localStorage.setItem('cookieConsentDate', new Date().toISOString())
        setShowBanner(false)
    }

    const handleRejectAll = () => {
        const onlyEssential = {
            essential: true,
            performance: false,
            functionality: false,
            targeting: false
        }
        localStorage.setItem('cookieConsent', JSON.stringify(onlyEssential))
        localStorage.setItem('cookieConsentDate', new Date().toISOString())
        setShowBanner(false)
    }

    const togglePreference = (type: keyof CookiePreferences) => {
        if (type === 'essential') return // Essential cookies cannot be disabled
        setPreferences(prev => ({
            ...prev,
            [type]: !prev[type]
        }))
    }

    if (!showBanner) return null

    return (
        <>
            {/* Cookie Banner */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-lg z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <Image src={cookiesImage} alt="Cookies" width={40} height={40} className="w-8 h-8 sm:w-10 sm:h-10" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-text-primary mb-2">
                                        {t('cookieConsent.bannerTitle')}
                                    </h3>
                                    <p className="text-xs sm:text-sm text-text-secondary mb-4 lg:mb-0">
                                        {t('cookieConsent.bannerDesc')}
                                        <Link href="/cookies" className="text-primary hover:underline ml-1">
                                            {t('learnMore')}
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                            <button suppressHydrationWarning
                                onClick={() => setShowPreferences(true)}
                                className="btn btn-outline btn-sm"
                            >
                                {t('customize')}
                            </button>
                            <button suppressHydrationWarning
                                onClick={handleRejectAll}
                                className="btn btn-outline btn-sm"
                            >
                                {t('cookieConsent.rejectAll')}
                            </button>
                            <button suppressHydrationWarning
                                onClick={handleAcceptAll}
                                className="btn btn-primary btn-sm"
                            >
                                {t('cookieConsent.acceptAll')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cookie Preferences Modal */}
            {showPreferences && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                        <Image src={cookiesImage} alt="Cookies" width={30} height={30} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-text-primary">
                                        {t('cookieConsent.preferences')}
                                    </h2>
                                </div>
                                <button suppressHydrationWarning
                                    onClick={() => setShowPreferences(false)}
                                    className="text-text-secondary hover:text-text-primary transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Essential Cookies */}
                                <div className="border border-border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-text-primary">
                                                {t('cookieConsent.essentialCookies')}
                                            </h3>
                                            <p className="text-sm text-text-secondary">
                                                {t('cookieConsent.essentialCookiesDesc')}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <input suppressHydrationWarning
                                                type="checkbox"
                                                checked={preferences.essential}
                                                disabled
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary">
                                        {t('cookieConsent.essentialCookiesDetail')}
                                    </p>
                                </div>

                                {/* Performance Cookies */}
                                <div className="border border-border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-text-primary">
                                                {t('cookieConsent.performanceCookies')}
                                            </h3>
                                            <p className="text-sm text-text-secondary">
                                                {t('cookieConsent.performanceCookiesDesc')}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <input suppressHydrationWarning
                                                type="checkbox"
                                                checked={preferences.performance}
                                                onChange={() => togglePreference('performance')}
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary">
                                        {t('cookieConsent.performanceCookiesDetail')}
                                    </p>
                                </div>

                                {/* Functionality Cookies */}
                                <div className="border border-border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-text-primary">
                                                {t('cookieConsent.functionalityCookies')}
                                            </h3>
                                            <p className="text-sm text-text-secondary">
                                                {t('cookieConsent.functionalityCookiesDesc')}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <input suppressHydrationWarning
                                                type="checkbox"
                                                checked={preferences.functionality}
                                                onChange={() => togglePreference('functionality')}
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary">
                                        {t('cookieConsent.functionalityCookiesDetail')}
                                    </p>
                                </div>

                                {/* Targeting Cookies */}
                                <div className="border border-border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <h3 className="font-semibold text-text-primary">
                                                {t('cookieConsent.targetingCookies')}
                                            </h3>
                                            <p className="text-sm text-text-secondary">
                                                {t('cookieConsent.targetingCookiesDesc')}
                                            </p>
                                        </div>
                                        <div className="flex items-center">
                                            <input suppressHydrationWarning
                                                type="checkbox"
                                                checked={preferences.targeting}
                                                onChange={() => togglePreference('targeting')}
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary">
                                        {t('cookieConsent.targetingCookiesDetail')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
                                <button suppressHydrationWarning
                                    onClick={handleRejectAll}
                                    className="btn btn-outline flex-1"
                                >
                                    {t('cookieConsent.rejectAll')}
                                </button>
                                <button suppressHydrationWarning
                                    onClick={handleAcceptSelected}
                                    className="btn btn-primary flex-1"
                                >
                                    {t('cookieConsent.savePreferences')}
                                </button>
                            </div>

                            <p className="text-xs text-text-secondary mt-4 text-center">
                                {t('cookieConsent.policyLink')}{' '}
                                <Link href="/cookies" className="text-primary hover:underline">
                                    {t('cookies')}
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
} 