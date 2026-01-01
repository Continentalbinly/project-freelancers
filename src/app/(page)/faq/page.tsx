"use client";

import Link from "next/link";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useState } from "react";
import MarketingLayout from "../components/MarketingLayout";
import MarketingHero from "../components/MarketingHero";
import MarketingSection from "../components/MarketingSection";
import FAQAccordion from "../components/FAQAccordion";
import CTA from "../components/CTA";

interface FAQItem {
  question: string;
  answer: string;
  category: "general" | "freelancers" | "clients" | "payments" | "technical";
}

export default function FAQPage() {
  const { t } = useTranslationContext();
  const [activeCategory, setActiveCategory] = useState<
    "all" | "general" | "freelancers" | "clients" | "payments" | "technical"
  >("all");

  const faqData: FAQItem[] = [
    // General Questions
    {
      question: t("faq.questions.whatIsUniJobs.question"),
      answer: t("faq.questions.whatIsUniJobs.answer"),
      category: "general",
    },
    {
      question: t("faq.questions.howDoesItWork.question"),
      answer: t("faq.questions.howDoesItWork.answer"),
      category: "general",
    },
    {
      question: t("faq.questions.isItFree.question"),
      answer: t("faq.questions.isItFree.answer"),
      category: "general",
    },
    {
      question: t("faq.questions.projectTypes.question"),
      answer: t("faq.questions.projectTypes.answer"),
      category: "general",
    },

    // Freelancer Questions
    {
      question: t("faq.questions.howToStartAsFreelancer.question"),
      answer: t("faq.questions.howToStartAsFreelancer.answer"),
      category: "freelancers",
    },
    {
      question: t("faq.questions.whatSkillsNeeded.question"),
      answer: t("faq.questions.whatSkillsNeeded.answer"),
      category: "freelancers",
    },
    {
      question: t("faq.questions.howMuchCanIEarn.question"),
      answer: t("faq.questions.howMuchCanIEarn.answer"),
      category: "freelancers",
    },
    {
      question: t("faq.questions.howDoIGetPaid.question"),
      answer: t("faq.questions.howDoIGetPaid.answer"),
      category: "freelancers",
    },
    {
      question: t("faq.questions.whatIfICantComplete.question"),
      answer: t("faq.questions.whatIfICantComplete.answer"),
      category: "freelancers",
    },

    // Client Questions
    {
      question: t("faq.questions.howToPostProject.question"),
      answer: t("faq.questions.howToPostProject.answer"),
      category: "clients",
    },
    {
      question: t("faq.questions.howToChooseFreelancer.question"),
      answer: t("faq.questions.howToChooseFreelancer.answer"),
      category: "clients",
    },
    {
      question: t("faq.questions.whatIfNotSatisfied.question"),
      answer: t("faq.questions.whatIfNotSatisfied.answer"),
      category: "clients",
    },
    {
      question: t("faq.questions.howMuchToBudget.question"),
      answer: t("faq.questions.howMuchToBudget.answer"),
      category: "clients",
    },
    {
      question: t("faq.questions.canIHireSameFreelancer.question"),
      answer: t("faq.questions.canIHireSameFreelancer.answer"),
      category: "clients",
    },

    // Payment Questions
    {
      question: t("faq.questions.howDoPaymentsWork.question"),
      answer: t("faq.questions.howDoPaymentsWork.answer"),
      category: "payments",
    },
    {
      question: t("faq.questions.whatPaymentMethods.question"),
      answer: t("faq.questions.whatPaymentMethods.answer"),
      category: "payments",
    },
    {
      question: t("faq.questions.whenDoFreelancersGetPaid.question"),
      answer: t("faq.questions.whenDoFreelancersGetPaid.answer"),
      category: "payments",
    },
    {
      question: t("faq.questions.areThereFees.question"),
      answer: t("faq.questions.areThereFees.answer"),
      category: "payments",
    },

    // Technical Questions
    {
      question: t("faq.questions.technicalIssues.question"),
      answer: t("faq.questions.technicalIssues.answer"),
      category: "technical",
    },
    {
      question: t("faq.questions.isDataSecure.question"),
      answer: t("faq.questions.isDataSecure.answer"),
      category: "technical",
    },
    {
      question: t("faq.questions.canIUseOnMobile.question"),
      answer: t("faq.questions.canIUseOnMobile.answer"),
      category: "technical",
    },
    {
      question: t("faq.questions.howToUpdateProfile.question"),
      answer: t("faq.questions.howToUpdateProfile.answer"),
      category: "technical",
    },
  ];

  const categories = [
    { id: "all", name: t("faq.categories.all") },
    { id: "general", name: t("faq.categories.general") },
    { id: "freelancers", name: t("faq.categories.freelancers") },
    { id: "clients", name: t("faq.categories.clients") },
    { id: "payments", name: t("faq.categories.payments") },
    { id: "technical", name: t("faq.categories.technical") },
  ];

  const filteredFAQ =
    activeCategory === "all"
      ? faqData
      : faqData.filter((item) => item.category === activeCategory);

  const faqItems = filteredFAQ.map((item) => ({
    question: item.question,
    answer: item.answer,
  }));

  return (
    <MarketingLayout>
      <MarketingHero
        title={t("faq.title")}
        subtitle={t("faq.subtitle")}
      />

      {/* FAQ Content */}
      <MarketingSection>
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() =>
                  setActiveCategory(
                    category.id as
                      | "freelancers"
                      | "all"
                      | "general"
                      | "clients"
                      | "payments"
                      | "technical"
                  )
                }
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  activeCategory === category.id
                    ? "bg-primary text-white shadow-md"
                    : "text-text-secondary hover:text-primary border border-border hover:border-primary/40"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        {filteredFAQ.length > 0 ? (
          <FAQAccordion items={faqItems} />
        ) : (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">
              {t("faq.noResults")}
            </p>
          </div>
        )}
      </MarketingSection>

      {/* Contact Section */}
      <CTA
        title={t("faq.contactSection.title")}
        subtitle={t("faq.contactSection.subtitle")}
        primaryCTA={{
          label: t("faq.contactSection.contactSupport"),
          href: "/contact",
        }}
        secondaryCTA={{
          label: t("faq.contactSection.helpCenter"),
          href: "/help",
        }}
        variant="solid"
      />
    </MarketingLayout>
  );
}
