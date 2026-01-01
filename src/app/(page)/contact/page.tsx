"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const { t } = useTranslationContext();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("contact.title")}
        subtitle={t("contact.subtitle")}
      />

      {/* Contact Form & Info */}
      <MarketingSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              {t("contact.sendMessage")}
            </h2>

            {submitted ? (
              <div className="rounded-2xl border border-success/30 bg-success/10 p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-success mr-3" />
                  <h3 className="text-lg font-semibold text-success">
                    {t("contact.successTitle")}
                  </h3>
                </div>
                <p className="text-text-secondary mb-4">
                  {t("contact.successMessage")}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-primary hover:text-primary-hover font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {t("contact.sendAnother")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    {t("contact.fullName")}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg text-text-primary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t("contact.fullNamePlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    {t("contact.email")}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg text-text-primary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t("contact.emailPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    {t("contact.subject")}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg text-text-primary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    placeholder={t("contact.subjectPlaceholder")}
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-text-primary mb-2"
                  >
                    {t("contact.message")}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg text-text-primary bg-background placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all duration-200"
                    placeholder={t("contact.messagePlaceholder")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white hover:bg-primary-hover py-3 px-6 rounded-lg text-lg font-semibold shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {loading ? t("contact.sending") : t("contact.sendMessageButton")}
                </button>
              </form>
            )}
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              {t("contact.getInTouch")}
            </h2>

            <div className="space-y-8">
              {/* Email */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t("contact.emailSupport")}
                  </h3>
                  <p className="text-text-secondary mb-2">
                    {t("contact.emailAddress")}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t("contact.emailResponse")}
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center shrink-0">
                  <Phone className="w-6 h-6 text-success" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t("contact.phoneSupport")}
                  </h3>
                  <p className="text-text-secondary mb-2">
                    {t("contact.phoneNumber")}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t("contact.phoneHours")}
                  </p>
                </div>
              </div>

              {/* Office */}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {t("contact.officeAddress")}
                  </h3>
                  <p className="text-text-secondary mb-2 whitespace-pre-line">
                    {t("contact.officeLocation")}
                  </p>
                  <p className="text-sm text-text-muted">
                    {t("contact.officeNote")}
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Link */}
            <div className="mt-8 p-6 rounded-2xl border border-border bg-background-secondary">
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {t("contact.quickHelp")}
              </h3>
              <p className="text-text-secondary mb-4">
                {t("contact.quickHelpDesc")}
              </p>
              <Link
                href="/faq"
                className="text-primary hover:text-primary-hover font-medium transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {t("contact.viewFaq")} →
              </Link>
            </div>
          </div>
        </div>
      </MarketingSection>

      {/* FAQ Preview */}
      <MarketingSection background="secondary">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mb-4">
            {t("contact.faqTitle")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("contact.faqSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* FAQ Item 1 */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {t("contact.faqStudentTitle")}
            </h3>
            <p className="text-text-secondary">{t("contact.faqStudentAnswer")}</p>
          </div>

          {/* FAQ Item 2 */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {t("contact.faqTeacherTitle")}
            </h3>
            <p className="text-text-secondary">{t("contact.faqTeacherAnswer")}</p>
          </div>

          {/* FAQ Item 3 */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {t("contact.faqPaymentTitle")}
            </h3>
            <p className="text-text-secondary">{t("contact.faqPaymentAnswer")}</p>
          </div>

          {/* FAQ Item 4 */}
          <div className="rounded-2xl border border-border bg-background-secondary p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200">
            <h3 className="text-lg font-semibold text-text-primary mb-3">
              {t("contact.faqDisputeTitle")}
            </h3>
            <p className="text-text-secondary">{t("contact.faqDisputeAnswer")}</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/faq"
            className="inline-flex items-center gap-2 bg-primary text-white hover:bg-primary-hover px-8 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {t("contact.viewAllFaq")}
          </Link>
        </div>
      </MarketingSection>
    </MarketingLayout>
  );
}
