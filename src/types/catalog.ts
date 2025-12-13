export type CatalogStatus = "draft" | "published";

export interface CatalogPackage {
  name: string; // e.g., Basic | Standard | Premium
  price: number;
  deliveryDays: number;
  features: string[];
  revisionLimit?: number;
}

export interface Catalog {
  id: string;
  ownerId: string;
  title: string;
  description: string;
  images: string[];
  category: string;
  tags: string[];
  packages: CatalogPackage[];
  status: CatalogStatus;
  rating?: number;
  createdAt?: Record<string, unknown>;
  updatedAt?: Record<string, unknown>;
}
