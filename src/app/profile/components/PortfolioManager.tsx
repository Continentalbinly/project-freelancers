"use client";

import { useState, useEffect } from "react";
import { requireDb } from "@/service/firebase";
import { collection, query, where, orderBy, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import { toast } from "react-toastify";
import { useTranslationContext } from "@/app/components/LanguageProvider";
import type { PortfolioItem } from "@/types/portfolio";
import { Plus, Edit2, Trash2, X, Save, Star, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import PortfolioMultipleUpload from "./PortfolioMultipleUpload";
import type { PortfolioMediaItem } from "@/types/portfolio";

interface PortfolioManagerProps {
  userId: string;
  isOwner: boolean;
}

interface UploadedFile {
  url: string;
  type: "image" | "video";
  fileName: string;
}

export default function PortfolioManager({ userId, isOwner }: PortfolioManagerProps) {
  const { t } = useTranslationContext();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    uploadedFiles: [] as UploadedFile[],
  });
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    uploadedFiles: [] as UploadedFile[],
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [cardMediaIndices, setCardMediaIndices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    loadPortfolio();
  }, [userId]);

  const loadPortfolio = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let q;
      try {
        q = query(
          collection(requireDb(), "portfolio"),
          where("userId", "==", userId),
          orderBy("order", "asc"),
          orderBy("createdAt", "desc")
        );
      } catch (error: unknown) {
        const firestoreError = error as { code?: string };
        if (firestoreError?.code === "failed-precondition") {
          q = query(
            collection(requireDb(), "portfolio"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
          );
        } else {
          throw error;
        }
      }
      const snap = await getDocs(q);
      const portfolioItems = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PortfolioItem[];
      setItems(portfolioItems);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (files: UploadedFile[]) => {
    setFormData(prev => ({ ...prev, uploadedFiles: files }));
  };

  const handleSave = async () => {
    if (!formData.title || !formData.description) {
      toast.error(t("profile.portfolio.requiredFields") || "Please fill in all required fields");
      return;
    }

    if (formData.uploadedFiles.length === 0) {
      toast.error(t("profile.portfolio.upload.required") || "Please upload at least one image or video");
      return;
    }

    try {
      const isFirstPortfolio = items.length === 0;
      
      // Convert uploaded files to media items
      const mediaItems: PortfolioMediaItem[] = formData.uploadedFiles.map(file => ({
        url: file.url,
        type: file.type,
        fileName: file.fileName,
      }));

      // Determine the main type (first file's type)
      const mainType = formData.uploadedFiles[0].type;
      // Use first media item URL for backward compatibility
      const firstMediaUrl = formData.uploadedFiles[0].url;

      // Create a single portfolio item with all media files
      await addDoc(collection(requireDb(), "portfolio"), {
        title: formData.title,
        description: formData.description,
        type: mainType,
        mediaUrl: firstMediaUrl, // For backward compatibility
        mediaItems: mediaItems, // Array of all media files
        userId,
        order: items.length,
        isCover: isFirstPortfolio, // First portfolio becomes cover
        featured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      toast.success(t("profile.portfolio.added") || "Portfolio item added");
      setShowAddModal(false);
      setFormData({
        title: "",
        description: "",
        uploadedFiles: [],
      });
      loadPortfolio();
    } catch {
      // Silent fail
      toast.error(t("common.error") || "Failed to save portfolio item");
    }
  };

  const handleSetCover = async (id: string) => {
    try {
      const batch = writeBatch(requireDb());
      // Unset all other covers
      items.forEach(item => {
        if (item.isCover) {
          batch.update(doc(requireDb(), "portfolio", item.id), {
            isCover: false,
            updatedAt: serverTimestamp(),
          });
        }
      });
      // Set new cover
      batch.update(doc(requireDb(), "portfolio", id), {
        isCover: true,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      toast.success(t("profile.portfolio.coverSet") || "Cover image set successfully");
      loadPortfolio();
    } catch {
      // Silent fail
      toast.error(t("common.error") || "Failed to set cover");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("profile.portfolio.confirmDelete") || "Are you sure you want to delete this item?")) return;
    
    try {
      await deleteDoc(doc(requireDb(), "portfolio", id));
      toast.success(t("profile.portfolio.deleted") || "Portfolio item deleted");
      loadPortfolio();
    } catch {
      // Silent fail
      toast.error(t("common.error") || "Failed to delete portfolio item");
    }
  };

  const portfolioItems = items
    .filter(item => {
      // Filter items that have media (either legacy mediaUrl or new mediaItems)
      const hasMedia = item.mediaUrl || (item.mediaItems && item.mediaItems.length > 0);
      return hasMedia && (item.type === "image" || item.type === "video");
    })
    .sort((a, b) => {
      // Sort: cover first, then by order/createdAt
      if (a.isCover && !b.isCover) return -1;
      if (!a.isCover && b.isCover) return 1;
      return (a.order || 0) - (b.order || 0);
    });

  // Auto-carousel for portfolio cards
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    portfolioItems.forEach((item) => {
      // Get media items inline to avoid dependency issues
      const mediaItems: PortfolioMediaItem[] = item.mediaItems && item.mediaItems.length > 0
        ? item.mediaItems
        : item.mediaUrl
        ? [{ url: item.mediaUrl, type: item.type as "image" | "video" }]
        : [];
      
      if (mediaItems.length > 1) {
        const interval = setInterval(() => {
          setCardMediaIndices((prev) => {
            const currentIndex = prev[item.id] || 0;
            const nextIndex = (currentIndex + 1) % mediaItems.length;
            return { ...prev, [item.id]: nextIndex };
          });
        }, 3000); // Change image every 3 seconds
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(interval => clearInterval(interval));
    };
  }, [portfolioItems]);

  const handleCardClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      uploadedFiles: [],
    });
    setEditingItem(null);
    setCurrentMediaIndex(0);
    setShowDetailModal(true);
  };

  // Keyboard navigation for carousel
  useEffect(() => {
    if (!showDetailModal || !selectedItem) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Get media items inline to avoid dependency issues
      const mediaItems: PortfolioMediaItem[] = selectedItem.mediaItems && selectedItem.mediaItems.length > 0
        ? selectedItem.mediaItems
        : selectedItem.mediaUrl
        ? [{ url: selectedItem.mediaUrl, type: selectedItem.type as "image" | "video" }]
        : [];
      
      if (mediaItems.length <= 1) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentMediaIndex((prev) => 
          prev === 0 ? mediaItems.length - 1 : prev - 1
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentMediaIndex((prev) => 
          prev === mediaItems.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDetailModal, selectedItem]);

  // Get media items for display
  const getMediaItems = (item: PortfolioItem): PortfolioMediaItem[] => {
    if (item.mediaItems && item.mediaItems.length > 0) {
      return item.mediaItems;
    }
    // Fallback to legacy mediaUrl
    if (item.mediaUrl) {
      return [{
        url: item.mediaUrl,
        type: item.type as "image" | "video",
      }];
    }
    return [];
  };

  const handleEditClick = (item: PortfolioItem) => {
    setEditingItem(item);
    setEditFormData({
      title: item.title,
      description: item.description,
      uploadedFiles: [],
    });
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  const handleEditUploadComplete = (files: UploadedFile[]) => {
    setEditFormData(prev => ({ ...prev, uploadedFiles: files }));
  };

  const handleEditSave = async () => {
    if (!editingItem || !editFormData.title || !editFormData.description) {
      toast.error(t("profile.portfolio.requiredFields") || "Please fill in all required fields");
      return;
    }

    try {
      // Update title and description
      await updateDoc(doc(requireDb(), "portfolio", editingItem.id), {
        title: editFormData.title,
        description: editFormData.description,
        updatedAt: serverTimestamp(),
      });

      // If new files were uploaded, add them to existing mediaItems
      if (editFormData.uploadedFiles.length > 0) {
        const existingMediaItems: PortfolioMediaItem[] = editingItem.mediaItems || [];
        const newMediaItems: PortfolioMediaItem[] = editFormData.uploadedFiles.map(file => ({
          url: file.url,
          type: file.type,
          fileName: file.fileName,
        }));
        
        const updatedMediaItems = [...existingMediaItems, ...newMediaItems];
        const firstMediaUrl = updatedMediaItems[0]?.url || editingItem.mediaUrl || "";

        await updateDoc(doc(requireDb(), "portfolio", editingItem.id), {
          mediaItems: updatedMediaItems,
          mediaUrl: firstMediaUrl, // Update for backward compatibility
          updatedAt: serverTimestamp(),
        });
      }

      toast.success(t("profile.portfolio.updated") || "Portfolio item updated");
      setShowEditModal(false);
      setEditingItem(null);
      setEditFormData({
        title: "",
        description: "",
        uploadedFiles: [],
      });
      loadPortfolio();
    } catch {
      // Silent fail
      toast.error(t("common.error") || "Failed to update portfolio item");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-text-primary">
          {t("profile.portfolio.title") || "Portfolio"}
        </h3>
        {isOwner && (
          <button
            onClick={() => {
              setFormData({
                title: "",
                description: "",
                uploadedFiles: [],
              });
              setShowAddModal(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("profile.portfolio.addItem") || "Add Portfolio"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 border border-border rounded-xl bg-background-secondary">
          <Briefcase className="w-20 h-20 text-text-secondary mx-auto mb-4" />
          <p className="text-text-secondary text-lg">
            {isOwner
              ? t("profile.portfolio.empty") || "No portfolio items yet. Add your first item!"
              : t("profile.portfolio.emptyPublic") || "No portfolio items to display"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="group relative border border-border rounded-xl overflow-hidden bg-background-secondary hover:shadow-xl transition-all cursor-pointer"
              onClick={() => handleCardClick(item)}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                {(() => {
                  const mediaItems = getMediaItems(item);
                  const currentIndex = cardMediaIndices[item.id] || 0;
                  
                  if (mediaItems.length === 0) return null;
                  
                  return (
                    <div className="relative w-full h-full">
                      {mediaItems.map((media, index) => {
                        const isActive = index === currentIndex;
                        const isNext = index === (currentIndex + 1) % mediaItems.length;
                        const isPrev = index === (currentIndex - 1 + mediaItems.length) % mediaItems.length;
                        
                        let translateX = "100%"; // Start from right
                        let zIndex = 0;
                        
                        if (isActive) {
                          translateX = "0%";
                          zIndex = 10;
                        } else if (isNext) {
                          translateX = "100%";
                          
                          zIndex = 5;
                        } else if (isPrev) {
                          translateX = "-100%";
                          
                          zIndex = 5;
                        } else {
                          translateX = "100%";
                          zIndex = 1;
                        }
                        
                        return (
                          <div
                            key={`${item.id}-${index}`}
                            className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                              isActive ? "z-10" : "z-0"
                            }`}
                            style={{
                              transform: `translateX(${translateX})`,
                            }}
                          >
                            {media.type === "video" ? (
                              <video
                                src={media.url}
                                className="w-full h-full object-cover"
                                preload="metadata"
                                playsInline
                                muted
                              />
                            ) : (
                              <img
                                src={media.url}
                                alt={`${item.title} - ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all z-20" />
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-text-primary mb-1 line-clamp-1">{item.title}</h4>
                <p className="text-sm text-text-secondary line-clamp-2">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Detail Modal */}
      {showDetailModal && selectedItem && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => {
            setShowDetailModal(false);
            setSelectedItem(null);
            setEditingItem(null);
            setCurrentMediaIndex(0);
          }}
        >
          <div 
            className="bg-background rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-border shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between z-10">
              <h3 className="text-2xl font-bold text-text-primary">
                {selectedItem.title}
              </h3>
              <div className="flex items-center gap-2">
                {isOwner && (
                  <>
                    <button
                      onClick={() => {
                        handleSetCover(selectedItem.id);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-text-primary"
                      title={t("profile.portfolio.setAsCover") || "Set as Cover"}
                    >
                      <Star className="w-5 h-5 text-current" />
                    </button>
                    <button
                      onClick={() => handleEditClick(selectedItem)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-text-primary"
                      title={t("common.edit") || "Edit"}
                    >
                      <Edit2 className="w-5 h-5 text-current" />
                    </button>
                    <button
                      onClick={() => {
                        const confirmed = confirm(t("profile.portfolio.confirmDelete") || "Are you sure you want to delete this item?");
                        if (confirmed) {
                          handleDelete(selectedItem.id);
                          setShowDetailModal(false);
                          setSelectedItem(null);
                        }
                      }}
                      className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
                      title={t("common.remove") || "Delete"}
                    >
                      <Trash2 className="w-5 h-5 text-current" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedItem(null);
                    setEditingItem(null);
                    setCurrentMediaIndex(0);
                  }}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors text-text-primary"
                >
                  <X className="w-5 h-5 text-current" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Media Carousel */}
              {(() => {
                const mediaItems = getMediaItems(selectedItem);
                if (mediaItems.length === 0) return null;

                return (
                  <div className="relative rounded-xl overflow-hidden bg-black mb-6">
                    <div className="aspect-video w-full relative">
                      {mediaItems[currentMediaIndex].type === "video" ? (
                        <video
                          src={mediaItems[currentMediaIndex].url}
                          controls
                          className="w-full h-full object-contain"
                          autoPlay
                        />
                      ) : (
                        <img
                          src={mediaItems[currentMediaIndex].url}
                          alt={`${selectedItem.title} - ${currentMediaIndex + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                      
                      {/* Navigation arrows */}
                      {mediaItems.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMediaIndex((prev) => 
                                prev === 0 ? mediaItems.length - 1 : prev - 1
                              );
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                            aria-label="Previous"
                          >
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCurrentMediaIndex((prev) => 
                                prev === mediaItems.length - 1 ? 0 : prev + 1
                              );
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                            aria-label="Next"
                          >
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </>
                      )}
                    </div>
                    
                    {/* Media indicators and counter container */}
                    {mediaItems.length > 1 && (
                      <div className="absolute bottom-4 left-0 right-0 flex items-center justify-between px-4 z-20">
                        {/* Media indicators - centered */}
                        <div className="flex-1 flex justify-center">
                          <div className="flex gap-2">
                            {mediaItems.map((_, index) => (
                              <button
                                key={index}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentMediaIndex(index);
                                }}
                                className={`h-2 rounded-full transition-all ${
                                  index === currentMediaIndex
                                    ? "w-8 bg-primary"
                                    : "w-2 bg-white/50 hover:bg-white/70"
                                }`}
                                aria-label={`Go to media ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Media counter - positioned at bottom-right to avoid header conflict */}
                        <div className="bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                          {currentMediaIndex + 1} / {mediaItems.length}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    {t("profile.portfolio.title") || "Title"}
                  </h4>
                  <p className="text-text-primary">{selectedItem.title}</p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-text-primary mb-2">
                    {t("profile.portfolio.description") || "Description"}
                  </h4>
                  <p className="text-text-secondary whitespace-pre-wrap">{selectedItem.description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Portfolio Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">
                {t("profile.portfolio.addItem") || "Add Portfolio"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    title: "",
                    description: "",
                    uploadedFiles: [],
                  });
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-text-primary"
              >
                <X className="w-5 h-5 text-current" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.portfolio.title") || "Title"} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
                  placeholder={t("profile.portfolio.titlePlaceholder") || "Enter title"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.portfolio.description") || "Description"} *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-text-primary"
                  placeholder={t("profile.portfolio.descriptionPlaceholder") || "Enter description"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  {t("profile.portfolio.upload.uploadMedia") || "Upload Images & Videos"} *
                </label>
                <PortfolioMultipleUpload
                  onUploadComplete={handleUploadComplete}
                  disabled={false}
                />
                {formData.uploadedFiles.length > 0 && (
                  <p className="mt-2 text-xs text-text-secondary">
                    {t("profile.portfolio.upload.firstItemCover") || "The first item will be set as the portfolio cover"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={formData.uploadedFiles.length === 0}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-white"
              >
                <Save className="w-4 h-4" />
                {t("common.save") || "Save"}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormData({
                    title: "",
                    description: "",
                    uploadedFiles: [],
                  });
                }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-white/20 transition-colors text-text-primary bg-background"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Portfolio Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">
                {t("profile.portfolio.editItem") || "Edit Portfolio"}
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditFormData({
                    title: "",
                    description: "",
                    uploadedFiles: [],
                  });
                }}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-text-primary"
              >
                <X className="w-5 h-5 text-current" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.portfolio.title") || "Title"} *
                </label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-text-primary"
                  placeholder={t("profile.portfolio.titlePlaceholder") || "Enter title"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {t("profile.portfolio.description") || "Description"} *
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-background text-text-primary"
                  placeholder={t("profile.portfolio.descriptionPlaceholder") || "Enter description"}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  {t("profile.portfolio.upload.addMoreMedia") || "Add More Images & Videos (Optional)"}
                </label>
                <PortfolioMultipleUpload
                  onUploadComplete={handleEditUploadComplete}
                  disabled={false}
                />
                {editFormData.uploadedFiles.length > 0 && (
                  <p className="mt-2 text-xs text-text-secondary">
                    {t("profile.portfolio.upload.newFilesNote") || "New files will be added as separate portfolio items"}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleEditSave}
                className="flex-1 btn btn-primary flex items-center justify-center gap-2 text-white"
              >
                <Save className="w-4 h-4" />
                {t("common.save") || "Save"}
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingItem(null);
                  setEditFormData({
                    title: "",
                    description: "",
                    uploadedFiles: [],
                  });
                }}
                className="px-6 py-2 border border-border rounded-lg hover:bg-white/20 transition-colors text-text-primary bg-background"
              >
                {t("common.cancel") || "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
