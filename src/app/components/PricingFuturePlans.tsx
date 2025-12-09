"use client";

import { useState, useEffect } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/service/firebase";
import en from "@/lib/i18n/en";
import lo from "@/lib/i18n/lo";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function PricingFuturePlans() {
  const { t, currentLanguage } = useTranslationContext();
  const translations = currentLanguage === "lo" ? lo : en;
  const { user } = useAuth();
  const router = useRouter();

  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileExists, setProfileExists] = useState<boolean>(false);

  /** ✅ Check profile + plan on mount */
  useEffect(() => {
    async function verifyUserProfileAndPlan() {
      if (!user?.uid) {
        setInitializing(false);
        return;
      }

      try {
        const profileRef = doc(db, "profiles", user.uid);
        const snapshot = await getDoc(profileRef);

        if (!snapshot.exists()) {
          setProfileExists(false);

          toast.error(
            currentLanguage === "lo"
              ? "ບັນຊີຂອງທ່ານຍັງບໍ່ສົມບູນ, ກະລຸນາລົງທະບຽນໃຫ້ສົມບູນ!"
              : "Your account setup is incomplete. Please complete your registration!",
            {
              position: "top-right",
              autoClose: 2500,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "colored",
            }
          );

          setTimeout(() => router.push("/complete-profile"), 2000);
          return;
        }

        setProfileExists(true);

        const data = snapshot.data();
        const plan = data.plan || null;

        if (!plan) {
          await updateDoc(profileRef, {
            plan: "basic",
            planStatus: "active",
            planStartDate: serverTimestamp(),
            planEndDate: null,
            updatedAt: serverTimestamp(),
          });
          setUserPlan("basic");
        } else {
          setUserPlan(plan);
        }
      } catch (err) {
        //console.error("Error verifying user profile:", err);
        toast.error(
          currentLanguage === "lo"
            ? "ມີບັນຫາໃນການກວດສອບບັນຊີ."
            : "Error verifying account. Please try again later.",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            theme: "colored",
          }
        );
      } finally {
        setInitializing(false);
      }
    }

    verifyUserProfileAndPlan();
  }, [user]);

  /** ✅ Handle subscription navigation */
  const goToSubscriptionPage = (plan: "pro") => {
    if (!user) {
      toast.warn(
        currentLanguage === "lo"
          ? "⚠️ ກະລຸນາເຂົ້າລະບົບກ່ອນ!"
          : "⚠️ Please sign in first to subscribe!",
        { position: "top-right", autoClose: 3000, theme: "colored" }
      );
      return;
    }

    if (!profileExists) {
      toast.error(
        currentLanguage === "lo"
          ? "ບັນຊີຂອງທ່ານຍັງບໍ່ມີໃນຖານຂໍ້ມູນ."
          : "Your account profile is missing in database!",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
      return;
    }

    setLoadingPlan(plan);
    router.push(`/billing/subscribe?plan=${plan}`);
  };

  /** 🕐 Loading state */
  if (initializing) {
    return (
      <section className="py-20 text-center text-text-secondary">
        <p>{t("common.loading") || "Loading subscription info..."}</p>
      </section>
    );
  }

  /** 🚫 Block UI if profile missing */
  if (!profileExists) {
    return (
      <section className="py-20 text-center text-error">
        <p>
          {currentLanguage === "lo"
            ? "ກຳລັງເປີດທາງໄປຫາໜ້າລົງທະບຽນ..."
            : "Redirecting to registration..."}
        </p>
      </section>
    );
  }

  /** ✅ Normal pricing UI */
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-background-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
            {t("pricing.futurePlans.title")}
          </h2>
          <p className="text-lg text-text-secondary max-w-3xl mx-auto">
            {t("pricing.futurePlans.subtitle")}
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* ---------- BASIC (Free) ---------- */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {t("pricing.futurePlans.basic.title")}
              </h3>
              <div className="text-3xl font-bold text-text-primary">Free</div>
              <div className="text-text-secondary">
                {t("pricing.futurePlans.basic.period")}
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {translations.pricing.futurePlans.basic.features.map(
                (feature: string, i: number) => (
                  <li key={i} className="flex items-center text-text-secondary">
                    <svg
                      className="w-4 h-4 text-success mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                )
              )}
            </ul>
            <div className="text-center text-success font-medium">
              {userPlan === "basic"
                ? "You have the Basic plan"
                : "Free plan included"}
            </div>
          </div>

          {/* ---------- PRO (50 000 ₭) ---------- */}
          <div className="bg-white rounded-xl shadow-sm border border-primary p-6 relative flex flex-col">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                {t("pricing.futurePlans.pro.badge")}
              </span>
            </div>
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {t("pricing.futurePlans.pro.title")}
              </h3>
              <div className="text-3xl font-bold text-text-primary">
                ₭ 50,000
              </div>
              <div className="text-text-secondary">
                {t("pricing.futurePlans.pro.period")}
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {translations.pricing.futurePlans.pro.features.map(
                (feature: string, i: number) => (
                  <li key={i} className="flex items-center text-text-secondary">
                    <svg
                      className="w-4 h-4 text-success mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                )
              )}
            </ul>
            <button
              suppressHydrationWarning
              onClick={() => goToSubscriptionPage("pro")}
              disabled={loadingPlan === "pro"}
              className="btn btn-primary w-full"
            >
              {loadingPlan === "pro"
                ? "Processing..."
                : t("pricing.futurePlans.pro.cta")}
            </button>
            <p className="text-xs text-text-secondary text-center mt-2">
              {t("pricing.futurePlans.pro.ctaNote")}
            </p>
          </div>

          {/* ---------- ENTERPRISE (Contact Admin) ---------- */}
          <div className="bg-white rounded-xl shadow-sm border border-border p-6 flex flex-col">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                {t("pricing.futurePlans.enterprise.title")}
              </h3>
              <div className="text-3xl font-bold text-text-primary">Custom</div>
              <div className="text-text-secondary">
                {t("pricing.futurePlans.enterprise.period")}
              </div>
            </div>
            <ul className="space-y-3 mb-6 flex-1">
              {translations.pricing.futurePlans.enterprise.features.map(
                (feature: string, i: number) => (
                  <li key={i} className="flex items-center text-text-secondary">
                    <svg
                      className="w-4 h-4 text-success mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {feature}
                  </li>
                )
              )}
            </ul>
            <a
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline w-full"
            >
              💬 Contact Admin
            </a>
            <p className="text-xs text-text-secondary text-center mt-2">
              For enterprise access, please message our admin.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
