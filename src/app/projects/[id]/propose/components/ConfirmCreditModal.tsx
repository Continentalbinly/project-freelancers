"use client";

import { Dialog } from "@headlessui/react";

export default function ConfirmCreditModal({
  open,
  onClose,
  onConfirm,
  fee,
  hasEnoughCredit,
  t,
}: any) {
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full border border-border">
          <Dialog.Title className="text-lg font-semibold text-text-primary mb-2">
            {hasEnoughCredit
              ? t("proposePage.confirmSubmission")
              : t("proposePage.notEnoughCreditsTitle")}
          </Dialog.Title>

          <p className="text-text-secondary mb-4">
            {hasEnoughCredit ? (
              <>
                {t("proposePage.costToSubmit")}{" "}
                <span className="font-semibold">{fee}</span>{" "}
                {t("common.credits")}. <br />
                {t("proposePage.confirmToSubmit")}
              </>
            ) : (
              <>
                {t("proposePage.thisProjectRequires")}{" "}
                <span className="font-semibold">{fee}</span>{" "}
                {t("common.credits")}. <br />
                {t("proposePage.notEnoughCreditsMessage")}
              </>
            )}
          </p>

          <div className="flex justify-end gap-2">
            {/* Cancel */}
            <button className="btn btn-outline" onClick={onClose}>
              {t("common.cancel")}
            </button>

            {/* Main Action */}
            {hasEnoughCredit ? (
              <button className="btn btn-primary" onClick={onConfirm}>
                {t("proposePage.submitNow")}
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => (window.location.href = "/wallet/top-up")}
              >
                {t("proposePage.topUpCredits")}
              </button>
            )}
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
