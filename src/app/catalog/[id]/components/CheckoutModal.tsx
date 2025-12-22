"use client";

import { useState, useEffect } from "react";
import { X, Coins, AlertCircle, CheckCircle } from "lucide-react";
import { requireDb } from "@/service/firebase";
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";

// Same fee structure as project posting
const CATEGORY_POSTING_FEES: Record<string, number> = {
  // Marketing
  "5qL77RdIESzkpoZjtRoQ": 10,
  // Copy Writing
  ACVAA2l5pPBtmoYllGlp: 10,
  // Design
  GZSyBzgtM66bvWIfkYje: 20,
  // Web Developer
  Kv3AmZ6kgMpqWaXN0MLK: 25,
  // Mobile Developer
  MaDKsBJWM3i6cyh5s1pt: 25,
};

interface Package {
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
  revisionLimit?: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  pkg: Package;
  catalogId: string;
  catalogTitle: string;
  categoryId: string;
  ownerId: string;
  userId: string;
  t: (key: string) => string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  pkg,
  catalogId,
  catalogTitle,
  categoryId,
  ownerId,
  userId,
  t,
}: CheckoutModalProps) {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [orderFee, setOrderFee] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCheckoutData();
    }
  }, [isOpen, userId, categoryId]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError("");

      const db = requireDb();
      // Fetch user credits from profiles collection
      const profileDoc = await getDoc(doc(db, "profiles", userId));
      if (profileDoc.exists()) {
        setUserCredits(profileDoc.data().credit || 0);
      }

      // Fetch category order fee
      const categoryDoc = await getDoc(doc(db, "categories", categoryId));
      if (categoryDoc.exists()) {
        const catData = categoryDoc.data();
        setCategoryName(catData.name_en || "");
        // Try to get postingFee from database, fallback to hardcoded mapping
        const dbFee = catData.postingFee;
        const defaultFee = CATEGORY_POSTING_FEES[categoryId] || 0;
        setOrderFee(dbFee || defaultFee);
      }
    } catch  {
      // Silent fail
      setError("Failed to load checkout information");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (userCredits < orderFee) {
      setError("Insufficient credits. Please top up your account.");
      return;
    }

    try {
      setProcessing(true);
      setError("");

      const newBalance = userCredits - orderFee;

      const db = requireDb();
      // Deduct credits from user profile
      await updateDoc(doc(db, "profiles", userId), {
        credit: newBalance,
      });

      // Create order record
      const orderRef = await addDoc(collection(db, "orders"), {
        catalogId,
        catalogTitle,
        categoryId,
        packageName: pkg.name,
        packagePrice: pkg.price,
        deliveryDays: pkg.deliveryDays,
        features: pkg.features,
        revisionLimit: pkg.revisionLimit || 2,
        revisionCount: 0,
        revisionRequests: [],
        orderFee,
        buyerId: userId,
        sellerId: ownerId,
        status: "pending", // pending, in_progress, completed, cancelled
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Create transaction record (same format as project posting)
      const transactionId = `ORDER-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;

      await addDoc(collection(db, "transactions"), {
        userId,
        transactionId,
        type: "order_placement_fee",
        amount: orderFee,
        currency: "CREDITS",
        status: "completed",
        direction: "out",
        orderId: orderRef.id,
        catalogId,
        categoryId,
        createdAt: serverTimestamp(),
        previousBalance: userCredits,
        newBalance: newBalance,
        description: `Order placed for ${catalogTitle} - ${pkg.name}`,
      });

      // Create notifications for both client and freelancer
      const { createOrderCreatedNotification } = await import("@/app/orders/utils/notificationService");
      const orderData = {
        id: orderRef.id,
        catalogId,
        buyerId: userId,
        sellerId: ownerId,
        packageName: pkg.name,
        catalogTitle,
        status: "pending" as const,
      };
      await createOrderCreatedNotification(orderData, orderFee, userCredits, newBalance);

      setSuccess(true);
      setUserCredits(newBalance);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch  {
      // Silent fail
      setError("Failed to process order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-background dark:bg-background-dark rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] border border-border/50 dark:border-border-dark/50 animate-slideUp flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-primary dark:from-primary-dark to-secondary dark:to-secondary-dark p-6 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              {t("checkout.title") || "Checkout Order"}
            </h2>
            <button
              onClick={onClose}
              disabled={processing}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-primary/30 dark:scrollbar-thumb-primary-dark/30 scrollbar-track-transparent hover:scrollbar-thumb-primary/50 dark:hover:scrollbar-thumb-primary-dark/50" style={{ scrollbarGutter: "stable" }}>
          <div className="p-6 space-y-6">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-background-secondary dark:bg-background-secondary-dark rounded-xl" />
                <div className="h-32 bg-background-secondary dark:bg-background-secondary-dark rounded-xl" />
                <div className="h-16 bg-background-secondary dark:bg-background-secondary-dark rounded-xl" />
              </div>
            ) : success ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
                  {t("checkout.success") || "Order Placed Successfully!"}
                </h3>
                <p className="text-text-secondary dark:text-text-secondary-dark">
                  {t("checkout.successMessage") || "The freelancer will be notified"}
                </p>
              </div>
            ) : (
              <>
                {/* Package Summary */}
                <div className="bg-linear-to-br from-primary/5 dark:from-primary-dark/10 to-secondary/5 dark:to-secondary-dark/10 rounded-xl p-4 border border-primary/20 dark:border-primary-dark/30">
                  <p className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark uppercase tracking-wide mb-2">
                    {t("checkout.selectedPackage") || "Selected Package"}
                  </p>
                  <h3 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-1">
                    {pkg.name}
                  </h3>
                  <p className="text-sm text-text-secondary dark:text-text-secondary-dark mb-2">
                    {catalogTitle}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-primary/20 dark:border-primary-dark/30">
                    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                      {t("checkout.packageValue") || "Package Value"}
                    </span>
                    <span className="text-lg font-bold text-primary dark:text-primary-dark">
                      {pkg.price.toLocaleString()} LAK
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                      {t("checkout.deliveryTime") || "Delivery Time"}
                    </span>
                    <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      {pkg.deliveryDays} {t("checkout.days") || "days"}
                    </span>
                  </div>
                  {typeof pkg.revisionLimit !== "undefined" && (
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-text-secondary dark:text-text-secondary-dark">
                        {t("catalogDetail.revisions") || "Revisions"}
                      </span>
                      <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                        {pkg.revisionLimit}
                      </span>
                    </div>
                  )}
                </div>

                {/* Credit Information */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-background-secondary dark:bg-background-secondary-dark rounded-xl">
                    <div className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-warning" />
                      <span className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                        {t("checkout.yourCredits") || "Your Credits"}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-text-primary dark:text-text-primary-dark">
                      {userCredits.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-primary/10 dark:bg-primary-dark/20 rounded-xl border border-primary/30 dark:border-primary-dark/40">
                    <div>
                      <p className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                        {t("checkout.orderFee") || "Order Placement Fee"}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-text-secondary-dark mt-1">
                        {t("checkout.fixedByCategory") || "Fixed by category"}: {categoryName}
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-primary dark:text-primary-dark">
                      {orderFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-linear-to-r from-success/10 dark:from-success/20 to-success/5 dark:to-success/10 rounded-xl border border-success/30">
                    <span className="text-sm font-semibold text-text-primary dark:text-text-primary-dark">
                      {t("checkout.remainingCredits") || "Remaining Credits"}
                    </span>
                    <span className="text-2xl font-bold text-success">
                      {(userCredits - orderFee).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-error/10 dark:bg-error/20 border border-error/30 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
                    <p className="text-sm text-error">{error}</p>
                  </div>
                )}

                {/* Info Note */}
                <div className="flex items-start gap-3 p-4 bg-primary/5 dark:bg-primary-dark/10 border border-primary/20 dark:border-primary-dark/30 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-primary dark:text-primary-dark shrink-0 mt-0.5" />
                  <p className="text-xs text-text-secondary dark:text-text-secondary-dark">
                    {t("checkout.feeNote") || "The order fee is based on the service category, not the package price. This ensures fair pricing for all orders in this category."}
                  </p>
                </div>

                {/* Action Buttons - Sticky Footer */}
                <div className="flex gap-3 pt-4 sticky bottom-0 bg-linear-to-t from-background dark:from-background-dark via-background/95 dark:via-background-dark/95 to-transparent">
                  <button
                    onClick={onClose}
                    disabled={processing}
                    className="flex-1 px-6 py-3 rounded-xl border border-border dark:border-border-dark text-text-primary dark:text-text-primary-dark font-semibold hover:bg-background-secondary dark:hover:bg-background-secondary-dark transition-colors disabled:opacity-50"
                  >
                    {t("checkout.cancel") || "Cancel"}
                  </button>
                  <button
                    onClick={handleCheckout}
                    disabled={processing || userCredits < orderFee}
                    className="flex-1 px-6 py-3 rounded-xl bg-linear-to-r from-primary to-secondary text-white font-bold hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95"
                  >
                    {processing
                      ? t("checkout.processing") || "Processing..."
                      : t("checkout.confirm") || "Confirm Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
