export interface TopupSession {
  userId?: string;
  step: "select" | "qr" | "pending" | "success" | "expired";
  qrCode?: string | null;
  transactionId?: string | null;
  expiresAt?: number | null;
  status?: string | null;
  expiredAt?: number;
  createdAt?: unknown;
}

export interface TopupPackage {
  price: number;
  credits: number;
  popular?: boolean;
}

export type UpdateSessionFunction = (data: Partial<TopupSession>) => Promise<void>;

