"use client";

import StepSelectAmount from "./components/StepSelectAmount";
import StepQRPayment from "./components/StepQRPayment";
import StepSuccess from "./components/StepSuccess";
import StepExpired from "./components/StepExpired";

import { useAuth } from "@/contexts/AuthContext";
import { useTranslationContext } from "../components/LanguageProvider";
import { useTopupSession } from "./hooks/useTopupSession";

export default function TopupPage() {
  const { user } = useAuth();
  const { t } = useTranslationContext();
  const { session, updateSession, initialized } = useTopupSession(user?.uid);

  if (!initialized)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    );
  if (!user)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    );
  if (!session)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <div className="animate-spin h-12 w-12 border-b-2 border-primary rounded-full"></div>
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    );

  const step = session.step || "select";

  return (
    <div className="bg-background py-8 px-4">
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-sm">
        {step === "select" && (
          <StepSelectAmount
            session={session}
            updateSession={updateSession}
            t={t}
            userId={user.uid}
          />
        )}

        {step === "qr" && (
          <StepQRPayment
            session={session}
            updateSession={updateSession}
            t={t}
          />
        )}

        {step === "success" && (
          <StepSuccess t={t} updateSession={updateSession} />
        )}

        {step === "expired" && (
          <StepExpired
            t={t}
            session={session}
            onRetry={() =>
              updateSession({
                step: "select",
                qrCode: null,
                transactionId: null,
                expiresAt: null,
              })
            }
          />
        )}
      </div>
    </div>
  );
}
