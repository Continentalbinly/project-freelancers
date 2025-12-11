"use client";

export default function Money({ amount, t }: any) {
  const lang = t("lang"); // from translation JSON

  // Currency words
  const label =
    lang === "lo"
      ? t("money.currency.lak_lo") // ກີບ
      : t("money.currency.lak"); // LAK

  return (
    <span>
      {amount?.toLocaleString()} {label}
    </span>
  );
}
