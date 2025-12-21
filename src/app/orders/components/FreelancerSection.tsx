"use client";

import { useState } from "react";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import { FileText, Clock, Github, Upload, MessageSquare, X, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { convertTimestampToDate } from "@/service/timeUtils";
import type { Order, OrderStatus } from "@/types/order";

interface FreelancerSectionProps {
  order: Order;
  updating: boolean;
  deliveryNote: string;
  setDeliveryNote: (note: string) => void;
  onUpdateStatus: (status: OrderStatus) => Promise<void>;
  onDeliver: (type: "text" | "github" | "file", files?: string[], screenshots?: string[]) => Promise<void>;
  onAcceptRevision?: () => Promise<void>;
  onDeclineRevision?: () => Promise<void>;
}

export default function FreelancerSection({
  order,
  updating,
  deliveryNote,
  setDeliveryNote,
  onUpdateStatus,
  onDeliver,
  onAcceptRevision,
  onDeclineRevision,
}: FreelancerSectionProps) {
  const { t } = useTranslationContext();
  const [deliveryType, setDeliveryType] = useState<"text" | "github" | "file">("text");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [uploadedScreenshots, setUploadedScreenshots] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload files one by one
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file); // Use "file" (singular), not "files"
        formData.append("folderType", "orderDelivery");
        formData.append("subfolder", order.id);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await res.json();
        uploadedUrls.push(data.data.url);
      }

      setUploadedFiles((prev) => [...prev, ...uploadedUrls]);
      toast.success(t("common.uploadSuccess") || "Files uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || t("common.uploadError") || "Failed to upload files");
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (url: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f !== url));
  };

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check max 3 screenshots limit
    if (uploadedScreenshots.length + files.length > 3) {
      toast.error(t("orderDetail.maxScreenshots") || "Maximum 3 screenshots allowed");
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];
    
    try {
      // Upload screenshots one by one
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file); // Use "file" (singular), not "files"
        formData.append("folderType", "orderDelivery");
        formData.append("subfolder", order.id);

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_UPLOAD_KEY}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || "Upload failed");
        }

        const data = await res.json();
        uploadedUrls.push(data.data.url);
      }

      setUploadedScreenshots((prev) => [...prev, ...uploadedUrls]);
      toast.success(t("common.uploadSuccess") || "Screenshots uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || t("common.uploadError") || "Failed to upload screenshots");
    } finally {
      setUploading(false);
    }
  };

  const removeScreenshot = (url: string) => {
    setUploadedScreenshots((prev) => prev.filter((f) => f !== url));
  };

  const handleSubmitDelivery = async () => {
    if (deliveryType === "file" && uploadedFiles.length === 0) {
      toast.error(t("orderDetail.pleaseUploadFiles") || "Please upload at least one file");
      return;
    }
    if (deliveryType === "file" && uploadedScreenshots.length === 0) {
      toast.error(t("orderDetail.pleaseUploadScreenshots") || "Please upload at least one screenshot");
      return;
    }
    if (!deliveryNote.trim()) {
      toast.error(t("orderDetail.pleaseEnterDelivery") || "Please enter delivery information");
      return;
    }
    
    // For file delivery, pass screenshots as third parameter
    if (deliveryType === "file") {
      await onDeliver(deliveryType, uploadedFiles, uploadedScreenshots);
    } else {
      await onDeliver(deliveryType, uploadedFiles);
    }
  };

  return (
    <div className="border border-border rounded-xl bg-background-secondary p-6 space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-text-primary">
          {order.status === "pending"
            ? t("orderDetail.acceptOrder") || "Accept Order"
            : t("orderDetail.deliverWork") || "Deliver Work"}
        </h2>
      </div>

      {/* Step 1: Accept Order (Pending) */}
      {order.status === "pending" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t("orderDetail.acceptOrderDesc") ||
              "Review the order details and accept to start working on it."}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onUpdateStatus("accepted")}
              disabled={updating}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {updating
                ? t("common.processing") || "Processing..."
                : t("orderDetail.acceptOrder") || "Accept Order"}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Start Work (Accepted) */}
      {order.status === "accepted" && (
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            {t("orderDetail.startWorkDesc") ||
              "Click below to start working on this order."}
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => onUpdateStatus("in_progress")}
              disabled={updating}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {updating
                ? t("common.processing") || "Processing..."
                : t("orderDetail.startWork") || "Start Work"}
            </button>
          </div>
        </div>
      )}

      {/* Revision Request Handling - Show when revisionPending is true (regardless of status) */}
      {order.revisionPending && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {t("orderDetail.revisionRequested") || "Revision Requested"}
            </p>
            <p className="text-xs text-amber-600 mt-2">
              {t("orderDetail.revisionRequestedDesc") || "The client has requested revisions. Please review and accept or decline."}
            </p>
          </div>

          {/* Show latest revision request */}
          {order.revisionRequests && order.revisionRequests.length > 0 && (
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-sm font-medium text-text-primary mb-2">
                {t("orderDetail.latestRevision") || "Latest Revision Request"}
              </p>
              {(() => {
                const latestRequest = order.revisionRequests[order.revisionRequests.length - 1];
                return (
                  <div className="space-y-2">
                    <p className="text-xs text-text-secondary">
                      {t("orderDetail.requestedAt") || "Requested at"}: {convertTimestampToDate(latestRequest.requestedAt).toLocaleString()}
                    </p>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-900 font-medium mb-1">
                        {t("orderDetail.revisionReason") || "Reason"}
                      </p>
                      <p className="text-sm text-amber-800">{latestRequest.reason}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={onDeclineRevision}
              disabled={updating || !onDeclineRevision}
              className="px-6 py-2.5 rounded-lg border border-error text-error font-medium hover:bg-error/10 transition-all disabled:opacity-50"
            >
              {updating
                ? t("common.processing") || "Processing..."
                : t("orderDetail.declineRevision") || "Decline Revision"}
            </button>
            <button
              onClick={onAcceptRevision}
              disabled={updating || !onAcceptRevision}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
            >
              {updating
                ? t("common.processing") || "Processing..."
                : t("orderDetail.acceptRevision") || "Accept Revision"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Submit Delivery (In Progress) - Only show when no revision is pending */}
      {order.status === "in_progress" && !order.revisionPending && (
        <div className="space-y-4">
          {/* Delivery Type Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t("orderDetail.deliveryType") || "Delivery Type"}
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => setDeliveryType("text")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  deliveryType === "text"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <MessageSquare className="w-6 h-6" />
                <span className="text-sm font-medium">{t("orderDetail.textDelivery") || "Text"}</span>
              </button>
              <button
                onClick={() => setDeliveryType("github")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  deliveryType === "github"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Github className="w-6 h-6" />
                <span className="text-sm font-medium">{t("orderDetail.githubDelivery") || "GitHub"}</span>
              </button>
              <button
                onClick={() => setDeliveryType("file")}
                className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  deliveryType === "file"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm font-medium">{t("orderDetail.fileDelivery") || "Files"}</span>
              </button>
            </div>
          </div>

          {/* Delivery Content Based on Type */}
          {deliveryType === "text" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("orderDetail.deliveryMessage") || "Delivery Message"}
              </label>
              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder={t("orderDetail.deliveryMessagePlaceholder") || "Write your delivery message..."}
              />
            </div>
          )}

          {deliveryType === "github" && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {t("orderDetail.githubLink") || "GitHub Repository Link"}
              </label>
              <input
                type="url"
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder="https://github.com/username/repo"
              />
            </div>
          )}

          {deliveryType === "file" && (
            <div className="space-y-3">
              {/* Screenshots Section */}
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("orderDetail.uploadScreenshots") || "Upload Screenshots (Max 3)"} *
                </label>
                <p className="text-xs text-text-secondary mb-3">
                  {t("orderDetail.screenshotsHelp") || "Upload screenshots to show the work and proof of completion"}
                </p>
                <div className="border-2 border-dashed border-primary/50 rounded-lg p-6 text-center bg-white/50">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm text-text-secondary mb-3">
                    {t("orderDetail.dragScreenshots") || "Click to upload screenshots"}
                  </p>
                  <label className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white cursor-pointer hover:bg-primary/90 transition-all">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleScreenshotUpload}
                      disabled={uploading || uploadedScreenshots.length >= 3}
                      className="hidden"
                    />
                    {uploading ? t("common.uploading") || "Uploading..." : t("common.selectFiles") || "Select Images"}
                  </label>
                  <p className="text-xs text-text-secondary mt-2">
                    {uploadedScreenshots.length} / 3 {t("common.uploaded") || "uploaded"}
                  </p>
                </div>

                {uploadedScreenshots.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium text-text-primary">
                      {t("orderDetail.screenshotPreview") || "Screenshot Preview"}
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {uploadedScreenshots.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`Screenshot ${idx + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-border"
                          />
                          <button
                            onClick={() => removeScreenshot(url)}
                            className="absolute top-1 right-1 p-1 bg-error text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Original Files Section */}
              <div className="p-4 rounded-lg border border-border bg-background">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("orderDetail.uploadFiles") || "Upload Original Files"} *
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-text-secondary" />
                  <p className="text-sm text-text-secondary mb-3">
                    {t("orderDetail.uploadFilesDesc") || "Click to upload your work files"}
                  </p>
                  <label className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white cursor-pointer hover:bg-primary/90 transition-all">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    {uploading ? t("common.uploading") || "Uploading..." : t("common.selectFiles") || "Select Files"}
                  </label>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium text-text-primary">
                      {t("common.uploadedFiles") || "Uploaded Files"} ({uploadedFiles.length})
                    </p>
                    {uploadedFiles.map((url, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-background border border-border rounded-lg">
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate flex-1">
                          {url.split("/").pop()}
                        </a>
                        <button
                          onClick={() => removeFile(url)}
                          className="ml-2 p-1 hover:bg-error/10 rounded text-error transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <textarea
                value={deliveryNote}
                onChange={(e) => setDeliveryNote(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-border rounded-lg bg-background focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                placeholder={t("orderDetail.additionalNotes") || "Additional notes or instructions..."}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={handleSubmitDelivery}
              disabled={updating || uploading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-medium hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-50"
            >
              {updating ? t("common.submitting") || "Submitting..." : t("orderDetail.sendDelivery") || "Send Delivery"}
            </button>
          </div>
        </div>
      )}


      {/* Step 4: Awaiting Client Review (Delivered) */}
      {order.status === "delivered" && !order.revisionPending && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t("orderDetail.awaitingClientReview") || "Awaiting client review"}
            </p>
          </div>
          
          {/* Show delivery content */}
          {order.deliveryType === "file" && order.deliveryScreenshots && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-text-primary">
                {t("orderDetail.deliveryScreenshots") || "Screenshots"}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {order.deliveryScreenshots.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img
                      src={url}
                      alt={`Screenshot ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border cursor-pointer hover:border-primary transition-colors"
                      onClick={() => window.open(url, "_blank")}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {order.delivery && (
            <div className="p-4 bg-background border border-border rounded-lg">
              <p className="text-sm font-medium text-text-primary mb-2">
                {order.deliveryType === "github" 
                  ? t("orderDetail.githubLink") || "GitHub Link"
                  : t("orderDetail.deliveryMessage") || "Delivery Message"}
              </p>
              {order.deliveryType === "github" ? (
                <a href={order.delivery} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                  {order.delivery}
                </a>
              ) : (
                <p className="text-sm text-text-secondary whitespace-pre-wrap">{order.delivery}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
