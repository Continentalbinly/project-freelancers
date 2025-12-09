"use client";

export default function TransactionAmount({ tx, t, lang }: any) {
  const formatNumber = (num: number) =>
    num?.toLocaleString(lang === "lo" ? "lo-LA" : "en-US");

  const credits = tx.amount / 1000;

  /** Updated fee/refund colors */
  const creditColorMap: Record<string, string> = {
    posting_fee: "text-red-600", // fee → red
    posting_fee_adjust: "text-red-600", // fee → red
    proposal_fee: "text-red-600", // fee → red

    posting_fee_refund: "text-green-600", // refund → green
    proposal_refund: "text-green-600", // refund → green
  };

  const isCreditType = Object.keys(creditColorMap).includes(tx.type);

  // TOPUP → LAK + credit
  if (tx.type === "topup") {
    return (
      <div className="flex flex-col leading-tight">
        <span>
          {formatNumber(tx.amount)} {t("money.currency.lak")}
        </span>

        <span className="text-green-600 text-xs font-semibold">
          +{credits} {t("money.credit")}
        </span>
      </div>
    );
  }

  // CREDIT TYPES (fees/refunds)
  if (isCreditType) {
    const color = creditColorMap[tx.type];

    return (
      <span className={`${color} font-semibold`}>
        {tx.amount} {t("money.credit")}
      </span>
    );
  }

  // DEFAULT → money
  return (
    <span>
      {formatNumber(tx.amount)} {t("money.currency.lak")}
    </span>
  );
}
