"use client";

export default function Money({ amount }: { amount: number }) {
  return (
    <span>
      {new Intl.NumberFormat("lo-LA", {
        style: "currency",
        currency: "LAK",
        maximumFractionDigits: 0,
      }).format(amount || 0)}
    </span>
  );
}
