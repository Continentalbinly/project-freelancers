export type PackageTier = {
  id?: string;
  name: string;
  price: number;
  deliveryDays: number;
  features: string[];
  revisionLimit?: number;
};

export type CatalogForm = {
  title: string;
  description: string;
  categoryId: string;
  category?: { id: string; name_en?: string; name_lo?: string } | null;
  tags: string[];
  images: string[];
  packages: PackageTier[];
};
