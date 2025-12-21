// Portfolio media item
export interface PortfolioMediaItem {
  url: string;
  type: "image" | "video";
  fileName?: string;
}

// Portfolio item type for user-created portfolio entries
export interface PortfolioItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: "image" | "video" | "link" | "file" | "project";
  mediaUrl?: string; // Legacy: For backward compatibility (first media item)
  mediaItems?: PortfolioMediaItem[]; // Array of media files (images/videos)
  thumbnailUrl?: string; // For videos or large images
  linkUrl?: string; // For external links
  technologies?: string[]; // Technologies used
  category?: string; // Project category
  featured?: boolean; // Show in featured section
  isCover?: boolean; // Use as portfolio cover image/video
  order?: number; // Display order
  createdAt: Date | any;
  updatedAt: Date | any;
}

